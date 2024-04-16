import { Controller } from "@hotwired/stimulus"

export default class extends Controller {

    static targets = ["userAgentInput", "deviceWidthInput", "deviceHeightInput", "isLoggedInput", "form", "loader"]
    static values = {
        confirmUrl: String,
        closeUrl: String
    }
    
    connect() {
        this.userAgentInputTarget.value = navigator.userAgent
        this.deviceWidthInputTarget.value = window.innerWidth
        this.deviceHeightInputTarget.value = window.innerHeight
    }
    

    submit(event) {
        event.preventDefault()
        
        this.formTarget.classList.add('hidden')
        this.loaderTarget.classList.add('flex')
        this.loaderTarget.classList.remove('hidden')

        const formData = new FormData(event.target);

        fetch(this.confirmUrlValue, {
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .then(Turbo.renderStreamMessage)
        .catch(console.error)
    }

    close(event) {
        event.preventDefault()

        this.formTarget.classList.add('hidden')
        this.loaderTarget.classList.add('flex')
        this.loaderTarget.classList.remove('hidden')
        
        fetch(this.closeUrlValue, {
            method: 'POST',
            body: new FormData(this.formTarget)
        })
        .then(response => response.text())
        .then(Turbo.renderStreamMessage)
        .catch(console.error)

    }
}
