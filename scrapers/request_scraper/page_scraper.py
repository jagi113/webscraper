import logging
import requests

logger = logging.getLogger(__name__)


class PageScraper:

    DEFAULT_HEADERS = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-User": "?1",
        "Cache-Control": "max-age=0",
    }

    def confirm_response(self, response):
        response_status = response.status_code == 200
        if not response_status:
            logger.error("Bad response with code: %s", response.status_code)
            raise Exception(response.status_code)
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
            return f"Request failed: \n{e}"
