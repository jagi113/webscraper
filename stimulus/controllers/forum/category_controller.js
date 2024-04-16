import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
    static targets = ["details", "summary", "icon", "content"];

    connect() {
        this.handleResize();
        this.animation = null;
        this.isClosing = false;
        this.isExpanding = false;
    }

    closeOpened(e) {
        let detailsArray = document.querySelectorAll("details");
        detailsArray.forEach((details) => {
            if (details.open && this.detailsTarget !== details) {
                let icon = details.querySelector("i");
                icon.classList.remove("rotate-180");
                details.open = false;
            }
        });
    }

    onClick(e) {
        // Stop default behaviour from the browser
        e.preventDefault();

        this.closeOpened(e);
        var viewport_width = document.documentElement.clientWidth;
        if (viewport_width < 1024) {
            // Add an overflow on the <details> to avoid content overflowing
            this.detailsTarget.style.overflow = "hidden";
            // Check if the element is being closed or is already closed
            if (this.isClosing || !this.detailsTarget.open) {
                this.open();
                // Check if the element is being openned or is already open
            } else if (this.isExpanding || this.detailsTarget.open) {
                this.shrink();
            }
        }
    }

    // Function called to close the content with an animation
    shrink() {
        // Set the element as "being closed"
        this.isClosing = true;

        // Store the current height of the element
        const startHeight = `${this.detailsTarget.offsetHeight}px`;
        // Calculate the height of the summary
        const endHeight = `${this.summaryTarget.offsetHeight}px`;

        // If there is already an animation running
        if (this.animation) {
            // Cancel the current animation
            this.animation.cancel();
        }

        this.iconTarget.classList.remove("rotate-180");

        // Start a WAAPI animation
        this.animation = this.detailsTarget.animate(
            {
                // Set the keyframes from the startHeight to endHeight
                height: [startHeight, endHeight],
            },
            {
                // If the duration is too slow or fast, you can change it here
                duration: 300,
                // You can also change the ease of the animation
                easing: "ease-out",
            }
        );

        // When the animation is complete, call onAnimationFinish()
        this.animation.onfinish = () => this.onAnimationFinish(false);
        // If the animation is cancelled, isClosing variable is set to false
        this.animation.oncancel = () => (this.isClosing = false);
    }

    // Function called to open the element after click
    open() {
        // Apply a fixed height on the element
        this.detailsTarget.style.height = `${this.detailsTarget.offsetHeight}px`;
        // Force the [open] attribute on the details element
        this.detailsTarget.open = true;
        // Wait for the next frame to call the expand function
        window.requestAnimationFrame(() => this.expand());
    }

    // Function called to expand the content with an animation
    expand() {
        // Set the element as "being expanding"
        this.isExpanding = true;
        // Get the current fixed height of the element
        const startHeight = `${this.detailsTarget.offsetHeight}px`;
        // Calculate the open height of the element (summary height + content height + 20)
        const endHeight = `${
            this.summaryTarget.offsetHeight + this.contentTarget.offsetHeight + 20
        }px`;

        // If there is already an animation running
        if (this.animation) {
            // Cancel the current animation
            this.animation.cancel();
        }

        this.iconTarget.classList.add("rotate-180");

        // Start a WAAPI animation
        this.animation = this.detailsTarget.animate(
            {
                // Set the keyframes from the startHeight to endHeight
                height: [startHeight, endHeight],
            },
            {
                // If the duration is too slow of fast, you can change it here
                duration: 300,
                // You can also change the ease of the animation
                easing: "ease-out",
            }
        );

        // When the animation is complete, call onAnimationFinish()
        this.animation.onfinish = () => this.onAnimationFinish(true);
        // If the animation is cancelled, isExpanding variable is set to false
        this.animation.oncancel = () => (this.isExpanding = false);
    }

    // Callback when the shrink or expand animations are done
    onAnimationFinish(open) {
        // Set the open attribute based on the parameter
        this.detailsTarget.open = open;
        // Clear the stored animation
        this.animation = null;
        // Reset isClosing & isExpanding
        this.isClosing = false;
        this.isExpanding = false;
        // Remove the overflow hidden and the fixed height
        this.detailsTarget.style.height = this.detailsTarget.style.overflow = "";
    }

    handleResize() {
        var viewport_width = document.documentElement.clientWidth;
        if (viewport_width >= 1024) {
            this.detailsTargets.forEach((element) => {
                element.open = true;
            });
        } else {
            this.detailsTargets.forEach((element) => {
                element.open = false;
            });
        }
    }

    close(details) {
        this.icon = details.querySelector("i");
        this.icon.classList.remove("rotate-180");

        details.style.overflow = "hidden";
        details.open = false;
    }
}
