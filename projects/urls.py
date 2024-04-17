from django.urls import path
from projects import views


app_name = "projects"

urlpatterns = [
    path("", views.ProjectsView.as_view(), name="projects"),
    path(
        "create-project/",
        views.CreateProjectView.as_view(),
        name="create-project",
    ),
]
