import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
    static values = {
        modalContainerId: {
            type: String,
            default: "modal-root",
        },
    };

    static targets = [];

    initialize() {}

    connect() {}

    disconnect() {}

    closeModal() {
        const modalContainer = document.getElementById(this.modalContainerIdValue);
        modalContainer.innerHTML = "";
    }
}
