import { Controller } from "@hotwired/stimulus";
import { is_wedding, is_living } from "./../utils/utils";

export default class extends Controller {
    static outlets = ["search--main-modal"];
    static targets = ["container", "iconContainer", "icon"];

    focus() {
        const classesToAdd = [];
        if (is_wedding) {
            classesToAdd.push(
                "border",
                "border-solid",
                "border-red-600",
                "bg-white"
            );
        } else if (is_living) {
            classesToAdd.push(
                "border",
                "border-solid",
                "border-[#003b71]",
                "bg-white"
            );
        } else {
            classesToAdd.push(
                "border",
                "border-solid",
                "border-green-600",
                "bg-white"
            );
        }

        const previousClasses = this.containerTarget.getAttribute("class");
        this.containerTarget.dataset.previousClasses = previousClasses;
        this.containerTarget.classList.remove(
            "bg-[#e1d6d6]",
            "bg-[#012d55]",
            "bg-[#edf0ef]",
            "bg-blue-100"
        );
        this.containerTarget.classList.add(...classesToAdd);
        this.iconContainerTarget.classList.add("bg-primary-500");
        this.iconTarget.classList.remove("bg-primary-500");
        this.iconTarget.classList.add("bg-white");
    }

    blur() {
        const previousClasses = this.containerTarget.dataset.previousClasses;

        if (previousClasses) {
            this.containerTarget.setAttribute("class", previousClasses);
        }

        this.iconContainerTarget.classList.remove("bg-primary-500");
        this.iconTarget.classList.remove("bg-white");
        this.iconTarget.classList.add("bg-primary-500");
    }

    keyUpHandler(event) {
        if (event.target.value.length === 0) {
            return;
        }

        this.searchMainModalOutlet.display();
        this.searchMainModalOutlet.setSearchAndFocus(event.target.value);
        this.searchMainModalOutlet.setInitiatorElement(event.target);

        const previousTarget = event.target;

        setTimeout(() => {
            previousTarget.value = "";
        }, 10);
    }
}
