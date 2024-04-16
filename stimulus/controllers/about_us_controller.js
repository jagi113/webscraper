import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
    static targets = ["container", "userCount", "threadCount", "photoCount"];
    static values = {
        userCount: Number,
        threadCount: Number,
        photoCount: Number,
    };

    connect() {
        const appearOnScroll = new IntersectionObserver(
            (entries, appearOnScroll) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        if (entry.target.id == "counts") {
                            this.animateCounts(2000);
                        }
                        entry.target.classList.remove("opacity-0");
                        entry.target.classList.add("opacity-1");
                        appearOnScroll.unobserve(entry.target);
                    }
                });
            },
            {
                rootMargin: "0px 0px -110px 0px",
                threshold: window.innerWidth > 640 ? 0.5 : 0.3,
            }
        );

        this.containerTargets.forEach((container) => {
            appearOnScroll.observe(container);
        });
    }

    animateCounts(duration = 3000) {
        this.animate(this.userCountTarget, 0, this.userCountValue, duration);
        this.animate(this.threadCountTarget, 0, this.threadCountValue, duration);
        this.animate(this.photoCountTarget, 0, this.photoCountValue, duration);
    }

    animate(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerText = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
}
