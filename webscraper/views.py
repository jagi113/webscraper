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
from celery_app.tasks import scrape_and_save_to_database_task


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
                "fields": project.fields["fields"],
                "error_response": error_response,
            },
        )


class FindFieldValueSelector(View):
    @turbo_stream_response
    def post(self, request, project_id, field_id=None):
        project = get_object_or_404(Project, id=project_id)
        error_response = None

        field_name = None
        if field_id:
            field_name = project.fields.get(field_id, None)
            if not field_name:
                error_response = f"Error: field_id '{field_id}' does not exist in the project fields."
        else:
            field_id = None
        field_expected_value = request.POST.get("field_expected_value")
        attribute = request.POST.get("attribute")

        error_response, page_content = get_page_content(project)

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
            selector, attribute = parser.generate_selector(
                component,
                project.selector_type,
                field_expected_value,
                attribute,
            )
            if selector:
                break

        if not selector:
            error_response = f"Value '{field_expected_value}' was not found in the components. Try again!"

        if error_response is not None:
            return render(
                request,
                "webscraper/partial/_field_error_response.html",
                {"project": project, "error_response": error_response},
            )

        return render(
            request,
            "webscraper/partial/_find_selector_response.html",
            {
                "project": project,
                "field": (
                    {
                        "id": field_id,
                        "name": field_name,
                        "selector": selector if not error_response else None,
                        "attribute": (attribute if not error_response else None),
                    }
                ),
            },
        )


class FieldForm(View):
    @turbo_stream_response
    def get(self, request, project_id, field_id=None):
        project = get_object_or_404(Project, id=project_id)
        field = None
        if field_id and field_id in project.fields["fields"]:
            field = project.fields["fields"][field_id]
        return render(
            request,
            "webscraper/partial/_field_form.html",
            {
                "project": project,
                "field": field,
            },
        )

    @turbo_stream_response
    def post(self, request, project_id, field_id=None):
        project = get_object_or_404(Project, id=project_id)
        field_name = request.POST.get("field_name")
        selector = request.POST.get("selector")
        attribute = request.POST.get("attribute")

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
                        attribute=attribute,
                        **selector_kwargs,
                    )
                    values.append(component_values)

                if all(not sublist for sublist in values):
                    raise Exception(
                        "No values were found. Check the Selector again! It might be too specific."
                    )
            except Exception as e:
                error_response = f"While parsing html content for field {field_name} following error occured: \n{e}"
        else:
            error_response = f"Selector Path for scraping value is required"

        if error_response is not None:
            return render(
                request,
                "webscraper/partial/_field_error_response.html",
                {"project": project, "error_response": error_response},
            )

        # for presenting found values
        if "check_values" in request.POST:
            return render(
                request,
                "webscraper/partial/_field_response.html",
                {
                    "project": project,
                    "field": (
                        {
                            "name": field_name,
                            "values": values,
                            "selector": selector,
                            "attribute": attribute,
                        }
                    ),
                },
            )

        # for saving / updating field
        project.add_field(field_name, selector, attribute, field_id)
        return render(
            request,
            "webscraper/partial/_fields_updated.html",
            {
                "project": project,
                "fields": project.fields["fields"],
            },
        )


class DeleteField(View):
    @turbo_stream_response
    def post(self, request, project_id, field_id):
        project = get_object_or_404(Project, id=project_id)
        project.remove_field(field_id)
        return render(
            request,
            "webscraper/partial/_fields_updated.html",
            {
                "project": project,
                "fields": project.fields["fields"],
            },
        )


class ScrapeProjectData(View):
    @turbo_stream_response
    def post(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)
        scrape_and_save_to_database_task.delay(
            project_name=project.id,
            selector_type=project.selector_type,
            start_url=project.main_page_url,
            component_path=project.component_path,
            fields=list(project.fields["fields"].values()),
            next_page_to_scrape=(
                project.next_page_to_scrape if project.next_page_to_scrape else 0
            ),
            number_of_pages_to_scrape=project.number_of_pages_to_scrape,
            next_button=None,
        )
        return render(
            request,
            "webscraper/partial/_scraping_initialized.html",
            {
                "project": project,
            },
        )
