import { Controller } from "@hotwired/stimulus";
import { getHashForPathname } from "./../utils/utils";

const sizes = ["fluid", [320, 50], [320, 100], [320, 150]];

const getMapping = () => {
    // default for all other webs
    return googletag.sizeMapping().addSize([0, 0], sizes).build();
};

export default class extends Controller {
    static values = {
        slotId: String,
        divId: String,
        pageTargeting: String,
    };

    static targets = ["wrapper"];

    connect() {
        this.slot = null;
        this.loadAd();
    }

    slotRenderEndedHandler = (event) => {
        const slot = event.slot;
        const slotId = slot.getSlotElementId();

        if (slotId == this.divIdValue && event.isEmpty) {
            this.wrapperTarget.style.display = "none";
        } else {
            this.wrapperTarget.style.height = event.size[1] + "px";
        }
    };

    loadAd = () => {
        const slotId = this.slotIdValue;

        window.googletag = window.googletag || { cmd: [] };
        googletag.cmd.push(() => {
            const slot = googletag
                .defineSlot(slotId, sizes, this.divIdValue)
                .addService(googletag.pubads());

            this.slot = slot;

            const mapping = getMapping();

            slot.defineSizeMapping(mapping);

            slot.setTargeting("page", this.pageTargetingValue);
            slot.setTargeting("pathname", window.location.pathname);
            slot.setTargeting(
                "pathname_md5",
                getHashForPathname(window.location.pathname)
            );

            googletag.pubads().enableSingleRequest();
            googletag.pubads().collapseEmptyDivs();
            googletag.enableServices();

            const command = () => {
                googletag
                    .pubads()
                    .addEventListener(
                        "slotRenderEnded",
                        this.slotRenderEndedHandler
                    );
            };

            // add command when script is ready
            googletag.cmd.push(command);

            googletag.display(this.divIdValue);

            if (!this.inverval) {
                this.interval = setInterval(() => {
                    googletag.pubads().refresh([this.slot]);
                }, 8000);
            }
        });
    };

    displayAd() {
        googletag.display(this.divIdValue);
    }

    disconnect() {
        if (this.slot) {
            googletag.destroySlots([this.slot]);
        }

        if (this.interval) {
            clearInterval(this.interval);
        }

        googletag
            .pubads()
            .removeEventListener(
                "slotRenderEnded",
                this.slotRenderEndedHandler
            );
    }
}
