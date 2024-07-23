import logging
import requests

logger = logging.getLogger(__name__)


class PageScraper:
    def confirm_response(self, response):
        response_status = response.status_code == 200
        if not response_status:
            logger.error("Bad response with code: %s", response.status_code)
        return response_status

    def fetch_html(self, page_url):
        try:
            response = requests.get(page_url)
            if self.confirm_response(response):
                return response.text
            else:
                return None
        except requests.RequestException as e:
            logger.error("Request failed: %s", e)
            return None
