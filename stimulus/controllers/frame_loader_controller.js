import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
    static values = {
        delay: {
            type: Number,
            default: 0,
        },
    };
    static targets = ["loader", "frame"];

    disconnect() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    }

    showLoader(event) {
        if (event.target.tagName !== "TURBO-FRAME") {
            return;
        }

        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
            return;
        }
        if (this.delayValue > 0) {
            this.loaderTarget.classList.remove("hidden");
            this.frameTarget.classList.add("hidden");
        } else {
            this.timeout = setTimeout(() => {
                this.loaderTarget.classList.remove("hidden");
                this.frameTarget.classList.add("hidden");
                this.timeout = null;
            }, this.delayValue);
        }
    }

    hideLoader(event) {
        if (event.target.tagName !== "TURBO-FRAME") {
            return;
        }

        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
            return;
        }
        this.loaderTarget.classList.add("hidden");
        this.frameTarget.classList.remove("hidden");
    }
}
