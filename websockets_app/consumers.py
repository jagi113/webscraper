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
        if not self.channel_layer:
            logger.error("Channel layer is not configured properly.")
            await self.close()
            return
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        logger.debug("Added to group successfully.")
        logger.debug("About to accept connection...")
        await self.accept()
        logger.debug("Connection accepted.")
        logger.debug(f"WebSocket connected to project {self.project_id}")

    async def disconnect(self, close_code):
        logger.debug(f"WebSocket disconnected from project {self.project_id}")
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def progress_update(self, event):
        logger.debug(f"Received: {event}")
        progress = event.get("progress", 0)

        logger.debug(f"Progress: {progress}")

        await self.send(text_data=json.dumps({"progress": progress}))
