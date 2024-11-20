import re
from django.db import connections


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
    db_engine = connections["scraped_data"].vendor
    if db_engine == "sqlite" or db_engine == "postgresql":
        return db_engine
    raise ValueError(f"Unsupported database engine: {db_engine}")


def prepare_table(table_name, cols):
    # Validate the table name
    table_name = f"project_{validate_identifier(table_name)}"
    print(table_name)
    # Validate and prepare column names
    cols_names = [validate_identifier(col) for col in cols]

    # Get the database engine
    db_engine = get_db_engine()

    with connections["scraped_data"].cursor() as cursor:
        # Check if the table exists based on the database engine
        if db_engine == "sqlite":
            cursor.execute(
                f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table_name}';",
            )
            table_exists = cursor.fetchone()
            print(table_exists)
        elif db_engine == "postgresql":
            cursor.execute(
                "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = %s);",
                [table_name],
            )
            table_exists = cursor.fetchone()[0]

        if not table_exists:
            # Table does not exist, create it
            cursor.execute(
                f"""
                CREATE TABLE "{table_name}" (
                    id INTEGER PRIMARY KEY AUTOINCREMENT
                );
                """
            )

        # Fetch existing columns based on the database engine
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
                cursor.execute(
                    f'ALTER TABLE "{table_name}" ADD COLUMN "{col}" TEXT DEFAULT NULL;'
                )

        # dropping columns which are suppose to be deleted
        columns_to_drop = [
            col for col in existing_columns if col not in cols_names and col != "id"
        ]
        if columns_to_drop:
            new_table_name = f"{table_name}_new"

            columns_to_keep = [
                f'"{col}"' for col in existing_columns if col not in columns_to_drop
            ]

            create_table_sql = f'CREATE TABLE "{new_table_name}" AS SELECT id, {", ".join(columns_to_keep)} FROM "{table_name}";'
            cursor.execute(create_table_sql)

            cursor.execute(f'DROP TABLE "{table_name}";')

            cursor.execute(f'ALTER TABLE "{new_table_name}" RENAME TO "{table_name}";')


def save_data_to_db(table_name, rows):
    """
    Inserts multiple rows into the specified table.

    Parameters:
    - table_name: The name of the table to insert data into.
    - rows: A list of dictionaries representing rows. Keys are column names.
    """
    # Validate the table name
    table_name = validate_identifier(table_name)

    # Ensure rows is not empty
    if not rows:
        raise ValueError("No rows provided for insertion.")

    # Get column names from the first row (assumes all rows have the same structure)
    columns = rows[0].keys()
    print(columns)
    # Validate column names
    columns = [validate_identifier(col) for col in columns]
    print(columns)

    # Prepare placeholders and values
    placeholders = ", ".join(
        ["%s" if get_db_engine() == "postgresql" else "?"] * len(columns)
    )

    values = [tuple(row[col] for col in columns) for row in rows]

    column_names = ", ".join([f'"{col}"' for col in columns])

    # Construct the SQL query
    sql = f'INSERT INTO "project_{table_name}" ({column_names}) VALUES ({placeholders})'
    print(sql)

    with connections["scraped_data"].cursor() as cursor:
        cursor.executemany(sql, values)

    print(f"Inserted {len(rows)} rows into {table_name} successfully.")


def get_data(table_name, limit_rows=None):
    table_name = validate_identifier(table_name)

    sql = f'SELECT * FROM "project_{table_name}"'

    if limit_rows is not None:
        if not isinstance(limit_rows, int) or limit_rows <= 0:
            raise ValueError("limit_rows must be a positive integer.")
        sql += f" LIMIT {limit_rows}"
    sql += ";"

    with connections["scraped_data"].cursor() as cursor:
        cursor.execute(sql)  # Execute the query
        data = cursor.fetchall()  # Fetch all results

    return data


def remove_duplicates_based_on_cols(table_name, cols):
    table_name = validate_identifier(table_name)
    cols_names = [validate_identifier(col) for col in cols]

    db_engine = get_db_engine()

    if db_engine == "sqlite":
        remove_duplicates_sql = f"""
        DELETE FROM "project_{table_name}" 
        WHERE id NOT IN (
            SELECT MIN(id)
            FROM "project_{table_name}"
            GROUP BY {", ".join(f'"{col}"' for col in cols_names)}
        );
        """
    else:
        remove_duplicates_sql = f"""
        WITH CTE AS (
            SELECT 
                id,
                ROW_NUMBER() OVER (PARTITION BY {", ".join(f'"{col}"' for col in cols_names)} ORDER BY id) AS row_num
            FROM "project_{table_name}"
        )
        DELETE FROM "project_{table_name}"
        WHERE id IN (
            SELECT id FROM CTE WHERE row_num > 1
        );
        """

    with connections["scraped_data"].cursor() as cursor:
        cursor.execute(remove_duplicates_sql)
