import logging
import scrapy
from scrapy.crawler import CrawlerProcess

# from webscraper.scrapers.scrapy_scraper.spiders.scrapy_settings import (
#     SPIDER_PROCESS_SETTINGS,
# )

SPIDER_PROCESS_SETTINGS = {
    "CONCURRENT_REQUESTS": 5,
    "DOWNLOAD_DELAY": 0.5,
    "LOG_LEVEL": "INFO",
    "USER_AGENT": "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1)",
}

logger = logging.getLogger(__name__)


class MainSpider(scrapy.Spider):
    name = "main_spider"
    custom_settings = SPIDER_PROCESS_SETTINGS

    def __init__(
        self,
        project_id,
        selector_type,
        start_urls,
        next_button,
        component_path,
        fields,
        *args,
        **kwargs,
    ):
        try:
            super(MainSpider, self).__init__(*args, **kwargs)
            self.name = str(project_id)
            self.selector_type = selector_type
            self.start_urls = start_urls
            self.next_button = next_button
            self.component_path = component_path
            self.fields = fields
            logger.debug("Spider initialized: %s", self.name)
        except Exception as e:
            logger.error("Error initializing spider: %s", e)
            raise

    def parse(self, response):
        try:
            # Select components based on the selector type
            components = (
                response.css(self.component_path)
                if self.selector_type == "CSS"
                else response.xpath(self.component_path)
            )

            for component in components:
                scraped_data = {}
                for field in self.fields:
                    selector = field["selector"]
                    attribute = field.get("attribute", "text")

                    # Build the full selector based on the attribute
                    if attribute in ["text()", "text"]:
                        if self.selector_type == "CSS":
                            field_value = component.css(
                                selector + "::text"
                            ).get()  # Ensure we append "::text"
                        elif self.selector_type == "XPath":
                            field_value = component.xpath(
                                f"{selector}/text()"
                            ).get()  # Use /text() for XPath

                    else:
                        if self.selector_type == "CSS":
                            field_value = component.css(
                                f"{selector}::attr({attribute[1:]})"
                            ).get()
                        else:
                            field_value = component.xpath(
                                f"{selector}/{attribute}"
                            ).get()

                    # Store the extracted value
                    scraped_data[field["id"]] = field_value

                # Yield the scraped data for each component
                print(scraped_data)
                yield scraped_data

            # Handle pagination
            if self.next_button:
                if self.selector_type == "CSS":
                    next_page = response.css(self.next_button["selector"]).attrib.get(
                        self.next_button["attribute"]
                    )
                else:
                    next_page = response.xpath(self.next_button["selector"]).attrib.get(
                        self.next_button["attribute"]
                    )

                if next_page:
                    yield response.follow(next_page, callback=self.parse)

        except Exception as e:
            logger.error("Error during parsing: %s", e)


if __name__ == "__main__":
    process = CrawlerProcess(SPIDER_PROCESS_SETTINGS)

    process.crawl(
        MainSpider,
        project_id=1,
        selector_type="CSS",
        start_urls=["https://grkatnr.sk/homilie/"],
        next_button=None,
        component_path="div.category-list-post",
        fields=[
            {
                "id": "title",
                "selector": "a.category-list-title h3.category-list-title",
                "attribute": "text",
            }
        ],
    )
    process.start()
    logger.debug("All done")
