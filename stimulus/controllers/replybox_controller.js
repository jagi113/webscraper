import { Controller } from "@hotwired/stimulus";

export default class extends Controller {

    static targets = ["container", "usernameBox", "bodyBox", "textInput", "messageId"]


    removeReply(event) {
        this.usernameBoxTarget.innerText = ''
        this.bodyBoxTarget.innerText = ''
        this.messageIdTarget.removeAttribute('value')
        this.containerTarget.classList.add('hidden')
        this.containerTarget.classList.remove('flex')
    }


}
