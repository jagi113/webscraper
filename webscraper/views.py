from django.shortcuts import render, redirect
from django.views import View

from projects.models import Project

from scrapers.request_scraper.main_page_scraper import MainPageScraper

from webscraper.decorators import turbo_stream_response
from webscraper.forms import MainWebsiteForm


class ScrapingProject(View):
    def get(self, request, project_id):
        project = Project.objects.get(id=project_id)
        main_website_form = MainWebsiteForm(
            initial={"main_website": project.main_page_url}
        )

        return render(
            request,
            "webscraper/project.html",
            {"project": project, "main_website_form": main_website_form},
        )


class ScrapeMainPage(View):
    @turbo_stream_response
    def get(self, request, project_id):

        form = MainWebsiteForm(request.GET)
        if not form.is_valid():
            print(form.errors)
            return render(
                request,
                "webscraper/partial/_main_website_form.html",
                {"main_website_form": form},
            )

        main_website = form.cleaned_data["main_website"]
        try:
            scraper = MainPageScraper(main_website)
            response = scraper.get_html_content()
        except Exception as e:
            response = "Error while scraping"

        return render(
            request,
            "webscraper/partial/_response.html",
            {"main_website": main_website, "html_response": response},
        )
