import gpt_ad_controller from "./gpt_ad_controller";

export default class extends gpt_ad_controller {
    getSizeMapping = (googletag) =>
        googletag
            .sizeMapping()
            .addSize([1024, 0], [])
            .addSize([0, 0], [[400, 600]])
            .build();

    sizes = [[400, 600]];

    static targets = ["wrapper"];

    handleSlotRendered = (event) => {
        const slot = event.slot;
        const slotId = slot.getSlotElementId();
        const isEmpty = event.isEmpty;

        if (slotId == this.divIdValue && !isEmpty) {
            this.wrapperTarget.classList.remove("hidden");
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
