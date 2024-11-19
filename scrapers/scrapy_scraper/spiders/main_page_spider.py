import logging
import scrapy
from scrapy.crawler import CrawlerProcess

logger = logging.getLogger(__name__)


class MainSpider(scrapy.Spider):
    name = "main_spider"
    custom_settings = {
        "CONCURRENT_REQUESTS": 5,
        "DOWNLOAD_DELAY": 0.5,
        "LOG_LEVEL": "INFO",
        "USER_AGENT": "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1)",
    }

    def __init__(
        self,
        project_id,
        selector_type,
        start_urls,
        component_path,
        fields,
        batch_size=50,
        next_button=None,
        *args,
        **kwargs,
    ):
        super(MainSpider, self).__init__(*args, **kwargs)
        self.name = str(project_id)
        self.selector_type = selector_type
        self.start_urls = start_urls
        self.next_button = next_button
        self.component_path = component_path
        self.fields = fields
        self.total_pages = len(start_urls)
        self.batch_size = batch_size
        self.pages_scraped = 0
        self.data_batch = []

    def parse(self, response):
        # Scrape components
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

                # Extract field values
                if attribute in ["text()", "text"]:
                    field_value = (
                        component.css(selector + "::text").get()
                        if self.selector_type == "CSS"
                        else component.xpath(f"{selector}/text()").get()
                    )
                else:
                    field_value = (
                        component.css(f"{selector}::attr({attribute[1:]})").get()
                        if self.selector_type == "CSS"
                        else component.xpath(f"{selector}/{attribute}").get()
                    )
                scraped_data[field["id"]] = field_value

            self.data_batch.append(scraped_data)

        self.pages_scraped += 1

        if (
            len(self.data_batch) >= self.batch_size
            or self.pages_scraped >= self.total_pages
        ):
            progress = (self.pages_scraped / self.total_pages) * 100
            yield {
                "batch_data": self.data_batch,
                "progress": progress,
            }
            self.data_batch = []

        # Handle pagination
        if self.next_button:
            next_page = (
                response.css(self.next_button["selector"]).attrib.get(
                    self.next_button["attribute"]
                )
                if self.selector_type == "CSS"
                else response.xpath(self.next_button["selector"]).attrib.get(
                    self.next_button["attribute"]
                )
            )
            if next_page:
                yield response.follow(next_page, callback=self.parse)


if __name__ == "__main__":

    from scrapy.signalmanager import dispatcher
    from scrapy import signals

    urls = [f"https://grkatnr.sk/homilie/page/{num}/" for num in range(1, 11)]

    def main():
        scraped_results = []

        scraping_process = CrawlerProcess(MainSpider.custom_settings)

        def collect_item(item):
            scraped_results.append(item)

        dispatcher.connect(collect_item, signal=signals.item_scraped)

        scraping_process.crawl(
            MainSpider,
            project_id=1,
            selector_type="CSS",
            start_urls=urls,
            next_button=None,
            component_path="div.category-list-post",
            fields=[
                {
                    "id": "title",
                    "selector": "a.category-list-title h3.category-list-title",
                    "attribute": "text",
                }
            ],
            batch_size=10,
        )

        scraping_process.start()

        for item in scraped_results:
            batch_data = item.get("batch_data", [])
            progress = item.get("progress", 0)
            print(f"Scraping progress: {progress:.2f}%")
            print(f"Scraped batch: {batch_data}")

        print("Scraping completed!")

    main()
