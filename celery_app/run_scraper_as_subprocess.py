import sys
import json
import logging

import sys
import os

# Ensure the directory is included in sys.path
sys.path.append(os.path.abspath("/app"))

from scrapers.scrapy_scraper.spiders.main_page_spider import MainSpider
from scraped_data.database_functions import prepare_table, save_data_to_db
from scrapers.helper_functions import separate_url_and_page_num
from scrapers.scraping_blocks import scrape_and_save_to_database

logger = logging.getLogger("scraper")

if __name__ == "__main__":
    try:
        # Read JSON arguments from command line
        args = json.loads(sys.argv[1])

        # Call the existing function with unpacked arguments
        scrape_and_save_to_database(**args)

    except Exception as e:
        logger.error(f"Scraper failed: {e}")
        sys.exit(1)
