from django.core.cache import cache
from django.shortcuts import render, redirect
from django.views import View

from projects.models import Project
from scrapers.request_scraper.page_scraper import PageScraper
from webscraper.decorators import turbo_stream_response
from webscraper.forms import MainWebsiteForm

# from scrapers.scrapy_scraper.spiders.page_scraper import PageScraper


class ScrapingProject(View):
    def get(self, request, project_id):
        project = Project.objects.get(id=project_id)
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
        project = Project.objects.get(id=project_id)
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
            {"main_website": project.main_page_url, "html_response": response},
        )


# class ScrapeComponent(View):
#     @turbo_stream_response
#     def get(self, request, project_id):

#         form = MainWebsiteForm(request.GET)
#         if not form.is_valid():
#             print(form.errors)
#             return render(
#                 request,
#                 "webscraper/partial/_main_website_form.html",
#                 {"main_website_form": form},
#             )

#         main_website = form.cleaned_data["main_website"]
#         try:
#             scraper = MainPageScraper(main_website)
#             response = scraper.get_html_content()
#         except Exception as e:
#             response = "Error while scraping"

#         return render(
#             request,
#             "webscraper/partial/_response.html",
#             {"main_website": main_website, "html_response": response},
#         )
