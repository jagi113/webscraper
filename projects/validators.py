from scrapers.helper_functions import separate_url_and_page_num

MAX_PAGES_FOR_DEMO = 2
DEFAULT_NEXT_PAGE = 0
MIN_PAGES_TO_SCRAPE = 1


def set_number_of_pages_to_scrape_for_presentation(number_of_pages_to_scrape):
    if number_of_pages_to_scrape > MAX_PAGES_FOR_DEMO:
        return (
            f"For presentation purposes, the number of pages to scrape is limited to {MAX_PAGES_FOR_DEMO}.",
            MAX_PAGES_FOR_DEMO,
        )
    return None, number_of_pages_to_scrape


def url_for_pagination_error(start_url):
    _, num = separate_url_and_page_num(start_url)
    if num is None:
        return (
            f"Invalid start URL for pagination: {start_url}. "
            "URL must include a page number or Number of pages to scrape must be set to 1."
        )
    return None


def validate_project_data(data, is_demo_presentation=False):
    errors = {}
    corrected_data = data.copy()

    number_of_pages_to_scrape = data["number_of_pages_to_scrape"]
    if is_demo_presentation:
        demo_error, number_of_pages_to_scrape = (
            set_number_of_pages_to_scrape_for_presentation(number_of_pages_to_scrape)
        )
        corrected_data["number_of_pages_to_scrape"] = number_of_pages_to_scrape
        if demo_error:
            errors["number_of_pages_to_scrape"] = [demo_error]

    main_page_url = data["main_page_url"]
    if number_of_pages_to_scrape > MIN_PAGES_TO_SCRAPE:
        pagination_error = url_for_pagination_error(main_page_url)
        if pagination_error:
            errors["main_page_url"] = [pagination_error]
    elif (
        number_of_pages_to_scrape in [0, MIN_PAGES_TO_SCRAPE]
        and url_for_pagination_error(main_page_url)
        and data["next_page_to_scrape"] > DEFAULT_NEXT_PAGE
    ):
        corrected_data["next_page_to_scrape"] = DEFAULT_NEXT_PAGE
        errors["next_page_to_scrape"] = [
            f"Since URL: '{main_page_url}' does not include a page number, next page to scrape is set to {DEFAULT_NEXT_PAGE}."
        ]

    return corrected_data, errors
