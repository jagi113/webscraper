"""
URL configuration for webscraper project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from . import views


urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("projects.urls")),
    path("<int:project_id>/scraped-data/", include("scraped_data.urls")),
    path("<int:project_id>/", views.ScrapingProject.as_view(), name="project"),
    path(
        "<int:project_id>/scrape-main-page/",
        views.ScrapeMainPage.as_view(),
        name="scrape-main-page",
    ),
    path(
        "<int:project_id>/find-component/",
        views.FindComponent.as_view(),
        name="find_component",
    ),
    path(
        "<int:project_id>/field-form/",
        views.FieldForm.as_view(),
        name="field_form",
    ),
    path(
        "<int:project_id>/field-form/<str:field_id>/",
        views.FieldForm.as_view(),
        name="field_form",
    ),
    path(
        "<int:project_id>/find-field-value-selector/",
        views.FindFieldValueSelector.as_view(),
        name="find_field_selector",
    ),
    path(
        "<int:project_id>/find-field-value-selector/<str:field_id>/",
        views.FindFieldValueSelector.as_view(),
        name="find_field_selector",
    ),
    path(
        "<int:project_id>/delete-field/<str:field_id>/",
        views.DeleteField.as_view(),
        name="delete_field",
    ),
    path(
        "<int:project_id>/scrape-data/",
        views.ScrapeProjectData.as_view(),
        name="scrape_data",
    ),
]

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
