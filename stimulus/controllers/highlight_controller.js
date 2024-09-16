import { Controller } from "@hotwired/stimulus";
import { loadScript, loadLink } from "./utils/load_script";

export default class extends Controller {
    static values = { content: String };
    static targets = ["content", "spinner"];

    connect() {
        this.showSpinner();
        this.highlightContent().catch((error) => {
            console.error("Error highlighting content:", error);
        });
    }

    async highlightContent() {
        let htmlContent = this.contentValue;
        if (htmlContent) {
            console.log("Content loaded");
            try {
                await this.loadPrism();
                this.contentTarget.innerHTML = `<pre><code class="language-html">${Prism.highlight(
                    htmlContent,
                    Prism.languages.html,
                    "html"
                )}</code></pre>`;
                this.hideSpinner();
                this.makeTagsCollapsible();
            } catch (error) {
                console.error("Error during Prism highlighting:", error);
                this.hideSpinner(); // Hide spinner even if there's an error
            }
        } else {
            console.error("No HTML content provided to highlight.");
            this.hideSpinner(); // Hide spinner if no content
        }
    }

    showSpinner() {
        this.spinnerTarget.classList.remove("hidden");
    }

    hideSpinner() {
        this.spinnerTarget.classList.add("hidden");
    }

    makeTagsCollapsible() {
        const tagElements = this.contentTarget.querySelectorAll(".token.tag");

        tagElements.forEach((tag) => {
            const spanWrapper = document.createElement("span");
            spanWrapper.classList.add("collapsible");
            tag.parentNode.replaceChild(spanWrapper, tag);
            spanWrapper.appendChild(tag);

            spanWrapper.addEventListener("click", () => {
                spanWrapper.classList.toggle("active");
            });
        });
    }

    async loadPrism() {
        const prismCss =
            "https://cdnjs.cloudflare.com/ajax/libs/prism/1.25.0/themes/prism-tomorrow.min.css";
        const prismJs =
            "https://cdnjs.cloudflare.com/ajax/libs/prism/1.25.0/prism.min.js";

        if (!document.querySelector(`link[href="${prismCss}"]`)) {
            console.log("Loading prismCSS");
            await loadLink({
                rel: "stylesheet",
                href: prismCss,
            });
        }

        if (!document.querySelector(`script[src="${prismJs}"]`)) {
            console.log("Loading prismJS");
            await loadScript({
                async: true,
                defer: true,
                src: prismJs,
            });
        }
        console.log("PrismCSS and PrismJS loaded");
    }
}
