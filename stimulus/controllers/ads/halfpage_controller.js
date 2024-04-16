import gpt_ad_controller from "./gpt_ad_controller";

export default class extends gpt_ad_controller {
    getSizeMapping = (googletag) =>
        googletag
            .sizeMapping()
            .addSize([1024, 0], ["fluid", [300, 300], [300, 600]])
            .addSize([0, 0], ["fluid", [300, 300], [300, 600]])
            .build();

    sizes = [
        [300, 300],
        [300, 600],
    ];

    static targets = ["container"];

    handleSlotRendered = (event) => {
        const slot = event.slot;
        const slotId = slot.getSlotElementId();
        const isEmpty = event.isEmpty;

        if (slotId == this.divIdValue && !isEmpty) {
            this.containerTarget.classList.remove("hidden");
            this.containerTarget.classList.add("block");
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
