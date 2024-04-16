import { Controller } from "@hotwired/stimulus"



export default class extends Controller {

    static values = {
        currencyLabel: String,
        zeroLabel: String,
        dealLabel: String,
    }

    static targets = [
        "priceOutput", "oldPriceOutput", "unitOutput",
        "price", "oldPrice", "unit",
        "container", "dealCheckbox",
    ]

    connect() {
        if (this.dealCheckboxTarget.checked) {
            this.hide()
        } else {
            this.changeOldPrice()
            this.changePrice()
            this.changeUnit()
        }
    }


    changePrice() {
        const priceValue = this.priceTarget.value
        if (parseFloat(priceValue) === 0) {
            this.priceOutputTarget.textContent = this.zeroLabelValue
        } else {
            this.priceOutputTarget.textContent = !priceValue ? priceValue : this.format_price(priceValue) + this.currencyLabelValue
        }
    }

    changeOldPrice() {
        const oldPriceValue = this.oldPriceTarget.value
        if (parseFloat(oldPriceValue) === 0) {
            this.oldPriceOutputTarget.textContent = ''
        } else {
            this.oldPriceOutputTarget.textContent = !oldPriceValue ? oldPriceValue : this.format_price(oldPriceValue) + this.currencyLabelValue
        }
    }

    changeUnit() {
        const unitValue = this.unitTarget.value
        this.unitOutputTarget.textContent = !unitValue ? unitValue : '/ ' + unitValue
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
        this.oldPriceTarget.value = this.unitTarget.value = this.oldPriceOutputTarget.textContent = this.unitOutputTarget.textContent = ""
        this.priceOutputTarget.textContent = this.dealLabelValue
    }

    show() {
        this.containerTarget.classList.add("flex")
        this.containerTarget.classList.remove("hidden")
        this.changeOldPrice()
        this.changePrice()
        this.changeUnit()
    }

    format_price(value) {
        var parts = value.toString().split(".")
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ")
        return parts.join(".")
    }
}
