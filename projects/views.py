from django.shortcuts import render, redirect, get_object_or_404
from django.views import View

from projects.forms import ProjectForm
from projects.models import Project
from projects.validators import validate_project_data
from scraped_data.database_functions import delete_project_data_table

# Create your views here.


class ProjectsView(View):
    def get(self, request):
        projects = Project.objects.all()

        return render(request, "projects/projects.html", {"projects": projects})


class CreateProjectView(View):
    def get(self, request):
        form = ProjectForm()
        return render(request, "projects/create_project.html", {"form": form})

    def post(self, request):
        form = ProjectForm(request.POST)
        if not form.is_valid():
            return render(request, "projects/create_project.html", {"form": form})

        corrected_data, errors = validate_project_data(
            form.cleaned_data, request.is_demo_presentation
        )

        if errors:
            corrected_form = ProjectForm(corrected_data)
            for field, error_list in errors.items():
                if field in corrected_form.errors:
                    corrected_form.errors[field].extend(error_list)
                else:
                    corrected_form.errors[field] = error_list

            return render(
                request,
                "projects/create_project.html",
                {"form": corrected_form},
            )

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

        corrected_data, errors = validate_project_data(
            form.cleaned_data, request.is_demo_presentation
        )

        if errors:
            corrected_form = ProjectForm(corrected_data)
            for field, error_list in errors.items():
                if field in corrected_form.errors:
                    corrected_form.errors[field].extend(error_list)
                else:
                    corrected_form.errors[field] = error_list

            return render(
                request,
                "projects/update_project.html",
                {
                    "form": corrected_form,
                    "project": project,
                    "fields": project.fields["fields"],
                },
            )

        form.save()
        return redirect("projects:projects")


class DeleteProjectView(View):
    def post(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)
        delete_project_data_table(project_id)
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
