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

from django.contrib import admin
from django.urls import path, include
from . import views


urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("projects.urls")),
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
        "<int:project_id>/find-field-value/",
        views.FindFieldValue.as_view(),
        name="find_field_value",
    ),
    path(
        "<int:project_id>/find-field-value/<int:field_id>",
        views.FindFieldValue.as_view(),
        name="find_field_value",
    ),
    path(
        "<int:project_id>/find-field-value-selector/",
        views.FindFieldValueSelector.as_view(),
        name="find_field_value_selector",
    ),
    path(
        "<int:project_id>/find-field-value-selector/<int:field_id>",
        views.FindFieldValueSelector.as_view(),
        name="find_field_value_selector",
    ),
]
