import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
    static values = {
        albumId: String,
        albumTitle: String,
        imageCommentsUrl: String,
    };
    static targets = ["imageContainer", "imageInfo"];

    connect() {
        const hoverHandler = (event) => {
            this.imageInfoTargets.forEach((imageInfoTarget) => {
                imageInfoTarget.classList.add("opacity-100");
                imageInfoTarget.classList.remove("opacity-0");
            });
        };

        const hoverOutHandler = (event) => {
            this.imageInfoTargets.forEach((imageInfoTarget) => {
                imageInfoTarget.classList.add("opacity-0");
                imageInfoTarget.classList.remove("opacity-100");
            });
        };

        this.imageContainerTargets.forEach((image) => {
            image.addEventListener("mouseover", hoverHandler);
            image.addEventListener("mouseout", hoverOutHandler);
        });

        const imgs = [...document.querySelectorAll("img[data-src]")];

        const options = {
            rootMargin: "0px 0px 500px 0px",
        };

        this.lazyImageObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const lazyImage = entry.target;
                    lazyImage.src = lazyImage.dataset.src;
                    this.lazyImageObserver.unobserve(lazyImage);
                }
            });
        }, options);

        imgs.forEach((lazyImage) => {
            this.lazyImageObserver.observe(lazyImage);
        });
    }

    disconnect() {
        if (this.lazyImageObserver) {
            this.lazyImageObserver.disconnect();
        }
    }
}
