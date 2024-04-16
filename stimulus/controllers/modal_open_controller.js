import { Controller } from "@hotwired/stimulus"

export default class extends Controller {

  static values = {}

  static targets = []

  connect() {
    document.body.style.overflow = "hidden"
  }

  disconnect() {
    document.body.style.overflow = "auto"
  }

}
