import gpt_ad_controller from "./gpt_ad_controller";

const PADDING_TOP = 20;

export default class extends gpt_ad_controller {
    static values = {
        slotId: String,
        divId: String,
        hidePanelHeight: {
            type: Number,
            default: 170,
        },
        pageTargeting: String,
    };
    static targets = ["toHide"];

    getSizeMapping = (googletag) =>
        googletag
            .sizeMapping()
            .addSize([1024, 0], ["fluid", [1470, 600], [1110, 150], [970, 90], [990, 100]])
            .addSize([0, 0], ["fluid", [320, 50], [320, 100], [320, 150]])
            .build();

    sizes = [
        [1470, 600],
        [970, 90],
        [990, 100],
        [300, 100],
        "fluid",
        [300, 250],
        [300, 300],
        [320, 50],
    ];

    handleSlotRendered = (event) => {
        const slot = event.slot;
        const slotId = slot.getSlotElementId();
        const isEmpty = event.isEmpty;

        if (slotId == this.divIdValue && isEmpty == false) {
            const height = event.size[1];

            // 600 and more, it means it needs to be covered slightly... it's typical branding ad
            if (height > 599) {
                this.toHideTarget.style.height = this.hidePanelHeightValue + "px";
            } else {
                this.toHideTarget.style.height = event.size[1] + PADDING_TOP + "px";
            }
        } else if (slotId == this.divIdValue && isEmpty == true) {
            this.toHideTarget.classList.add("hidden");
        }
    };

    loadAd() {
        super.loadAd();
        const command = () => {
            googletag.pubads().addEventListener("slotRenderEnded", this.handleSlotRendered);
        };

        // add command when script is ready
        googletag.cmd.push(command);
    }

    disconnect() {
        googletag.pubads().removeEventListener("slotRenderEnded", this.handleSlotRendered);
        super.disconnect();
    }
}
