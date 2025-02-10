import re


def separate_url_and_page_num(url):
    # Regular expression patterns to match different page formats
    patterns = {
        r"(.*page/)(\d+)/(\.\w+)?$": lambda match: (match.group(1), match.group(2)),                 # "/page/{number}/"
        r"(.*[?&]page=)(\d+)([&/].*)?$": lambda match: (match.group(1), match.group(2)),            # "?page={number}"
        r"(.*[?&]page_num=)(\d+)([&/].*)?$": lambda match: (match.group(1), match.group(2)),        # "?page_num={number}"
        r"(.*)/(\d+)/(\.\w+)?$": lambda match: (match.group(1) + "/", match.group(2)),              # "/{number}/"
        r"(.*p=)(\d+)([&/].*)?$": lambda match: (match.group(1), match.group(2)),                   # "p={number}"
        r"(.*page-)(\d+)(\.\w+)?$": lambda match: (match.group(1), match.group(2)),                 # "page-{number}"
    }
        
    for pattern, extractor in patterns.items():
        match = re.match(pattern, url)
        if match:
            return extractor(match)

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
