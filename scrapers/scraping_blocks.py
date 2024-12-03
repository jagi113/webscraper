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
    prepare_table(project_name, [field["id"] for field in fields])

    if not number_of_pages_to_scrape and next_button:
        urls = [start_url]
    elif not next_button and number_of_pages_to_scrape:
        start_url, num = separate_url_and_page_num(start_url)
        if not num:
            raise Exception("Unable to scrape multiple pages based on url: {start_url}")
        urls = [
            f"{start_url}{num}"
            for num in range(
                next_page_to_scrape, next_page_to_scrape + number_of_pages_to_scrape + 1
            )
        ]
    else:
        raise Exception(
            "For project: {project_name} were not provided number of pages to scrape or next_button selector"
        )

    scraped_data = []
    scraping_process = CrawlerProcess(MainSpider.custom_settings)

    def collect_item(item):
        scraped_data.append(item)

    dispatcher.connect(collect_item, signal=signals.item_scraped)

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

    channel_layer = get_channel_layer()
    group_name = f"scraping_progress_{project_name}"

    for item in scraped_data:
        batch_data = item.get("batch_data", [])
        progress = item.get("progress", 0)
        save_data_to_db(project_name, batch_data)
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                "type": "progress_update",
                "progress": progress,
            },
        )
        logger.info(f"Project: {project_name} - scraping progress: {progress:.2f}%")

    logger.info(f"Project: {project_name} - scraping completed!")


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
    print(project.id)

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
