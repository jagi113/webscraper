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

    def generate_selector(self, html_content, selector_type, value, attribute=None):
        selector = Selector(text=html_content)
        print(attribute)

        # Unescape the value to match encoded HTML content
        normalized_value = html.unescape(value.strip())

        path_parts = []

        if attribute:
            if attribute == "text" or attribute == "text()":
                element = selector.xpath(
                    f"//*[contains(normalize-space(text()), '{normalized_value}')]"
                )
                attribute = "text()"
            print("attribute identified and trying to find the element")

            if not attribute.startswith("@"):
                attribute = f"@{attribute}"

            # Use contains to match partially if necessary
            element = selector.xpath(
                f"//*[{attribute}='{normalized_value}'] | //*[{attribute}[contains(., '{normalized_value}')]]"
            )

            print("Element found based on attribute")
            print(element)
            print(f"Attribute is: {attribute}")
        else:
            print("No attribute provided")
            element = selector.xpath(
                f"//*[contains(normalize-space(text()), '{normalized_value}') "
                f"or contains(@href, '{normalized_value}') "
                f"or contains(@src, '{normalized_value}') "
                f"or contains(@title, '{normalized_value}')]"
            )
        print(attribute)
        if not element or len(element) == 0:
            return None, None
        print("element passed no element condition")
        print(attribute)
        if not attribute:
            if element.xpath("./@href"):
                href_value = element.xpath("./@href").get()
                if href_value == normalized_value:
                    attribute = "@href"
            elif element.xpath("./@src"):
                src_value = element.xpath("./@src").get()
                if src_value == normalized_value:
                    attribute = "@src"
            elif element.xpath("./@title"):
                title_value = element.xpath("./@title").get()
                if title_value == normalized_value:
                    attribute = "@title"
            else:
                attribute = "text()"

        print(attribute)
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
            return css_selector, attribute
        elif selector_type.lower() == "xpath":
            xpath_selector = "/" + "/".join(reversed(path_parts))
            return xpath_selector, attribute
        else:
            raise ValueError("Invalid selector type. Please use 'css' or 'xpath'.")

    def get_values(
        self, html_content, attribute, css_selector=None, xpath_selector=None
    ):
        selector = Selector(text=html_content)
        print(css_selector)
        print(attribute)

        if css_selector:
            return selector.css(css_selector).xpath(attribute).getall()
        elif xpath_selector:
            return selector.xpath(xpath_selector).xpath(attribute).getall()
        else:
            raise ValueError("Either css_selector or xpath_selector must be provided")
