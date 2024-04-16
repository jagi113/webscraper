import { Controller } from "@hotwired/stimulus"

export default class extends Controller {

  static values = {}
  static targets = ["dropdown", "container"]

  hideDropdown() {
    this.dropdownTarget.classList.add('hidden')
    this.dropdownTarget.classList.remove('flex')
  }

  documentClickHandler(event) {
    
    if (this.containerTarget.contains(event.target)) {
      return
    }
    
    this.hideDropdown()
  }


  registerDocumentClick() {
    document.addEventListener('click', this.documentClickHandler.bind(this))
  }

  toggleDropdown() {
    this.dropdownTarget.classList.toggle('hidden')
    this.dropdownTarget.classList.toggle('flex')
  }

  connect() {
    this.registerDocumentClick()
  }

  disconnect() {
    document.removeEventListener('click', this.documentClickHandler)
  }
}
