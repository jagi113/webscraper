import logging
from parsel import Selector

logger = logging.getLogger(__name__)


class PageParser:
    def parse(self, html_content, css_selector=None, xpath_selector=None):
        selector = Selector(text=html_content)

        if css_selector:
            return selector.css(css_selector).extract()
        elif xpath_selector:
            return selector.xpath(xpath_selector).extract()
        else:
            raise ValueError("Either css_selector or xpath_selector must be provided")

    def generate_selector(
        self, html_content, selector_type, value, html_type_of_value=None
    ):
        # Parse the entire HTML content
        selector = Selector(text=html_content)

        # Normalize the value (remove spaces or special characters)
        normalized_value = value.strip()

        path_parts = []

        # Find the element based on the html_type_of_value or attributes
        if html_type_of_value == "text" or html_type_of_value == "text()":
            # Look for the text content that contains the value
            element = selector.xpath(
                f"//*[contains(normalize-space(text()), '{normalized_value}')]"
            )
            is_attribute = "text()"
        elif html_type_of_value:
            # Look for a specific attribute
            if html_type_of_value[0] != "@":
                html_type_of_value = "@" + html_type_of_value
            element = selector.xpath(f"//*[{html_type_of_value}='{normalized_value}']")
            is_attribute = html_type_of_value
        else:
            # Look for any occurrence in text or attributes (href, src, title)
            element = selector.xpath(
                f"//*[contains(normalize-space(text()), '{normalized_value}') "
                f"or @href='{normalized_value}' "
                f"or @src='{normalized_value}' "
                f"or @title='{normalized_value}']"
            )

        if not element:
            return None  # Return None if no element is found

        #  Start building the selector by traversing the found element upwards

        # Check for attribute-based matches (href, src, title) and embed in selector
        if element.xpath("./@href"):
            href_value = element.xpath("./@href").extract_first()
            if href_value == normalized_value:
                is_attribute = "@href"
        elif element.xpath("./@src"):
            src_value = element.xpath("./@src").extract_first()
            if src_value == normalized_value:
                is_attribute = "@src"
        elif element.xpath("./@title"):
            title_value = element.xpath("./@title").extract_first()
            if title_value == normalized_value:
                is_attribute = "@title"
        elif not html_type_of_value:
            is_attribute = "text()"

        while element:
            # Get the current tag name
            tag = element.xpath("name()").extract_first()
            if not tag or tag in ["html", "body"]:
                break

            # Add class and id if available
            element_id = element.xpath("./@id").extract_first()
            element_classes = element.xpath("./@class").extract_first()

            # Start building the part of the selector
            selector_part = tag
            if element_id:
                selector_part += f"#{element_id}"
            if element_classes:
                classes = element_classes.split()
                selector_part += "".join([f".{cls}" for cls in classes])

            # Add this part to the path
            path_parts.append(selector_part)

            # Move to the parent node
            element = element.xpath("parent::*")

        # Build the final selector depending on type
        if selector_type.lower() == "css":
            css_selector = " ".join(reversed(path_parts))
            return css_selector, is_attribute
        elif selector_type.lower() == "xpath":
            xpath_selector = "/" + "/".join(reversed(path_parts))
            return xpath_selector, is_attribute
        else:
            raise ValueError("Invalid selector type. Please use 'css' or 'xpath'.")

    def get_values(
        self, html_content, value_attribute, css_selector=None, xpath_selector=None
    ):
        selector = Selector(text=html_content)

        if css_selector:
            return selector.css(css_selector).xpath(value_attribute).getall()
        elif xpath_selector:
            return selector.xpath(xpath_selector).xpath(value_attribute).getall()
        else:
            raise ValueError("Either css_selector or xpath_selector must be provided")
