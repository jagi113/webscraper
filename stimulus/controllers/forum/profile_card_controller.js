import { Controller } from "@hotwired/stimulus";
import hoverintent from "./../utils/hoverintent";
import { sendPlausibleEvent } from "./../utils/plausible";

const opts = {
    sensitivity: 8,
    interval: 300,
};

export default class extends Controller {
    static targets = ["profilePicture", "profileName", "card"];

    connect() {
        this.handleResize();
    }

    handleResize() {
        if (this.hoverListenerPicture) {
            this.hoverListenerPicture.remove();
            this.hoverListenerPicture = null;
        }
        if (this.hoverListenerName) {
            this.hoverListenerName.remove();
            this.hoverListenerName = null;
        }

        const viewport_width = document.documentElement.clientWidth;

        if (viewport_width >= 640) {
            const card = this.cardTarget;

            const applyHoverIntentOnTarget = (target) => {
                return hoverintent(
                    target,
                    function () {
                        card.classList.remove("hidden");
                    },
                    function () {
                        card.classList.add("hidden");
                    }
                ).options(opts);
            };

            this.hoverListenerPicture = applyHoverIntentOnTarget(
                this.profilePictureTarget
            );
            this.hoverListenerName = applyHoverIntentOnTarget(
                this.profileNameTarget
            );
        }
    }

    showCard() {
        const viewport_width = document.documentElement.clientWidth;

        if (viewport_width < 640) {
            this.cardTarget.classList.remove("hidden");
            document.body.classList.add("overflow-hidden");
        }
    }

    closeCard() {
        const viewport_width = document.documentElement.clientWidth;
        this.cardTarget.classList.add("hidden");
        if (viewport_width < 640) {
            document.body.classList.remove("overflow-hidden");
        }
    }

    disconnect() {
        this.closeCard();

        if (this.hoverListenerPicture) {
            this.hoverListenerPicture.remove();
        }
        if (this.hoverListenerName) {
            this.hoverListenerName.remove();
        }
    }
}
