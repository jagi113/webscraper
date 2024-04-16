import gpt_ad_controller from "./gpt_ad_controller";

export default class extends gpt_ad_controller {
    getSizeMapping = (googletag) =>
        googletag
            .sizeMapping()
            .addSize(
                [0, 0],
                [
                    [300, 300],
                    [320, 150],
                    [320, 100],
                    [300, 100],
                    [300, 250],
                ]
            )
            .addSize(
                [1024, 0],
                [
                    [970, 90],
                    [970, 250],
                    [1100, 250],
                    [1100, 200],
                    [1100, 100],
                ]
            )
            .build();

    sizes = [
        [300, 300],
        [970, 90],
        [970, 250],
        [320, 150],
        [320, 100],
        [1100, 250],
        [300, 100],
        [1100, 200],
        [300, 250],
        [1100, 100],
    ];
}
