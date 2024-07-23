import { Controller } from "@hotwired/stimulus";
import { loadScript, loadLink } from "./utils/load_script";

export default class extends Controller {
    static values = { content: String };
    static targets = ["content"];

    connect() {
        this.highlightContent().catch((error) => {
            console.error("Error highlighting content:", error);
        });
    }

    async highlightContent() {
        const htmlContent = this.contentValue;
        if (htmlContent) {
            try {
                await this.loadPrism();
                this.contentTarget.innerHTML = `<pre><code class="language-html">${Prism.highlight(
                    htmlContent,
                    Prism.languages.html,
                    "html"
                )}</code></pre>`;
            } catch (error) {
                console.error("Error during Prism highlighting:", error);
            }
            
        } else {
            console.error("No HTML content provided to highlight.");
        }
    }

    makeCodeInteractive() {
        // Add interactive functionality to your code blocks
        document.querySelectorAll('code[data-code-content="true"]').forEach((code) => {
          code.innerHTML = code.innerHTML
            .replace(/&lt;(\/?\w+)&gt;/g, (match, p1) => `<span class="collapsible">${match}</span>`)
            .replace(/&lt;(\/?\w+)&gt;/g, (match, p1) => `<span class="collapsible">${match}</span>`);
        });
        // Apply event listeners for collapsibles
        const collapsibleItems = document.querySelectorAll('.collapsible');
        collapsibleItems.forEach(item => {
          item.addEventListener('click', () => {
            item.classList.toggle('active');
          });
        });

    async loadPrism() {
        // Load the Prism.js CSS
        await loadLink({
            rel: "stylesheet",
            href: "https://cdnjs.cloudflare.com/ajax/libs/prism/1.25.0/themes/prism-tomorrow.min.css",
        });

        // Load the Prism.js script
        await loadScript({
            async: true,
            defer: true,
            src: "https://cdnjs.cloudflare.com/ajax/libs/prism/1.25.0/prism.min.js",
        });
    }
}
