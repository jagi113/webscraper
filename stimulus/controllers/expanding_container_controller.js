import { Controller } from "@hotwired/stimulus"

export default class extends Controller { 

  static values = {sizeclass: String}
  static targets = ["button", "container"]
  
  toggleVisibility(element, isVisible) {
    if (element) {
      element.classList.toggle("visible", isVisible);
      element.classList.toggle("hidden", !isVisible);
    }
  }

  minimizeContainer() {
    this.containerTarget.classList.add(this.sizeclassValue, "overflow-hidden");
    this.containerTarget.classList.remove("flex", "flex-col", "expanded");
    
    this.toggleVisibility(this.showMore, true);
    this.toggleVisibility(this.showLess, false);
  }

  maximizeContainer() {
    this.containerTarget.classList.remove(this.sizeclassValue, "overflow-hidden");
    this.containerTarget.classList.add("flex", "flex-col", "expanded");
    
    this.toggleVisibility(this.showMore, false);
    this.toggleVisibility(this.showLess, true);
  }

   toggleContainerSize() {
    if (this.containerTarget.classList.contains("expanded")) {
      this.minimizeContainer();
    } else {
      this.maximizeContainer();
    }
  }

  connect() {
    if (this.buttonTarget && this.containerTarget) {
      this.showMore = this.buttonTarget.querySelector("span:nth-child(1)");
      this.showLess = this.buttonTarget.querySelector("span:nth-child(2)");
      document.addEventListener("click", this.toggleContainerSize())
      this.minimizeContainer()
    }
  }

  disconnect() {
    document.removeEventListener("click", this.toggleContainerSize())
  }
}
