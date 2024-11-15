from django.urls import path
from projects import views


app_name = "projects"

urlpatterns = [
    path("", views.ProjectsView.as_view(), name="projects"),
    path(
        "create-project/",
        views.CreateProjectView.as_view(),
        name="create_project",
    ),
    path(
        "update-project/<int:project_id>/",
        views.UpdateProjectView.as_view(),
        name="update_project",
    ),
    path(
        "delete-project/<int:project_id>/",
        views.DeleteProjectView.as_view(),
        name="delete_project",
    ),
]
