import gpt_ad_controller from "./gpt_ad_controller";

export default class extends gpt_ad_controller {

    static targets = ["container"];

    getSizeMapping = (googletag) =>
        googletag
            .sizeMapping()
            .addSize([1024, 0], ["fluid", [120, 600], [160, 600]])
            .addSize([0, 0], [])
            .build();

    sizes = [
        [120, 600],
        [160, 600],
    ];

    // branding ad is required for skyscraper ad to load !!!
    connect() {
        const isPreview = document.documentElement.hasAttribute("data-turbo-preview");
        if (!isPreview) {
            this.slot = null;

            const command = () => {
                googletag.pubads().addEventListener("slotRenderEnded", this.handleSlotRendered);
            };

            // add command when script is ready
            googletag.cmd.push(command);
        }
    }

    handleSlotRendered = (event) => {
        const slot = event.slot;
        const slotId = slot.getSlotElementId();

        if (slotId == "div-gpt-ad-branding") {
            const brandingIsMegaboard = event.size && event.size[0] >= 1470;
            if (!brandingIsMegaboard || event.isEmpty) {
                this.loadAd();
            } else {
                this.containerTarget.style.display = "none";    
            }
        }

        if (slotId == this.divIdValue && event.isEmpty) {
            this.containerTarget.style.display = "none";
        }
    };

    disconnect() {
        googletag.pubads().removeEventListener("slotRenderEnded", this.handleSlotRendered);
        super.disconnect();
    }
}
