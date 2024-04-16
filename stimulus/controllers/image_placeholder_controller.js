import { Controller } from "stimulus";

export default class extends Controller {
    static targets = ["mainImage", "placeholder"];

    connect = () => {
        this.swapImages = () => {
            this.placeholderTarget.style.display = "none";
            this.mainImageTarget.style.display = "block";
        };

        this.mainImageTarget.addEventListener("load", this.swapImages);

        if (this.mainImageTarget.complete) {
            this.swapImages();
        }
    };

    disconnect = () => {
        this.mainImageTarget.removeEventListener("load", this.swapImages);
    };
}
