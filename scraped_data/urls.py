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
        "remove-duplicates/",
        views.RemoveDuplicatesView.as_view(),
        name="remove_duplicates",
    ),
    path(
        "delete-all-scraped-data/",
        views.DeleteAllScrapedData.as_view(),
        name="delete_all_scraped_data",
    ),
    path(
        "download-all-data-as-excel-file/",
        views.DownloadAllDataAsExcelFile.as_view(),
        name="download_all_data_as_excel_file",
    ),
]
