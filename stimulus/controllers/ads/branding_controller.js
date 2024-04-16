import gpt_ad_controller from "./gpt_ad_controller";
import { getHashForPathname } from "./../utils/utils";

const PADDING_TOP = 20;

const getMapping = (isZahrada) => {
    if (isZahrada) {
        return googletag
            .sizeMapping()
            .addSize(
                [1024, 0],
                [
                    [970, 310],
                    [970, 250],
                ]
            )
            .addSize(
                [0, 0],
                [
                    [320, 150],
                    [300, 100],
                ]
            )
            .build();
    }

    // default for all other webs
    return googletag
        .sizeMapping()
        .addSize([1024, 0], ["fluid", [1470, 600], [1110, 150]])
        .addSize([0, 0], ["fluid", [320, 50], [320, 100], [320, 150]])
        .build();
};

export default class extends gpt_ad_controller {
    static values = {
        slotId: String,
        divId: String,
        isZahrada: Boolean,
        hidePanelHeight: {
            type: Number,
            default: 170,
        },
        pageTargeting: String,
    };
    static targets = ["toHide"];

    handleSlotRendered = (event) => {
        const slot = event.slot;
        const slotId = slot.getSlotElementId();
        const isEmpty = event.isEmpty;

        if (slotId == this.divIdValue && isEmpty == false) {
            const height = event.size[1];

            // 600 and more, it means it needs to be covered slightly... it's typical branding ad
            if (height > 599) {
                this.toHideTarget.style.height =
                    this.hidePanelHeightValue + "px";
            } else {
                this.toHideTarget.style.height =
                    event.size[1] + PADDING_TOP + "px";
            }
        } else if (slotId == this.divIdValue && isEmpty == true) {
            this.toHideTarget.classList.add("hidden");
        }
    };

    loadAd() {
        const slotId = this.slotIdValue;
        const isZahrada = this.isZahradaValue;
        const sizes = isZahrada
            ? [
                  [970, 310],
                  [970, 250],
                  [300, 100],
                  [320, 150],
              ]
            : [
                  "fluid",
                  [1470, 600],
                  [1110, 150],
                  [320, 50],
                  [320, 100],
                  [320, 150],
              ];

        window.googletag = window.googletag || { cmd: [] };
        googletag.cmd.push(() => {
            const slot = googletag
                .defineSlot(slotId, sizes, this.divIdValue)
                .addService(googletag.pubads());

            this.slot = slot;

            const mapping = getMapping(isZahrada);

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
                        this.handleSlotRendered
                    );
            };

            // add command when script is ready
            googletag.cmd.push(command);
            googletag.display(this.divIdValue);
        });
    }

    disconnect() {
        googletag
            .pubads()
            .removeEventListener("slotRenderEnded", this.handleSlotRendered);
        super.disconnect();
    }
}
