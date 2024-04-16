import SortableController from "./utils/stimulus_sortable";

export default class extends SortableController {
    static targets = [...SortableController.targets, "disable"];

    get defaultOptions() {
        let defaultOptionsObject = super.defaultOptions;
        if (this.hasDisableTarget) {
            defaultOptionsObject.onMove = (event) => {
                return event.related != this.disableTarget;
            };
        }
        return defaultOptionsObject;
    }
}
