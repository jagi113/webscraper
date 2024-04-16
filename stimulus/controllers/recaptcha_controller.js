import { Controller } from "@hotwired/stimulus";
import { loadScript } from "./utils/load_script";

export default class extends Controller {
    static targets = ["submitButton", "input"];

    RECAPTCHA_API = "6LfWLVspAAAAAOzVYAk9C_kEjdDAZGHh705UcLks";

    connect() {
        this.loadAndExecuteGrecaptcha();
    }

    loadAndExecuteGrecaptcha = async () => {
        if (typeof window.grecaptcha === "undefined") {
            try {
                await loadScript({
                    src: `https://www.google.com/recaptcha/api.js?render=${this.RECAPTCHA_API}`,
                    async: "",
                    defer: "",
                });
            } catch (e) {
                console.error(e);
            }
        }

        grecaptcha.ready(() => {
            grecaptcha
                .execute(this.RECAPTCHA_API, { action: "submit" })
                .then((token) => {
                    this.inputTarget.value = token;
                    this.submitButtonTarget.removeAttribute("disabled");
                });
        });
    };
}
