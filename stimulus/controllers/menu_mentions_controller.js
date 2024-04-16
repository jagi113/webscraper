import MenuMessagesController from "./menu_messages_controller";

export default class extends MenuMessagesController {
    static targets = ["menuitem", "container", "loader", "dropdownContent"];
    static values = {
        url: String,
        count: Number,
        setNewMentionsToOldUrl: String,
    };

    // sends information to server and refresh all new mentions to not-new
    setNewMentionsToOld = () => {
        fetch(this.setNewMentionsToOldUrlValue).catch(console.error);
    };

    loadDropdown = () => {
        if (this.hasUrlValue === false) {
            throw "url value in menu_mentions_controller.js is not defined";
        }

        if (this.hasContainerValue === false) {
            throw "container target in menu_mentions_controller.js is not defined";
        }

        if (this.cachedAt === null || this.cacheExpired()) {
            this.showLoader();

            fetch(this.urlValue)
                .then((response) => response.text())
                .then((html) => {
                    this.dropdownContentTarget.innerHTML = html;
                    this.cachedAt = new Date();

                    // in 1000ms, go and set new mentions to old. (API request) without awaiting
                    this.timeout = setTimeout(this.setNewMentionsToOld, 1000);
                })
                .catch((err) => console.error(err))
                .finally(this.hideLoader);
        }
    };

    disconnect() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    }
}
