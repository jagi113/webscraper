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

    if (htmlContent.startsWith("['") && htmlContent.endsWith("']")) {
      htmlContent = htmlContent.slice(2, -2); // Remove the "['" and "']"
      htmlContent = htmlContent.split("', '"); // Split into an array
    } else {
      htmlContent = [htmlContent];
    }

    if (htmlContent.length > 0) {
      try {
        await this.loadPrism();

        const highlightedResult = htmlContent
          .map((component) => {
            let reformattedComponent = this.addSpaces(component);

            const highlighted = Prism.highlight(
              reformattedComponent,
              Prism.languages.html,
              "html"
            );

            // Return the highlighted result wrapped in <pre> and <code>
            return `<pre><code class="language-html">${highlighted}</code></pre>`;
          })
          .join("<br><hr><br>");

        this.contentTarget.innerHTML = highlightedResult;

        this.hideSpinner();
      } catch (error) {
        console.error("Error during Prism highlighting:", error);
        this.hideSpinner();
      }
    } else {
      console.error("No HTML content provided to highlight.");
      this.contentTarget.innerHTML = "Nothing found!";
      this.hideSpinner();
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

  normalizeTabs(content) {
    const lines = content.split("\n");
    const tabbedLines = lines.filter((line) => line.match(/^\t+/));

    if (tabbedLines.length === 0) {
      return content;
    }

    const minTabs = Math.min(
      ...tabbedLines.map((line) => {
        const match = line.match(/^\t+/);
        return match[0].length;
      })
    );

    if (minTabs > 0) {
      return lines
        .map((line) => {
          if (line.startsWith("\t".repeat(minTabs))) {
            return line.slice(minTabs);
          }
          return line;
        })
        .join("\n");
    }

    return content;
  }

  addSpaces(content) {
    let contentWithspaces = content
      .replace(/\\r\\n/g, "\n")
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t");
    return this.normalizeTabs(contentWithspaces);
  }

  async loadPrism() {
    const prismCss =
      "https://cdnjs.cloudflare.com/ajax/libs/prism/1.25.0/themes/prism-tomorrow.min.css";
    const prismJs =
      "https://cdnjs.cloudflare.com/ajax/libs/prism/1.25.0/prism.min.js";

    if (!document.querySelector(`link[href="${prismCss}"]`)) {
      await loadLink({
        rel: "stylesheet",
        href: prismCss,
      });
    }

    if (!document.querySelector(`script[src="${prismJs}"]`)) {
      await loadScript({
        async: true,
        defer: true,
        src: prismJs,
      });
    }
  }
}
