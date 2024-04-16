import { Controller } from "@hotwired/stimulus";
import { is_sk } from "./utils/utils";
import uptil from "./utils/uptil";

const limit = 5;

export default class extends Controller {
    static targets = ["input", "container", "errorsContainer"];

    static values = {
        closeUrl: String,
        formUrl: String,
    };

    truncateString(str, num) {
        if (str.length > num) {
            return str.slice(0, num) + "...";
        } else {
            return str;
        }
    }

    sendForm = async (fileData, url) => {
        const fd = new FormData();
        fd.set("file", fileData);

        const el = uptil(
            this.inputTarget,
            (element) => element.tagName === "FORM"
        );
        const csrfInput = el.querySelector('input[name="csrfmiddlewaretoken"]');

        fd.set("csrfmiddlewaretoken", csrfInput.value);

        const response = await fetch(url, {
            method: "POST",
            body: fd,
        });

        const json = await response.json();

        return json;
    };

    inputChanged = async (event) => {
        const input = event.target;
        const files = input.files;

        // clear out any previous errors
        this.errorsContainerTarget.innerHTML = "";

        for (const file of files) {
            // Check size of file
            if (file.size / 1024 / 1024 >= limit) {
                // not an elegant solution, but replacing substring seems more prone to errors.
                const errorMessage = is_sk
                    ? `Súbor ${this.truncateString(
                          file.name,
                          48
                      )} je príliš veľký, presahuje limit ${limit}MB.`
                    : `Soubor ${this.truncateString(
                          file.name,
                          48
                      )} je příliš velký, přesahuje limit ${limit} MB.`;
                this.errorsContainerTarget.innerHTML += `<div>${errorMessage}</div>`;
            } else {
                const response = await this.sendForm(file, this.formUrlValue);

                this.containerTarget.innerHTML += `<div 
                        data-controller="remove-container"
                        data-remove-container-target="container"
                        class="flex rounded-md overflow-hidden relative items-center gap-3"
                    >
                        <input type="hidden" name="attachments" value="${
                            response.file_id
                        }">
                        <a 
                            href="/common/attachment-data/${response.file_id}/"
                            class="flex justify-center text-blue-600 hover:underline select-none cursor-pointer" 
                            download=""
                        >
                            ${this.truncateString(response.file_name, 48)} 
                        </a>
                        <i 
                            class="block w-3 h-3 bg-gray-600 cursor-pointer"
                            data-action="click->remove-container#remove"
                            style="-webkit-mask:url(${
                                this.closeUrlValue
                            });mask-url:url(${this.closeUrlValue})"
                        ></i>
                    </div>`;
            }
        }
    };
}
