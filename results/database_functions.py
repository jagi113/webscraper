import re
from django.db import connection


def validate_identifier(identifier):
    """
    Only allows alphanumeric characters and underscores, starting with a letter or underscore.
    """
    if not re.match(r"^[a-zA-Z_][a-zA-Z0-9_]*$", identifier):
        raise ValueError(f"Invalid identifier: {identifier}")
    return identifier


def prepare_table(table_name, cols):
    # Validate the table name
    table_name = validate_identifier(f"project_{table_name}")
    # Validate and prepare column names
    cols_names = [validate_identifier(col["id"]) for col in cols]

    with connection.cursor() as cursor:
        # Check if the table exists
        cursor.execute(
            """
            SELECT EXISTS (
                SELECT 1
                FROM information_schema.tables
                WHERE table_name = %s
            );
            """,
            [table_name],
        )
        table_exists = cursor.fetchone()[0]

        if not table_exists:
            # Use parameterized query for table creation
            cursor.execute(
                f"""
                CREATE TABLE {table_name} (
                    id SERIAL PRIMARY KEY
                );
                """
            )

        # Fetch existing columns securely
        cursor.execute(
            """
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = %s;
            """,
            [table_name],
        )
        existing_columns = [row[0] for row in cursor.fetchall()]

        # Add new columns
        for col in cols_names:
            if col not in existing_columns:
                cursor.execute(f"ALTER TABLE {table_name} ADD COLUMN {col} TEXT;")

        # Remove extra columns
        for col in existing_columns:
            if col not in cols_names and col != "id":
                cursor.execute(f"ALTER TABLE {table_name} DROP COLUMN {col};")
