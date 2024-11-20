from django.shortcuts import render, redirect, get_object_or_404
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


class UpdateProjectView(View):
    def get(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)
        form = ProjectForm(instance=project)
        return render(
            request,
            "projects/update_project.html",
            {
                "form": form,
                "project": project,
                "fields": project.fields["fields"],
            },
        )

    def post(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)
        form = ProjectForm(request.POST, instance=project)
        if not form.is_valid():
            return render(
                request,
                "projects/update_project.html",
                {
                    "form": form,
                    "project": project,
                    "fields": project.fields["fields"],
                },
            )
        form.save()
        return redirect("projects:projects")


class DeleteProjectView(View):
    def post(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)
        project.delete()
        return redirect("projects:projects")


class ProjectOverviewView(View):
    def get(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)
        return render(
            request,
            "projects/project_overview.html",
            {
                "project": project,
                "fields": project.fields["fields"],
            },
        )
