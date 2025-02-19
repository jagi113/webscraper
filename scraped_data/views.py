from django.shortcuts import render, get_object_or_404
from django.views import View
from projects.models import Project
from scraped_data.database_functions import (
    get_data,
    remove_duplicates_based_on_cols,
    delete_all_scraped_data,
)
from webscraper.decorators import turbo_stream_response

from django.http import JsonResponse


# Create your views here.
class ShowDataView(View):
    def get(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)
        data = get_data(project.id)

        return render(
            request,
            "scraped_data/show_data.html",
            {
                "project": project,
                "fields": project.fields["fields"].values(),
                "data": data,
            },
        )


class RemoveDuplicatesView(View):
    @turbo_stream_response
    def post(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)
        selected_field_ids = request.POST.getlist("fields[]")
        if selected_field_ids == []:
            data = get_data(project.id)
            return render(
                request,
                "scraped_data/partial/_data_table.html",
                {
                    "project": project,
                    "fields": project.fields["fields"].values(),
                    "data": data,
                },
            )

        remove_duplicates_based_on_cols(project.id, selected_field_ids)
        data = get_data(project.id)

        return render(
            request,
            "scraped_data/partial/_data_table.html",
            {
                "project": project,
                "fields": project.fields["fields"].values(),
                "data": data,
            },
        )


class DeleteAllScrapedData(View):
    @turbo_stream_response
    def post(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)

        delete_all_scraped_data(project.id)
        data = get_data(project.id)

        return render(
            request,
            "scraped_data/partial/_data_table.html",
            {
                "project": project,
                "fields": project.fields["fields"].values(),
                "data": data,
            },
        )


class DownloadAllDataAsExcelFile(View):
    @turbo_stream_response
    def post(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)
        header_map = {
            col["id"]: col["name"] for col in project.fields["fields"].values()
        }
        print(header_map)
        # generate_async_excel_file.delay(project.name, header_map)

        return JsonResponse({"status": "processing"})
