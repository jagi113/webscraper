from django.core.cache import cache
from django.shortcuts import render, get_object_or_404
from django.views import View

from projects.models import Project
from scrapers.request_scraper.page_scraper import PageScraper
from scrapers.request_scraper.page_parser import PageParser
from scrapers.request_scraper.selectors import (
    is_valid_xpath_selector,
    is_valid_css_selector,
)

from webscraper.decorators import turbo_stream_response
from webscraper.forms import MainWebsiteForm

# from scrapers.scrapy_scraper.spiders.page_scraper import PageScraper


class ScrapingProject(View):
    def get(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)
        main_website_form = MainWebsiteForm(
            initial={"main_website": project.main_page_url}
        )
        response = cache.get(f"{project.id}-{project.main_page_url}")
        return render(
            request,
            "webscraper/project.html",
            {
                "project": project,
                "main_website_form": main_website_form,
                "main_website": project.main_page_url,
                "html_response": response,
            },
        )


class ScrapeMainPage(View):
    @turbo_stream_response
    def get(self, request, project_id):

        form = MainWebsiteForm(request.GET)
        if not form.is_valid():
            return render(
                request,
                "webscraper/partial/_main_website_form.html",
                {"main_website_form": form},
            )

        main_website = form.cleaned_data["main_website"]
        project = get_object_or_404(Project, id=project_id)
        if project.main_page_url != main_website:
            project.main_page_url = main_website
            project.save()
        try:
            scraper = PageScraper()
            response = scraper.fetch_html(project.main_page_url)
            cache.set(f"{project.id}-{project.main_page_url}", response, timeout=1200)
        except Exception as e:
            response = f"Error while scraping \n{e}"

        return render(
            request,
            "webscraper/partial/_response.html",
            {
                "project": project,
                "main_website": project.main_page_url,
                "html_response": response,
            },
        )


class FindComponent(View):
    @turbo_stream_response
    def get(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)
        component_path = request.GET.get("component_path")
        print(component_path)

        error_response = None
        if not component_path or component_path == "":
            error_response = "Component identificator is required"
        elif project.selector_type == "CSS" and not is_valid_css_selector(
            component_path
        ):
            print("Not Valid CSS selector")
            error_response = "Invalid CSS selector"
        elif project.selector_type == "xPath" and not is_valid_xpath_selector(
            component_path
        ):
            error_response = "Invalid XPath expression"

        page_content = cache.get(f"{project.id}-{project.main_page_url}")
        if not page_content:
            print("Page content was lost")
            try:
                scraper = PageScraper()
                page_content = scraper.fetch_html(project.main_page_url)
                cache.set(
                    f"{project.id}-{project.main_page_url}", page_content, timeout=1200
                )
            except Exception as e:
                error_response += f"\nScraped page content was lost and during repetiteve scrape following error occured: \n{e}"

        if error_response is not None:
            return render(
                request,
                "webscraper/partial/_component_error_response.html",
                {"project": project, "error_response": error_response},
            )

        project.component_path = component_path
        project.save()

        parser = PageParser()
        kwargs = (
            {"css_selector": project.component_path}
            if project.selector_type == "CSS"
            else {"xpath_selector": project.component_path}
        )
        try:
            component_response = parser.parse(html_content=page_content, **kwargs)
        except Exception as e:
            error_response = f"While parsing html content for components following error occured: \n{e}"

        print(component_response)

        return render(
            request,
            "webscraper/partial/_component_response.html",
            {
                "project": project,
                "component_response": component_response,
                "error_response": error_response,
            },
        )
