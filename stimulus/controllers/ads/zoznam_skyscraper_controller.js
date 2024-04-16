import gpt_ad_controller from "./gpt_ad_controller";

export default class extends gpt_ad_controller {
    getSizeMapping = (googletag) =>
        googletag
            .sizeMapping()
            .addSize([1024, 0], [[160, 600]])
            .addSize([0, 0], [])
            .build();

    sizes = ["fluid", [160, 600]];

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
        if (
            slotId == "div-gpt-ad-branding" ||
            slotId == "div-gpt-ad-/60012913/Mojasvadba_leaderboard_hore"
        ) {
            const brandingIsMegaboard = event.size && event.size[0] >= 1470;
            if (!brandingIsMegaboard || event.isEmpty) {
                this.loadAd();
            }
        }
    };

    disconnect() {
        googletag.pubads().removeEventListener("slotRenderEnded", this.handleSlotRendered);
        super.disconnect();
    }
}
