import { Controller } from "@hotwired/stimulus"

export default class extends Controller {

    static targets = ['checkbox', 'warning']

    checkboxClick(event) {
        const target = event.target

        if (target.checked) {
            this.warningTarget.classList.add('hidden')
        }
    }

    formSubmit(event) {

        if (this.hasCheckboxTarget && this.checkboxTarget.checked === false) {
            this.warningTarget.classList.remove('hidden')
            event.preventDefault()
        }

    }

}

