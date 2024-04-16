import { Controller } from "@hotwired/stimulus"

export default class extends Controller {


    static targets = [
        "frame", "loader"
    ]

    showLoader() {
        if (this.timeout) {
            clearTimeout(this.timeout)
            this.timeout = null
            return
        }
        this.timeout = setTimeout(() => {
            this.loaderTarget.classList.remove("hidden")
            this.frameTarget.classList.add('hidden')
            this.timeout = null
        }, 300)
    }

    hideLoader() {
        if (this.timeout) {
            clearTimeout(this.timeout)
            this.timeout = null
            return
        }
        this.loaderTarget.classList.add("hidden")
        this.frameTarget.classList.remove('hidden')
    }
}
