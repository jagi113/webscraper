import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
    static targets = [
        "loader",
        "frame",
        "linkActive",
        "linkActiveRectangle",
        "linkNewest",
        "linkNewestRectangle",
    ];

    static values = {
        newestUrl: String,
        activeUrl: String,
        placeholderRows: { type: Number, default: 12 },
    };

    connect() {
        this.loaderHTML = this.createLoaderString();
    }

    createLoaderString() {
        let loader = "";
        for (let i = 0; i < this.placeholderRowsValue; i++) {
            if (i % 3 == 0) {
                loader +=
                    '<div class="animate-pulse px-4 py-2 flex flex-col gap-2 border-t first:border-none border-gray-300"><div class="h-2.5 bg-gray-300 rounded-full w-24 mb-2.5" ></div><div class="w-32 h-2 bg-gray-200 rounded-full"></div></div >';
            } else {
                loader +=
                    '<div class="animate-pulse px-4 py-2 flex items-center gap-2 border-t first:border-none border-gray-300 h-[41px]"><div class="h-2.5 bg-gray-300 rounded-full w-24"></div><div class="w-16 h-2 bg-gray-200 rounded-full"></div></div >';
            }
        }
        loader += `<div class="animate-pulse border-t border-gray-300 flex flex-row items-center justify-center py-3"><div class="rounded w-12 h-2 bg-gray-300"></div></div>`;
        return loader;
    }

    highlightActive() {
        this.linkActiveTarget.classList.add("text-primary-800");
        this.linkActiveRectangleTarget.classList.remove("hidden");
        this.linkNewestTarget.classList.remove("text-primary-800");
        this.linkNewestRectangleTarget.classList.add("hidden");
    }

    highlightNewest() {
        this.linkNewestTarget.classList.add("text-primary-800");
        this.linkNewestRectangleTarget.classList.remove("hidden");
        this.linkActiveTarget.classList.remove("text-primary-800");
        this.linkActiveRectangleTarget.classList.add("hidden");
    }

    clickOnNewest(event) {
        event.preventDefault();
        this.highlightNewest();
        this.frameTarget.innerHTML = this.loaderHTML;
        this.frameTarget.src = this.newestUrlValue;
    }

    clickOnActive(event) {
        event.preventDefault();
        this.highlightActive();
        this.frameTarget.innerHTML = this.loaderHTML;
        this.frameTarget.src = this.activeUrlValue;
    }
}
