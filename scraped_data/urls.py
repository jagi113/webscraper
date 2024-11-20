from django.contrib import admin
from django.urls import path, include
from . import views


app_name = "scraped_data"

urlpatterns = [
    path(
        "",
        views.ShowData.as_view(),
        name="show_data",
    ),
]
