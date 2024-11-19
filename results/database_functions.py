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
    if db_engine == "sqlite" or db_engine == "postgresql" or db_engine == "mysql":
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
        elif db_engine == "mysql":
            cursor.execute(
                "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = %s;",
                [table_name],
            )
            table_exists = cursor.fetchone()[0] > 0

        if not table_exists:
            # Table does not exist, create it
            cursor.execute(
                f"""
                CREATE TABLE {table_name} (
                    id INTEGER PRIMARY KEY AUTOINCREMENT
                );
                """
            )

        # Fetch existing columns based on the database engine
        if db_engine == "sqlite":
            cursor.execute(f"PRAGMA table_info({table_name});")
            existing_columns = [
                row[1] for row in cursor.fetchall()
            ]  # Row[1] is column name
        elif db_engine == "postgresql" or db_engine == "mysql":
            cursor.execute(
                "SELECT column_name FROM information_schema.columns WHERE table_name = %s;",
                [table_name],
            )
            existing_columns = [row[0] for row in cursor.fetchall()]

        # dropping columns which are suppose to be deleted
        columns_to_drop = [
            col for col in existing_columns if col not in cols_names and col != "id"
        ]
        if columns_to_drop:
            new_table_name = f"{table_name}_new"

            columns_to_keep = [
                col for col in existing_columns if col not in columns_to_drop
            ]

            create_table_sql = f"CREATE TABLE {new_table_name} AS SELECT id, {', '.join(columns_to_keep)} FROM {table_name};"
            cursor.execute(create_table_sql)

            cursor.execute(f"DROP TABLE {table_name};")

            cursor.execute(f"ALTER TABLE {new_table_name} RENAME TO {table_name};")
