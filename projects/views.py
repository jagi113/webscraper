from django.shortcuts import render, redirect
from django.views import View

from projects.forms import ProjectForm
from projects.models import Project


# Create your views here.


class ProjectsView(View):
    def get(self, request):
        projects = Project.objects.all()

        return render(request, "projects/projects.html", {"projects": projects})


class CreateProjectView(View):
    def get(self, request):
        form = ProjectForm(request.POST)
        return render(request, "projects/create_project.html", {"form": form})

    def post(self, request):
        form = ProjectForm(request.POST)
        if not form.is_valid():
            return render(request, "projects/create_project.html", {"form": form})

        project = form.save()
        return redirect("project", project_id=project.pk)
