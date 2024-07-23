import scrapy
from scrapy.crawler import CrawlerRunner
from twisted.internet import reactor, defer
from twisted.internet.defer import inlineCallbacks
import tempfile
from parsel import Selector
import logging
from scrapers.scrapy_scraper.spiders.scrapy_settings import SPIDER_PROCESS_SETTINGS

logger = logging.getLogger(__name__)


class PageScraper:

    @staticmethod
    def confirm_response(response):
        response_status = response.status == 200
        if not response_status:
            logger.error("Bad response with code: %s", response.status)
        return response_status

    @staticmethod
    @inlineCallbacks
    def fetch_html(page_url):
        class ComponentSpider(scrapy.Spider):
            name = "component_spider"
            start_urls = [page_url]

            def parse(self, response):
                if PageScraper.confirm_response(response):
                    return {"html": response.text}
                else:
                    return {"html": None}

        process = CrawlerRunner(SPIDER_PROCESS_SETTINGS)

        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            yield process.crawl(ComponentSpider, output=temp_file.name)
            reactor.stop()
            temp_file.seek(0)
            raw_html = temp_file.read().decode("utf-8")

        return raw_html
