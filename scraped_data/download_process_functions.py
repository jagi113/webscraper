from django.core.paginator import Paginator

from openpyxl import Workbook
from django.http import HttpResponse
from scraped_data.database_functions import get_column_ids, get_data_in_chunks
from projects.models import Project


def generate_all_data_as_excel_file(request, project: Project, header_map):
    db_columns = get_column_ids(project.id)
    headers = [header_map.get(col, col) for col in db_columns]

    # Prepare response
    response = HttpResponse(
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    response["Content-Disposition"] = (
        f'attachment; filename="{"_".join((project.name).split())}-data.xlsx"'
    )

    wb = Workbook(write_only=True)
    ws = wb.create_sheet(title="Data")

    ws.append(headers)

    for chunk in get_data_in_chunks(project.id):
        for row in chunk:
            ws.append(row)

    wb.save(response)
    return response
