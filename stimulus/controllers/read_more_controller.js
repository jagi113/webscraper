import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
    static targets = ["full", "short", "toggler"];
    static values = {
        moreText: String,
        lessText: String,
        maxLength: {
            type: Number,
            default: 50,
        },
    };

    connect() {
        this.open = false;

        // Select the node that will be observed for mutations
        const targetNode = this.shortTarget;

        // Options for the observer (which mutations to observe)
        const config = { attributes: false, childList: true, subtree: false };

        // Callback function to execute when mutations are observed
        const callback = (mutationList, observer) => {
            for (const mutation of mutationList) {
                if (mutation.type === "childList") {
                    if (this.hasTogglerTarget) {
                        if (mutation.addedNodes[0].data.length < this.maxLengthValue) {
                            this.togglerTarget.classList.add("hidden");
                        } else {
                            this.togglerTarget.classList.remove("hidden");
                        }
                    }
                }
            }
        };

        this.observer = new MutationObserver(callback);

        // Start observing the target node for configured mutations
        this.observer.observe(targetNode, config);
    }

    toggle(event) {
        this.open === false ? this.show(event) : this.hide(event);
    }

    show(event) {
        this.open = true;

        const target = event.target;
        target.innerHTML = this.lessTextValue;
        this.fullTarget.classList.remove("hidden");
        this.shortTarget.classList.add("hidden");
    }

    hide(event) {
        this.open = false;

        const target = event.target;
        target.innerHTML = this.moreTextValue;
        this.fullTarget.classList.add("hidden");
        this.shortTarget.classList.remove("hidden");
    }

    disconnect = () => {
        if (this.observer) {
            this.observer.disconnect();
        }
    };
}
