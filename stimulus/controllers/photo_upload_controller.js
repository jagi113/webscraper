import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
    static values = {
        csrftoken: String,
        url: String,
        removeurl: String,
        template: String,
    };

    static targets = ["container", "photo"];

    change = async (e) => {
        const target = e.target;
        const photos = target.files;

        for (const photo of photos) {
            let formData = new FormData();
            formData.append("photo", photo);

            if (this.hasTemplateValue) {
                formData.append("template", this.templateValue);
            }

            const response = await fetch(this.urlValue, {
                method: "POST",
                body: formData,
            });
            const body = await response.text();

            if (this.hasContainerTarget) {
                this.containerTarget.insertAdjacentHTML("beforeend", body);
            } else {
                console.warn(
                    "Container Target does not exist. Please add container target to photo_upload_controller.js"
                );
            }
        }
    };

    remove = async (e) => {
        const target = e.target;
        const idToDelete = target.dataset.id;

        let formData = new FormData();
        formData.append("id", idToDelete);

        const response = await fetch(this.removeurlValue, {
            method: "POST",
            body: formData,
        });

        if (response.ok) {
            this.photoTargets.forEach((target) => {
                if (target.dataset.id == idToDelete) {
                    target.remove();
                }
            });
        } else {
            // if deleted count is not equal 1, then backend will respond with HttpBadRequest 400
            console.error(
                "Remove of photo failed. Lookup into Network tab and backed logs"
            );
        }
    };
}
