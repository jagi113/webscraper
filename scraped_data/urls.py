from django.contrib import admin
from django.urls import path, include
from . import views


app_name = "scraped_data"

urlpatterns = [
    path(
        "",
        views.ShowDataView.as_view(),
        name="show_data",
    ),
    path(
        "remove_duplicates/",
        views.RemoveDuplicatesView.as_view(),
        name="remove_duplicates",
    ),
    path(
        "delete_all_scraped_data/",
        views.DeleteAllScrapedData.as_view(),
        name="delete_all_scraped_data",
    ),
]
