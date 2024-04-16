import { Controller } from "@hotwired/stimulus";
import hoverintent from "./utils/hoverintent";

const opts = {
    sensitivity: 14,
};

export default class extends Controller {
    static targets = ["link"];

    connect() {
        let prefetcher;

        hoverintent(
            this.linkTarget,
            function () {
                var href = this.getAttribute("href");

                // if (!href.match(/^\//)) {
                //   return;
                // }

                if (prefetcher) {
                    if (prefetcher.getAttribute("href") != href) {
                        prefetcher.setAttribute("href", href);
                    }
                } else {
                    var link = document.createElement("link");
                    link.setAttribute("rel", "prefetch");
                    link.setAttribute("as", "document");
                    link.setAttribute("href", href);

                    prefetcher = document.head.appendChild(link);
                }
            },
            function () {}
        ).options(opts);
    }
}
