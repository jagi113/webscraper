import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
    static targets = ["container"];

    remove(e) {
        this.containerTarget.remove();
    }
}
