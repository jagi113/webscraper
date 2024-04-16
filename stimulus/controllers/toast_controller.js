import { Controller } from "@hotwired/stimulus"


const DEFAULT_EXPIRE_IN_MILISECONDS = 5000

export default class extends Controller {

    static targets = ["toastBox"]
    static values = {removeParam: String}


    connect() {
        
        if (this.hasRemoveParamValue) {
            this.timeout = setTimeout(() => {
                var url = window.location.href;
                var urlObj = new URL(url);
                urlObj.searchParams.delete(this.removeParamValue);
    
                window.history.replaceState({}, document.title, urlObj.toString());
            }, 500)
        }

        setInterval(() => {
            const now = new Date().getTime()
            if (!this.toastBoxTarget.dataset.toastId) {
                this.toastBoxTarget.setAttribute('data-toast-id', Math.round(Math.random() * 1000000))
            }
            if (this.toastBoxTarget.dataset.expiresAt) {
                const date = new Date(parseInt(this.toastBoxTarget.dataset.expiresAt))
                if (now > date) {
                    this.hideToast(this.toastBoxTarget)
                }
            } else {
                let delta = DEFAULT_EXPIRE_IN_MILISECONDS
                this.toastBoxTarget.setAttribute('data-expires-at', `${now + delta}`)
            }
        }, 500)
    }

    hideToast() {
        this.toastBoxTarget.classList.add('opacity-0', 'translate-x-16')
        setTimeout(() => {
            this.toastBoxTarget.remove()
        }, 300)
    }

    disconnect() {
        if (this.timeout) {
            clearTimeout(this.timeout)
        }
    }

}
