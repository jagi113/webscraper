# websockets_app/routing.py
from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path(
        "ws/scraping-progress/<int:project_id>/",
        consumers.ScrapingProgressConsumer.as_asgi(),
    ),
]
