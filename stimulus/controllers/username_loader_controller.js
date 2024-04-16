import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
    static targets = ["dropdown", "options", "input", "outputInputs"];
    static values = {
        url: String,
    };

    selected = [];

    connect() {
        if (this.hasUrlValue === false) {
            console.error("url value is required in the compose_mail controller...");
        }
    }

    loadOptions(text) {
        this.dropdownTarget.classList.remove("hidden");
        this.dropdownTarget.setAttribute("aria-expanded", "true");

        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        this.timeout = setTimeout(() => {
            fetch(this.urlValue + `?username=${text}`)
                .then((response) => response.text())
                .then((text) => (this.dropdownTarget.innerHTML = text));
        }, 350);
    }

    chooseOptionHandler(event) {
        const target = event.target;
        const username = event.params.username;
        const id = event.params.id;

        const usernameElement = this.optionsTarget.querySelector(`[data-id='${id}']`);

        this.dropdownTarget.classList.add("hidden");
        this.dropdownTarget.setAttribute("aria-expanded", "false");
        this.inputTarget.value = "";

        // if it is not chosen yet
        if (!usernameElement) {
            const newOptionTarget = `
                <span
                    data-id='${id}'
                    class='rounded-sm text-sm text-white p-1 pl-2 bg-primary-500'
                >
                    <span>${username}</span>
                    <span
                        data-action='click->username-loader#removeOption'
                        data-id='${id}'
                        class='p-1 cursor-pointer text-sm inline-block'
                    >x</span>
                </span>
            `;

            this.optionsTarget.innerHTML += newOptionTarget;
            this.outputInputsTarget.innerHTML += `<input type='hidden' name='user' value='${id}'>`;
            this.dropdownTarget.innerHTML = "";
        }
    }

    removeOption(event) {
        const id = event.target.dataset.id;

        const el1 = this.optionsTarget.querySelector(`[data-id='${id}']`);
        const el2 = this.outputInputsTarget.querySelector(`[value='${id}']`);

        if (el1) {
            el1.remove();
        }

        if (el2) {
            el2.remove();
        }
    }

    inputChangeHandle(event) {
        const value = event.target.value;

        if (value === "") {
            this.dropdownTarget.innerHTML = "";
            this.dropdownTarget.classList.add("hidden");
            return;
        }
        this.loadOptions(value);
    }
}
