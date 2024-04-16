import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
    static values = {};
    static targets = ["controllerContainer", "categoriesContainer", "subcategoryContainer"];

    initialize() {}

    connect() {}

    disconnect() {}

    toggleCategories(e) {
        e.preventDefault();
        this.categoriesContainerTarget.classList.toggle("hidden");
    }

    showSubcategory(e) {
        const clickedTarget = e.target;

        const parentId = clickedTarget.dataset.parentId;

        const currentOpened = this.controllerContainerTarget.querySelector("[data-open=true]");

        if (currentOpened && parentId === currentOpened.dataset.parentId) {
            currentOpened.dataset.open = false;
            currentOpened.classList.add("hidden");
            return;
        }

        this.subcategoryContainerTargets.forEach((container) => {
            if (container.dataset.open) {
                container.dataset.open = false;
                container.classList.add("hidden");
            }
        });

        this.subcategoryContainerTargets.forEach((container) => {
            if (container.dataset.parentId === parentId) {
                container.dataset.open = true;
                container.classList.remove("hidden");
            }
        });
    }
}
