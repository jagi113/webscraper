import { Controller } from "@hotwired/stimulus";
import { getHashForPathname } from "./../utils/utils";

export default class extends Controller {
    static values = {
        slotId: String,
        divId: String,
        catSlug: String,
        pageTargeting: String,
    };

    connect() {
        const isPreview =
            document.documentElement.hasAttribute("data-turbo-preview");
        if (!isPreview) {
            this.slot = null;
            this.loadAd();
        }
    }

    loadAd() {
        const slotId = this.slotIdValue;

        window.googletag = window.googletag || { cmd: [] };
        googletag.cmd.push(() => {
            const slot = googletag
                .defineSlot(slotId, this.sizes, this.divIdValue)
                .addService(googletag.pubads());

            this.slot = slot;

            const sizeMapping = this.getSizeMapping(googletag);
            slot.defineSizeMapping(sizeMapping);

            if (this.hasCatSlugValue) {
                slot.setTargeting("f-rectangle-cat-slug", this.catSlugValue);
            }

            if (this.hasPageTargetingValue) {
                slot.setTargeting("page", this.pageTargetingValue);
            }
            slot.setTargeting("pathname", window.location.pathname);
            slot.setTargeting(
                "pathname_md5",
                getHashForPathname(window.location.pathname)
            );

            googletag.pubads().enableSingleRequest();
            googletag.pubads().collapseEmptyDivs();
            googletag.enableServices();

            // add command when script is ready
            googletag.display(this.divIdValue);
        });
    }

    disconnect() {
        if (this.slot) {
            googletag.destroySlots([this.slot]);
        }
    }
}
