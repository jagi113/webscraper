import re


def separate_url_and_page_num(url):
    # Regular expression patterns to match different page formats
    patterns = [
        # Matches URLs with "/page/{number}/" at the end
        (
            r"(.*page/)(\d+)/$",
            lambda match: match.group(1),
            lambda match: match.group(2),
        ),
        # Matches URLs with "?page={number}" parameter
        (
            r"(.*[?&]page=)(\d+)([&/].*)?$",
            lambda match: match.group(1),
            lambda match: match.group(2),
        ),
        # Matches URLs with "/{number}/" at the end (e.g., "/2/")
        (
            r"(.*)/(\d+)/$",
            lambda match: match.group(1) + "/",
            lambda match: match.group(2),
        ),
        # Matches URLs with "p={number}" in the middle of the URL
        (
            r"(.*p=)(\d+)([&/].*)?$",
            lambda match: match.group(1),
            lambda match: match.group(2),
        ),
    ]

    for pattern, prefix_func, extractor in patterns:
        match = re.match(pattern, url)
        if match:
            base_url = prefix_func(match)  # Generate the base URL
            page_number = extractor(match)  # Extract the page number
            return base_url, page_number

    # If no match found, return the original URL and None for page number
    return url, None


if __name__ == "__main__":
    urls = [
        "https://grkatnr.sk/homilie/page/3/",
        "https://grkatnr.sk/homilie/&page=3",
        "https://grkatnr.sk/homilie/&p=3",
        "https://www.nehnutelnosti.sk/vysledky/3-izbove-byty/kosice?priceTo=120000&page=2",
        "https://www.nehnutelnosti.sk/vysledky/3-izbove-byty/p=2",
        "https://www.nehnutelnosti.sk/vysledky/3-izbove-byty/2/",
    ]

    for url in urls:
        base_url, page_number = separate_url_and_page_num(url)
        print(f"Base URL: {base_url}, Page Number: {page_number}")
