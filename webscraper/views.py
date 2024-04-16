from django.shortcuts import render, redirect
from django.views import View
from webscraper.decorators import turbo_stream_response
from webscraper.forms import MainWebsiteForm

from scrapers.request_scraper.main_page_scraper import MainPageScraper


class HomeView(View):
    def get(self, request):
        main_website_form = MainWebsiteForm()

        return render(
            request, "webscraper/home.html", {"main_website_form": main_website_form}
        )


class ScrapeMainPage(View):
    @turbo_stream_response
    def get(self, request):
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
        # add response from process here
        return render(
            request,
            "webscraper/partial/_main_page_response.html",
            {"main_website": main_website, "html_response": response},
        )
