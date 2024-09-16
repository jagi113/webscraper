import re


def is_valid_css_selector(selector):
    css_pattern = re.compile(r'^[a-zA-Z0-9\s\.\#\>\+\~\[\]=:"\'\*\^$\(\)-_]+$')
    return bool(css_pattern.match(selector))


def is_valid_xpath_selector(selector):
    xpath_pattern = re.compile(r'^[a-zA-Z0-9\s\./\@\[\]=\'"()]+$')
    return bool(xpath_pattern.match(selector))
