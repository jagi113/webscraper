import logging
from parsel import Selector

logger = logging.getLogger(__name__)


class PageParser:
    def parse(self, html_content, css_selector=None, xpath_selector=None):
        selector = Selector(text=html_content)

        if css_selector:
            return selector.css(css_selector).extract()
        elif xpath_selector:
            return selector.xpath(xpath_selector).extract()
        else:
            raise ValueError("Either css_selector or xpath_selector must be provided")
