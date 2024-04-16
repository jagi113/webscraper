import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
    static targets = ["scrollToTopBtn"];

    handleScroll(event) {
        let scrollTotal =
            document.documentElement.scrollHeight -
            document.documentElement.clientHeight;
        if (
            document.documentElement.scrollTop / scrollTotal > 0.5 ||
            document.documentElement.scrollTop > 1000
        ) {
            // Show button
            this.scrollToTopBtnTarget.classList.remove(
                "opacity-0",
                "translate-y-32"
            );
            this.scrollToTopBtnTarget.classList.add(
                "opacity-1",
                "translate-y-0"
            );
        } else {
            // Hide button
            this.scrollToTopBtnTarget.classList.remove(
                "opacity-1",
                "translate-y-0"
            );
            this.scrollToTopBtnTarget.classList.add(
                "opacity-0",
                "translate-y-32"
            );
        }
    }

    scrollToTop(event) {
        document.documentElement.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }
}
