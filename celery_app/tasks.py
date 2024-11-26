from celery import shared_task
from scrapers.scraping_blocks import scrape_and_save_to_database
import logging

logger = logging.getLogger("celery")


@shared_task
def scrape_and_save_to_database_task(*args, **kwargs):
    logger.info("Task started: scrape_and_save_to_database_task")
    return scrape_and_save_to_database(*args, **kwargs)
