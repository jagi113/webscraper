import { Controller } from "@hotwired/stimulus"

export default class extends Controller {

    static values = {}

    static targets = ["checkbox", "box"]

    initialize() { }

    connect() {
        this.change()
    }

    disconnect() { }

    isChecked() {
        if (this.hasCheckboxTarget) {
            return this.checkboxTarget.checked
        }
    }

    change() {
        const classes = ["border-blue-500", "-translate-y-0.5", "shadow-lg", "bg-indigo-50"]
        if (this.isChecked()) {
            this.boxTarget.classList.remove("shadow-md")
            this.boxTarget.classList.add(...classes)
        } else {
            this.boxTarget.classList.remove(...classes)
            this.boxTarget.classList.add("shadow-md")
        }
    }
}
