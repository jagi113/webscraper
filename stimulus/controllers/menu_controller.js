import { Controller } from "@hotwired/stimulus"

export default class extends Controller {

    static targets = ["container"]

    connect = () => {
        if (window.innerWidth >= 768) {
            document.addEventListener('scroll', this.change)
        }
    }

    change = (e) => {
        const positionY = window.scrollY
        if (positionY < 1) {
            this.showContainer()
        } else {
            this.hideContainer()
        }
    }

    hideContainer = () => {
        this.containerTarget.classList.remove('top-0')
        this.containerTarget.classList.add('-top-[40px]')
    }

    showContainer = () => {
        this.containerTarget.classList.remove('-top-[40px]')
        this.containerTarget.classList.add('top-0')
    }

    disconnect = () => {
        document.removeEventListener('scroll', this.change)
    }
}
