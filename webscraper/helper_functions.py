from django.core.cache import cache
from scrapers.request_scraper.page_scraper import PageScraper


def get_page_content(project):
    page_content = cache.get(f"{project.id}-{project.main_page_url}")
    error_response = None
    if not page_content:
        try:
            scraper = PageScraper()
            page_content = scraper.fetch_html(project.main_page_url)
            cache.set(
                f"{project.id}-{project.main_page_url}", page_content, timeout=1200
            )
        except Exception as e:
            error_response = f"\nScraped page content was lost and during repetiteve scrape following error occured: \n{e}"
    return error_response, page_content
