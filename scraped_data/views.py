from django.shortcuts import render, get_object_or_404
from django.views import View
from projects.models import Project
from scraped_data.database_functions import get_data, remove_duplicates_based_on_cols
from webscraper.decorators import turbo_stream_response


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
            return render(  # add failure toast message if no column is chosen
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
