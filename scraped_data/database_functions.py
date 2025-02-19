import logging
import os
import sqlite3
import re

from django.db import connections

logger = logging.getLogger("database")

SCRAPED_DATA_DATABASE = "scraped_data"


def check_database_file_integrity(db_file_path):
    if not os.path.exists(db_file_path):
        logger.info(f"Database file {db_file_path} not found. Creating it...")
        conn = sqlite3.connect(db_file_path)
        conn.close()
    else:
        logger.debug(f"Database file {db_file_path} already exists.")


def validate_identifier(identifier):
    """
    Only allows alphanumeric characters, underscores, and hyphens,
    starting with a letter, underscore, or a number, but not a hyphen.
    It also does not allow consecutive hyphens (--).
    """
    # Check if identifier starts with a hyphen or contains consecutive hyphens
    identifier = str(identifier)
    if not re.match(r"^[a-zA-Z0-9_][a-zA-Z0-9_-]*$", identifier) or "--" in identifier:
        raise ValueError(f"Invalid identifier: {identifier}")
    return identifier


def get_db_engine():
    """
    Returns the current database engine used in the Django connection.
    """
    db_engine = connections[SCRAPED_DATA_DATABASE].vendor
    if db_engine == "sqlite" or db_engine == "postgresql":
        return db_engine
    raise ValueError(f"Unsupported database engine: {db_engine}")


def check_table_existence(table_name, db_engine):
    table_exists = None
    with connections[SCRAPED_DATA_DATABASE].cursor() as cursor:
        if db_engine == "sqlite":
            cursor.execute(
                f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table_name}';",
            )
            table_exists = cursor.fetchone()
        elif db_engine == "postgresql":
            cursor.execute(
                "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = %s);",
                [table_name],
            )
            table_exists = cursor.fetchone()[0]
        return table_exists


def check_table_integrity(table_name, db_engine):
    table_exists = check_table_existence(table_name, db_engine)
    if not table_exists:
        logger.debug(f"Creating table: {table_name}")
        with connections[SCRAPED_DATA_DATABASE].cursor() as cursor:
            cursor.execute(
                f"""
                CREATE TABLE "{table_name}" (
                    id INTEGER PRIMARY KEY AUTOINCREMENT
                );
                """
            )


def get_project_table_name(project_id):
    return f"project_{validate_identifier(project_id)}"


def check_database_table_integrity(table_name):
    check_database_file_integrity(SCRAPED_DATA_DATABASE)
    db_engine = get_db_engine()
    check_table_integrity(table_name, db_engine)


def prepare_table(project_id, cols):
    table_name = get_project_table_name(project_id)
    check_database_table_integrity(table_name)
    db_engine = get_db_engine()
    # Validate and prepare column names
    cols_names = [validate_identifier(col) for col in cols]

    # Get the database engine

    logger.debug(f"Preparing table: {table_name}")
    # Fetch existing columns based on the database engine
    with connections[SCRAPED_DATA_DATABASE].cursor() as cursor:
        existing_columns = []
        if db_engine == "sqlite":
            cursor.execute(f'PRAGMA table_info("{table_name}");')
            existing_columns = [
                row[1] for row in cursor.fetchall()
            ]  # Row[1] is column name
        elif db_engine == "postgresql":
            cursor.execute(
                "SELECT column_name FROM information_schema.columns WHERE table_name = %s;",
                [table_name],
            )
            existing_columns = [row[0] for row in cursor.fetchall()]

        # Add new columns only if they do not already exist
        for col in cols_names:
            if col not in existing_columns:
                logger.debug(f"Adding col '{col}' to the table {table_name}")
                cursor.execute(
                    f'ALTER TABLE "{table_name}" ADD COLUMN "{col}" TEXT DEFAULT NULL;'
                )

        # dropping columns which are suppose to be deleted
        columns_to_drop = [
            col for col in existing_columns if col not in cols_names and col != "id"
        ]
        if columns_to_drop:
            logger.debug(
                f"Dropping '{', '.join(columns_to_drop)}' from the table {table_name}"
            )
            new_table_name = f"{table_name}_new"

            columns_to_keep = [
                f'"{col}"' for col in existing_columns if col not in columns_to_drop
            ]

            create_table_sql = f'CREATE TABLE "{new_table_name}" AS SELECT id, {", ".join(columns_to_keep)} FROM "{table_name}";'
            cursor.execute(create_table_sql)

            cursor.execute(f'DROP TABLE "{table_name}";')

            cursor.execute(f'ALTER TABLE "{new_table_name}" RENAME TO "{table_name}";')


def save_data_to_db(project_id, rows):
    """
    Inserts multiple rows into the specified table.

    Parameters:
    - table_name: The name of the table to insert data into.
    - rows: A list of dictionaries representing rows. Keys are column names.
    """
    # Validate the table name
    table_name = get_project_table_name(project_id)
    # Ensure rows is not empty
    if not rows:
        logger.error("No rows provided for insertion.")
        raise ValueError("No rows provided for insertion.")

    # Get column names from the first row (assumes all rows have the same structure)
    columns = rows[0].keys()
    # Validate column names
    columns = [validate_identifier(col) for col in columns]

    # Prepare placeholders and values
    placeholders = ", ".join(
        ["%s" if get_db_engine() == "postgresql" else "?"] * len(columns)
    )

    values = [tuple(row[col] for col in columns) for row in rows]

    column_names = ", ".join([f'"{col}"' for col in columns])

    # Construct the SQL query
    sql = f'INSERT INTO "{table_name}" ({column_names}) VALUES ({placeholders})'
    logger.debug("Prepared query for entering scraped data: \n %s \n", sql)
    logger.debug("For values: \n %s", ", ".join(str(value) for value in values))
    with connections[SCRAPED_DATA_DATABASE].cursor() as cursor:
        cursor.executemany(sql, values)


def get_data(project_id, limit_rows=None):
    table_name = get_project_table_name(project_id)
    check_database_table_integrity(table_name)

    sql = f'SELECT * FROM "{table_name}"'

    if limit_rows is not None:
        if not isinstance(limit_rows, int) or limit_rows <= 0:
            raise ValueError("limit_rows must be a positive integer.")
        sql += f" LIMIT {limit_rows}"
    sql += ";"
    logger.debug(f"Getting data: {sql}")

    with connections[SCRAPED_DATA_DATABASE].cursor() as cursor:
        cursor.execute(sql)  # Execute the query
        data = cursor.fetchall()  # Fetch all results

    return data


def remove_duplicates_based_on_cols(project_id, cols):
    table_name = get_project_table_name(project_id)
    cols_names = [validate_identifier(col) for col in cols]

    db_engine = get_db_engine()

    if db_engine == "sqlite":
        remove_duplicates_sql = f"""
        DELETE FROM "{table_name}" 
        WHERE id NOT IN (
            SELECT MAX(id)
            FROM "{table_name}"
            GROUP BY {", ".join(f'"{col}"' for col in cols_names)}
        );
        """
    elif db_engine == "postgresql":
        remove_duplicates_sql = f"""
        WITH CTE AS (
            SELECT 
                id,
                ROW_NUMBER() OVER (PARTITION BY {", ".join(f'"{col}"' for col in cols_names)} ORDER BY id DESC) AS row_num
            FROM "{table_name}"
        )
        DELETE FROM "{table_name}"
        WHERE id IN (
            SELECT id FROM CTE WHERE row_num > 1
        );
        """

    with connections[SCRAPED_DATA_DATABASE].cursor() as cursor:
        logger.debug(f"Removing duplicates: \n{remove_duplicates_sql}")
        cursor.execute(remove_duplicates_sql)


def delete_project_data_table(project_id):
    table_name = get_project_table_name(project_id)
    db_engine = get_db_engine()

    table_name = get_project_table_name(project_id)
    db_engine = get_db_engine()
    table_exists = check_table_existence(table_name, db_engine)

    if not table_exists:
        logger.debug(f"Table '{table_name}' does not exist. Skipping deletion.")
        return

    logger.debug(f"Dropping table '{table_name}'")
    drop_table = f'DROP TABLE "{table_name}";'

    with connections[SCRAPED_DATA_DATABASE].cursor() as cursor:
        cursor.execute(drop_table)


def delete_all_scraped_data(project_id):
    table_name = get_project_table_name(project_id)
    db_engine = get_db_engine()
    table_exists = check_table_existence(table_name, db_engine)

    if table_exists:
        with connections[SCRAPED_DATA_DATABASE].cursor() as cursor:
            delete_table_data = f'DELETE FROM "{table_name}";'

            cursor.execute(delete_table_data)
            table_exists = cursor.fetchone()


def get_column_ids(project_id):
    table_name = get_project_table_name(project_id)
    db_engine = get_db_engine()

    if db_engine == "sqlite":
        column_names_sql = f'PRAGMA table_info("{table_name}")'
    elif db_engine == "postgresql":
        column_names_sql = f"SELECT column_name FROM information_schema.columns WHERE table_name = '{table_name}'"
    else:
        return []

    with connections[SCRAPED_DATA_DATABASE].cursor() as cursor:
        cursor.execute(column_names_sql)
        columns = cursor.fetchall()
    return [col[1] for col in columns]


def get_data_in_chunks(project_id, chunk_size=10000, offset=0):
    table_name = get_project_table_name(project_id)

    while True:
        sql = f'SELECT * FROM "{table_name}" LIMIT {chunk_size} OFFSET {offset};'
        with connections[SCRAPED_DATA_DATABASE].cursor() as cursor:
            cursor.execute(sql)
            data = cursor.fetchall()

        if not data:
            break

        yield data
        offset += chunk_size
