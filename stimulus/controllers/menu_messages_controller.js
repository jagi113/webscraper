import { Controller } from "@hotwired/stimulus";

const CACHE_FOR_SECONDS = 30;

export default class extends Controller {
    static targets = ["menuitem", "container", "loader", "dropdownContent"];
    static values = {
        url: String,
        count: Number,
    };

    connect() {
        this.open = false;
        this.cachedAt = null;
        this.currentCount = 0;

        // register document click for closing menu
        document.addEventListener(
            "click",
            function (e) {
                const target = e.target;

                if (!this.menuitemTarget.contains(target)) {
                    this.closePanel();
                }
            }.bind(this)
        );
    }

    countValueChanged() {
        // if value changed, invalidate cache and refresh messages count
        if (this.currentCount != this.countValue) {
            this.currentCount = this.countValue;
            this.cachedAt = null;
        }
    }

    cacheExpired() {
        if (this.cachedAt === null) {
            return false;
        }

        return (
            this.cachedAt.getTime() + CACHE_FOR_SECONDS * 1000 <
            new Date().getTime()
        );
    }

    showLoader = () => {
        this.loaderTarget.classList.add("flex");
        this.loaderTarget.classList.remove("hidden");
    };

    hideLoader = () => {
        this.loaderTarget.classList.add("hidden");
        this.loaderTarget.classList.remove("flex");
    };

    closePanel = () => {
        this.containerTarget.classList.add("hidden");
        this.containerTarget.classList.remove("flex");
        this.open = false;
    };

    openPanel = () => {
        this.containerTarget.classList.remove("hidden");
        this.containerTarget.classList.add("flex");
        this.open = true;
    };

    toggle = () => {
        // if is opened, then close
        if (this.open) {
            this.closePanel();

            // if is closed, then open and load messages
        } else {
            this.openPanel();
            this.loadDropdown();
        }
    };

    loadDropdown = () => {
        if (this.hasUrlValue === false) {
            throw "url value in menu_messages_controller.js is not defined";
        }

        if (this.hasContainerValue === false) {
            throw "container target in menu_messages_controller.js is not defined";
        }

        if (this.cachedAt === null || this.cacheExpired()) {
            this.showLoader();

            fetch(this.urlValue)
                .then((response) => response.text())
                .then((html) => {
                    this.dropdownContentTarget.innerHTML = html;
                    this.cachedAt = new Date();
                })
                .catch(console.error)
                .finally(this.hideLoader);
        }
    };
}
