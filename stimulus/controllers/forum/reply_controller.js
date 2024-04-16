import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
    static outlets = ["replybox"];

    static targets = ["username", "body"];

    static values = {
        id: Number,
    };

    truncateString(str, num) {
        if (str.length > num) {
            return str.slice(0, num) + "...";
        } else {
            return str;
        }
    }

    scroll() {
        const username = this.usernameTarget.textContent;
        this.replyboxOutlet.containerTarget.classList.remove("hidden");
        this.replyboxOutlet.containerTarget.classList.add("flex");
        this.replyboxOutlet.containerTarget.scrollIntoView({ block: "center", behavior: "smooth" });
        this.replyboxOutlet.usernameBoxTarget.textContent = username;
        this.replyboxOutlet.bodyBoxTarget.textContent = this.truncateString(
            this.bodyTarget.textContent,
            50
        );
        this.replyboxOutlet.messageIdTarget.value = this.idValue;
        let textInput = this.replyboxOutlet.textInputTarget;
        if (textInput.value.split(" ")[0].includes("@")) {
            textInput.value = "@" + username + " ";
        } else {
            textInput.value = "@" + username + " " + textInput.value;
        }
    }
}
