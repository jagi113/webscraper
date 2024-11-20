from django.shortcuts import render, get_object_or_404
from django.views import View
from projects.models import Project
from scraped_data.database_functions import get_data


# Create your views here.
class ShowData(View):
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
