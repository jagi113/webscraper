import requests
import logging

logger = logging.getLogger(__name__)


class MainPageScraper:
    def __init__(self, page_url):
        self.page_url = page_url
        self.r = requests.get(self.page_url)
        logger.debug("MainPageScraper initialized for: %s", self.page_url)

    def confirm_response(self):
        response_status = self.r.status_code == requests.codes.ok
        if not response_status:
            logger.error("Bad response with code: %s", self.r.status_code)
        return response_status

    def get_html_content(self):
        if self.confirm_response():
            return self.r.text
        else:
            return None
