import logging
import html
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
        selector = Selector(text=html_content)
        print(html_type_of_value)

        # Unescape the value to match encoded HTML content
        normalized_value = html.unescape(value.strip())

        path_parts = []
        is_attribute = None

        if html_type_of_value == "text" or html_type_of_value == "text()":
            element = selector.xpath(
                f"//*[contains(normalize-space(text()), '{normalized_value}')]"
            )
            is_attribute = "text()"
        elif html_type_of_value:
            print("html_type_of_value identified and trying to find the element")

            if not html_type_of_value.startswith("@"):
                html_type_of_value = f"@{html_type_of_value}"

            # Use contains to match partially if necessary
            element = selector.xpath(
                f"//*[{html_type_of_value}='{normalized_value}'] | //*[{html_type_of_value}[contains(., '{normalized_value}')]]"
            )

            print("Element found based on html_type_of_value")
            print(element)
            is_attribute = html_type_of_value
            print(f"Attribute is: {is_attribute}")
        else:
            # Check across multiple attributes, using contains for partial match
            element = selector.xpath(
                f"//*[contains(normalize-space(text()), '{normalized_value}') "
                f"or contains(@href, '{normalized_value}') "
                f"or contains(@src, '{normalized_value}') "
                f"or contains(@title, '{normalized_value}')]"
            )

        if not element or len(element) == 0:
            return None, None
        print("element passed no element condition")

        if is_attribute is None:
            if element.xpath("./@href"):
                href_value = element.xpath("./@href").get()
                if href_value == normalized_value:
                    is_attribute = "@href"
            elif element.xpath("./@src"):
                src_value = element.xpath("./@src").get()
                if src_value == normalized_value:
                    is_attribute = "@src"
            elif element.xpath("./@title"):
                title_value = element.xpath("./@title").get()
                if title_value == normalized_value:
                    is_attribute = "@title"
            else:
                is_attribute = "text()"

        print(is_attribute)
        while element:
            tag = element.xpath("name()").get()
            if not tag or tag in ["html", "body"]:
                break

            print("Tag is " + tag)

            element_classes = element.xpath("./@class").get()
            print(element_classes)

            selector_part = tag

            if element_classes:
                classes = element_classes.split()
                selector_part += "".join([f".{cls}" for cls in classes])

            path_parts.append(selector_part)

            element = element.xpath("parent::*")

        if selector_type.lower() == "css":
            css_selector = " ".join(reversed(path_parts))
            print(css_selector)
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
        print(css_selector)
        print(value_attribute)

        if css_selector:
            return selector.css(css_selector).xpath(value_attribute).getall()
        elif xpath_selector:
            return selector.xpath(xpath_selector).xpath(value_attribute).getall()
        else:
            raise ValueError("Either css_selector or xpath_selector must be provided")
