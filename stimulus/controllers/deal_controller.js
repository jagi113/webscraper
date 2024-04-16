import { Controller } from "@hotwired/stimulus"

export default class extends Controller {



    static targets = [
        "price", "unit", "dealCheckbox", "container"
    ]

    connect() {
        if (this.dealCheckboxTarget.checked) {
            this.hide()
        }
    }

    toggle() {
        if (this.dealCheckboxTarget.checked) {
            this.hide()
        } else {
            this.show()
        }
    }

    hide() {
        this.containerTarget.classList.add("hidden")
        this.containerTarget.classList.remove("flex")
        this.priceTarget.value = 0
        this.unitTarget.value = ""
    }

    show() {
        this.containerTarget.classList.add("flex")
        this.containerTarget.classList.remove("hidden")
    }
}
