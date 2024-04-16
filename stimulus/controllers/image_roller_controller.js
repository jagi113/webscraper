import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
    static targets = ["image"];
    static values = {
        index: {
            type: Number,
            default: 1,
        },
    };

    connect() {
        this.interval = 8000;
        this.timeout = null;
        this.currentIndex = 0;
        this.showImage(this.currentIndex);

        this.timeout = setTimeout(() => {
            this.timer = setInterval(() => {
                this.nextImage();
                this.showImage(this.currentIndex);
            }, this.interval);
        }, this.indexValue * 90);
    }

    nextImage = () => {
        this.currentIndex = (this.currentIndex + 1) % this.imageTargets.length;
        this.showImage(this.currentIndex);
    };

    showImage = (index) => {
        this.imageTargets.forEach((image, i) => {
            if (i === index) {
                image.classList.add("opacity-1");
                image.classList.remove("opacity-0");
            } else {
                image.classList.remove("opacity-1");
                image.classList.add("opacity-0");
            }
        });
    };

    disconnect() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        if (this.timer) {
            clearInterval(this.timer);
        }
    }
}
