import gpt_ad_controller from "./gpt_ad_controller";

export default class extends gpt_ad_controller {
    getSizeMapping = (googletag) => {
        googletag
            .sizeMapping()
            .addSize([0, 0], ["fluid", [320, 150]])
            .addSize([1024, 0], ["fluid", [970, 250]])
            .build();
    };

    sizes = ["fluid", [970, 250], [970, 90], [300, 100], [300, 250], [300, 300], [320, 50]];
}
