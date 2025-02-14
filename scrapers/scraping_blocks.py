# import for websocket
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

import logging
from scrapy.crawler import CrawlerProcess
from scrapy.signalmanager import dispatcher
from scrapy import signals

# For direct function testing uncomment
# import sys
# import os
# sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
# from scrapy_scraper.spiders.main_page_spider import MainSpider

from scrapers.scrapy_scraper.spiders.main_page_spider import MainSpider
from scraped_data.database_functions import prepare_table, save_data_to_db
from scrapers.helper_functions import separate_url_and_page_num

logger = logging.getLogger("celery")


def scrape_and_save_to_database(
    project_name,
    selector_type,
    start_url,
    component_path,
    fields,
    next_page_to_scrape=0,
    number_of_pages_to_scrape=None,
    next_button=None,
):
    logger.info(f"Starting scraping data for project {project_name}")

    if not fields or not isinstance(fields, list):
        raise ValueError("Fields must be a non-empty list.")
    if not start_url:
        raise ValueError("Start URL must be provided.")

    prepare_table(project_name, [field["id"] for field in fields])
    logger.debug(f"Table '{project_name}' in database is prepared.")

    channel_layer = get_channel_layer()
    group_name = f"scraping_progress_{project_name}"
    if channel_layer:
        logger.debug("Connected to websocket successfully.")
    else:
        logger.debug("WebSocket connection failed.")

    if channel_layer:
        async_to_sync(channel_layer.group_send)(
            group_name,
            {"type": "progress_update", "progress": 5},
        )

    if not next_button and not number_of_pages_to_scrape:
        raise Exception(
            f"For project {project_name}, neither 'next_button' nor 'number_of_pages_to_scrape' was provided."
        )

    if next_button or number_of_pages_to_scrape == 1:
        urls = [start_url]
    else:
        base_url, num = separate_url_and_page_num(start_url)
        if num is None:
            raise ValueError(f"Invalid start URL for pagination: {start_url}")
        urls = [
            f"{base_url}{i}"
            for i in range(
                next_page_to_scrape, next_page_to_scrape + number_of_pages_to_scrape
            )
        ]

    scraped_data = []
    scraping_process = CrawlerProcess(MainSpider.custom_settings)

    def collect_item(item):
        scraped_data.append(item)

    dispatcher.connect(collect_item, signal=signals.item_scraped)

    try:
        scraping_process.crawl(
            MainSpider,
            project_id=project_name,
            selector_type=selector_type,
            start_urls=urls,
            component_path=component_path,
            fields=fields,
            batch_size=50,
        )

        scraping_process.start()

        for item in scraped_data:
            batch_data = item.get("batch_data", [])
            logger.debug("Scraped data:\n" + "\n".join(f"{row}" for row in batch_data))
            progress = item.get("progress", 0)
            save_data_to_db(project_name, batch_data)
            if channel_layer:
                async_to_sync(channel_layer.group_send)(
                    group_name,
                    {
                        "type": "progress_update",
                        "progress": progress,
                    },
                )
            logger.info(f"Project: {project_name} - scraping progress: {progress:.2f}%")

        logger.info(f"Project: {project_name} - scraping completed!")
    except Exception as e:
        logger.error(f"Scraping process failed: {e}")
        raise


if __name__ == "__main__":
    import os
    import django

    # Set the default Django settings module
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "webscraper.settings")

    # Initialize Django
    django.setup()
    from django.shortcuts import get_object_or_404
    from projects.models import Project

    project = get_object_or_404(Project, id=3)

    scrape_and_save_to_database(
        project_name=project.id,
        selector_type=project.selector_type,
        start_url=project.main_page_url,
        component_path=project.component_path,
        fields=list(project.fields["fields"].values()),
        next_page_to_scrape=(
            project.next_page_to_scrape if project.next_page_to_scrape else 0
        ),
        number_of_pages_to_scrape=project.number_of_pages_to_scrape,
        next_button=None,
    )
