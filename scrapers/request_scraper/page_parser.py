import logging
import html
from parsel import Selector

logger = logging.getLogger("django")


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
        normalized_value = html.unescape(value.strip())

        logger.debug(f"Element is: {selector}")
        logger.debug(f"Value to search for in components: {normalized_value}")

        if attribute:
            logger.debug("attribute identified and trying to find the element")
            if attribute.lower() in ["text", "text()"]:
                xpath_query = (
                    f"//*[contains(normalize-space(string(.)), '{normalized_value}')]"
                )
                attribute = "text()"
            else:
                if not attribute.startswith("@"):
                    attribute = f"@{attribute}"
                xpath_query = f"//*[{attribute}='{normalized_value}'] | //*[{attribute}[contains(., '{normalized_value}')]]"

            element = selector.xpath(xpath_query)

            logger.debug(f"Attribute by user is: {attribute}")
            logger.debug(f"Element found: \n {element.get()}")
        else:
            logger.debug(
                "No specific attribute provided, searching across text, href, src, and title"
            )
            element = selector.xpath(
                f"(//*[contains(normalize-space(string(.)), '{normalized_value}') "
                f"or contains(@href, '{normalized_value}') "
                f"or contains(@src, '{normalized_value}') "
                f"or contains(@title, '{normalized_value}')])[1]"
            )
            logger.debug(f"Element found: {element.get()}")

        if not element or len(element) == 0:
            logger.debug(f"Value '{normalized_value}' not found in an element")
            return None, None

        logger.debug("Element passed no element condition")

        if not attribute:
            if element.xpath("./@href").get() == normalized_value:
                attribute = "@href"
            elif element.xpath("./@src").get() == normalized_value:
                attribute = "@src"
            elif element.xpath("./@title").get() == normalized_value:
                attribute = "@title"
            elif normalized_value in element.xpath("normalize-space(string(.))").get():
                child = element.xpath(
                    f"//*[contains(normalize-space(string(.)), '{normalized_value}')]"
                )
                filtered_html_body_out = [
                    el
                    for el in child
                    if el.xpath("name()").get() not in ["html", "body"]
                ]
                element = filtered_html_body_out[-1]
                logger.debug(f"Child found: {element.get()}")
                attribute = "text()"

        logger.debug(f"Attribute is: {attribute}")

        path_parts = []

        while element is not None:
            logger.debug(element.get())
            tag = element.xpath("name()").get()
            logger.debug("Tag is " + tag)
            if not tag or tag in ["html", "body"]:
                break

            logger.debug("Tag is " + tag)

            element_classes = element.xpath("./@class").get()
            logger.debug(f"Element classes: {element_classes}")

            if element_classes:
                classes = element_classes.split()
                selector_part = tag + "".join([f".{cls}" for cls in classes])
            else:
                selector_part = tag

            path_parts.append(selector_part)

            element = element.xpath("parent::*")

        if selector_type.lower() == "css":
            css_selector = " ".join(reversed(path_parts))
            logger.debug(f"css_selector is: {css_selector}")
            return css_selector, attribute
        elif selector_type.lower() == "xpath":
            xpath_selector = "/" + "/".join(reversed(path_parts))
            logger.debug(f"xpath_selector is: {xpath_selector}")
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
