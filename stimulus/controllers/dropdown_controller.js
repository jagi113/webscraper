import { Controller } from "@hotwired/stimulus"

export default class extends Controller {

    static targets = ["menu"]

    connect() {
    }

    toggle() {
        this.menuTarget.classList.toggle('hidden')
    }

    hide(event) {
        if (!this.element.contains(event.target) && !this.menuTarget.classList.contains('hidden')) {
            this.menuTarget.classList.add('hidden')
        }
    }
}
