import { Controller } from "@hotwired/stimulus";
import { is_sk, is_wedding } from "./../utils/utils";
export default class extends Controller {
    static targets = ["messageContainer"];

    static values = {
        messageId: Number,
    };

    scrollToMessage(timeout) {
        if (this.messageIdValue) {
            this.messageContainerTargets.forEach((message) => {
                if (message.id == this.messageIdValue) {
                    this.timeout = setTimeout(() => {
                        message.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                            inline: "nearest",
                        });
                        message.classList.add("bg-gray-100");
                        message.classList.add("border-primary-600");
                    }, timeout);
                    this.timeout = setTimeout(() => {
                        message.classList.remove("bg-gray-100");
                        message.classList.remove("border-primary-600");
                    }, 2000);
                }
            });
        }
    }

    connect() {
        const isPreview =
            document.documentElement.hasAttribute("data-turbo-preview");
        if (isPreview) {
            return;
        }

        const timeout = is_sk && is_wedding ? 1000 : 800;

        setTimeout(() => {
            this.observer = new ResizeObserver(() => {
                this.scrollToMessage(200);
            });

            // remove observer after some time, the observer is only needed at load
            setTimeout(() => {
                if (this.observer) {
                    this.observer.disconnect();
                }
            }, 1000);

            this.observer.observe(document.body);
        }, timeout);
    }

    handleClick(event) {
        const id = event.params.id;
        this.messageContainerTargets.forEach((message) => {
            if (message.id == id) {
                event.preventDefault();
                message.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                    inline: "nearest",
                });
                message.classList.add("bg-gray-100");
                message.classList.add("border-primary-600");
                this.timeout = setTimeout(() => {
                    message.classList.remove("bg-gray-100");
                    message.classList.remove("border-primary-600");
                }, 2000);
            }
        });
    }

    disconnect() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}
