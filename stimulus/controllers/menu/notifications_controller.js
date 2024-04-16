import { Controller } from "@hotwired/stimulus";

const refreshTab = (target, count) => {
    if (count) {
        target.classList.remove("hidden");
        target.classList.add("flex");
        target.innerText = count;
    } else {
        target.classList.add("hidden");
        target.classList.remove("flex");
    }
};

export default class extends Controller {
    static values = {};
    static targets = [
        "personal",
        "messages",
        "messagesController",
        "submenuMessages",
        "mentions",
        "mentionsController",
    ];

    getAndRefreshData() {
        const response = fetch("/api/v1/notifications-mails-new-count");

        response
            .then((data) => data.json())
            .then((json) => {
                const {
                    new_notifications_count = 0,
                    new_mails_count = 0,
                    new_bazaar_messages_count = 0,
                } = json;

                refreshTab(this.personalTarget, new_bazaar_messages_count);
                refreshTab(this.messagesTarget, new_mails_count);
                refreshTab(
                    this.submenuMessagesTarget,
                    new_bazaar_messages_count
                );
                refreshTab(this.mentionsTarget, new_notifications_count);

                // refresh cache of the message controller
                this.messagesControllerTarget.setAttribute(
                    "data-menu-messages-count-value",
                    new_mails_count
                );

                // refresh cache of the message controller
                this.mentionsControllerTarget.setAttribute(
                    "data-menu-messages-count-value",
                    new_notifications_count
                );
            })
            .catch((error) => console.warn(error));
    }

    registerInterval() {
        // initial get data
        this.getAndRefreshData();

        // get afterwards every 10 secs
        this.interval = setInterval(this.getAndRefreshData.bind(this), 10000);
    }

    connect() {
        this.registerInterval();
    }

    disconnect() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
}
