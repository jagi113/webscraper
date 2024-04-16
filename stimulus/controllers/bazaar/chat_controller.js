import { Controller } from "@hotwired/stimulus"

export default class extends Controller {

    static values = {}
    static targets = ["chat"]

    connect() {
        if (this.hasChatTarget) {
            this.chatTarget.scrollTo(0, this.chatTarget.scrollHeight - this.chatTarget.clientHeight)
        }
    }

}
