import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static values = {
    modalContainerId: { type: String, default: "modal-root" },
    html: String,
  };
  static targets = [];

  initialize() {}

  connect() {}

  disconnect() {}

  openModal() {
    const modalContainer = document.getElementById(this.modalContainerIdValue);
    if (modalContainer) {
      modalContainer.innerHTML = this.htmlValue;
    }
    document.addEventListener("keydown", this.handleKeyDown);
  }

  closeModal(event) {
    if (event) event.preventDefault();
    const modalContainer = document.getElementById(this.modalContainerIdValue);
    if (modalContainer) {
      modalContainer.innerHTML = "";
    }
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  handleKeyDown = (event) => {
    if (event.key === "Escape") this.closeModal();
  };
}
