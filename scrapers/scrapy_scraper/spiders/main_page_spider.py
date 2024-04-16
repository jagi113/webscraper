import logging
import scrapy
from scrapy.selector import Selector
from scrapy.crawler import CrawlerProcess
from scrapers.scrapy_scraper.spiders.scrapy_settings import (
    SPIDER_PROCESS_SETTINGS,
)

logger = logging.getLogger(__name__)


class MainPageSpider(scrapy.Spider):
    name = "main_page"

    def __init__(self, start_urls=[], *args, **kwargs):
        try:
            super(MainPageSpider, self).__init__(*args, **kwargs)
            self.start_urls = start_urls

            logger.debug("Initializing spider: %s", self.name)
        except Exception as e:
            print(e)

    def start_requests(self):
        try:
            for url in self.start_urls:
                logger.debug("Requesting url: %s", url)
                yield scrapy.Request(url=url, callback=self.parse)
        except Exception as e:
            logger.error(e)

    def parse(self, response):
        # logger.debug(
        #     "Response from %s: %s", response.url, response.body.decode("utf-8")
        # )
        body = response.css("body")
        yield body

    def crawl_main_page(self, start_urls):
        # Start the crawling process synchronously
        process = CrawlerProcess(SPIDER_PROCESS_SETTINGS)
        process.crawl(self, start_urls=start_urls)
        process.start()


if __name__ == "__main__":
    process = CrawlerProcess(
        {"USER_AGENT": "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1)"}
    )

    process.crawl(
        MainPageSpider,
        start_urls=[
            "https://grkatnr.sk/homilie/",
        ],
    )
    process.start()
    logger.debug("All done")
