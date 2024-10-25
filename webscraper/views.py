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
from webscraper.helper_functions import get_page_content

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

        error_response = None
        if not component_path or component_path == "":
            error_response = "Component identificator is required"
        elif project.selector_type == "CSS" and not is_valid_css_selector(
            component_path
        ):
            error_response = "Invalid CSS selector"
        elif project.selector_type == "xPath" and not is_valid_xpath_selector(
            component_path
        ):
            error_response = "Invalid XPath expression"

        error_response, page_content = get_page_content(project)

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

        return render(
            request,
            "webscraper/partial/_component_response.html",
            {
                "project": project,
                "component_response": component_response,
                "error_response": error_response,
            },
        )


class FindFieldValueSelector(View):
    @turbo_stream_response
    def post(self, request, project_id, field_id=None):
        project = get_object_or_404(Project, id=project_id)
        field_expected_value = request.POST.get("field_expected_value")
        html_type_of_value = request.POST.get("html_type_of_value")
        error_response = None
        error_response, page_content = get_page_content(project)

        if error_response is not None:
            return render(
                request,
                "webscraper/partial/_field_error_response.html",
                {"project": project, "error_response": error_response},
            )

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

        for component in component_response:
            selector, value_html_type = parser.generate_selector(
                component,
                project.selector_type,
                field_expected_value,
                html_type_of_value,
            )
            if selector:
                break

        if not selector:
            error_response = f"Value {field_expected_value} was not found in the components. Try again!"
        print(f"Selector found: {selector}")
        print(value_html_type)
        return render(
            request,
            "webscraper/partial/_find_selector_response.html",
            {
                "project": project,
                "field": (
                    {
                        "id": field_id if field_id else None,
                        "value_selector": selector if not error_response else None,
                        "html_type_of_value": (
                            value_html_type if not error_response else None
                        ),
                    }
                ),
                "field_parsing_error": error_response,
            },
        )


class FindFieldValue(View):
    @turbo_stream_response
    def post(self, request, project_id, field_id=None):
        project = get_object_or_404(Project, id=project_id)
        field_name = request.POST.get("field_name")
        selector = request.POST.get("value_selector")
        value_html_type = request.POST.get("value_attribute")
        print(f"Selector is: {selector}")
        print(f"Value html type is: {value_html_type}")
        error_response = None
        error_response, page_content = get_page_content(project)

        if error_response is not None:
            return render(
                request,
                "webscraper/partial/_field_error_response.html",
                {"project": project, "error_response": error_response},
            )

        parser = PageParser()

        if selector:
            component_kwargs = (
                {"css_selector": project.component_path}
                if project.selector_type == "CSS"
                else {"xpath_selector": project.component_path}
            )
            selector_kwargs = (
                {"css_selector": selector}
                if project.selector_type == "CSS"
                else {"xpath_selector": selector}
            )
            try:
                values = []
                for component in parser.parse(
                    html_content=page_content, **component_kwargs
                ):
                    component_values = parser.get_values(
                        html_content=component,
                        value_attribute=value_html_type,
                        **selector_kwargs,
                    )
                    values.append(component_values)

                if all(not sublist for sublist in values):
                    raise Exception(
                        "No values were found. Try to make Selector more general."
                    )
            except Exception as e:
                error_response = f"While parsing html content for field {field_name} following error occured: \n{e}"
        else:
            error_response = f"Selector Path for scraping value is required"

        return render(
            request,
            "webscraper/partial/_field_response.html",
            {
                "project": project,
                "field": (
                    {
                        "id": field_id if field_id else None,
                        "name": field_name,
                        "values": values,
                        "selector": selector,
                        "html_type_of_value": value_html_type,
                    }
                    if not error_response
                    else None
                ),
                "field_parsing_error": error_response,
            },
        )
