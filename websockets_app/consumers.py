from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging


# Create a logger
logger = logging.getLogger("websockets")


class ScrapingProgressConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.project_id = self.scope["url_route"]["kwargs"]["project_id"]
        self.room_group_name = f"scraping_progress_{self.project_id}"

        logger.debug(f"Attempting to connect WebSocket for project {self.project_id}")

        # Join the group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        logger.debug(f"WebSocket connected to project {self.project_id}")

    async def disconnect(self, close_code):
        logger.debug(f"WebSocket disconnected from project {self.project_id}")
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        logger.debug(f"Received data: {text_data}")
        data = json.loads(text_data)
        progress = data.get("progress")

        logger.debug(f"Progress: {progress}")

        await self.send(text_data=json.dumps({"progress": progress}))
