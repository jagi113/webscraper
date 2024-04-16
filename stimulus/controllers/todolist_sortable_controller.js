import { Controller } from "@hotwired/stimulus";
import { loadScript } from "./utils/load_script";

export default class extends Controller {
    static targets = ["sortableGroup", "sortableGroupItems"];
    static values = {
        sortableUrl: {
            type: String,
            default:
                "https://cdn.jsdelivr.net/npm/sortablejs@1.15.2/Sortable.min.js", // fallback
        },
        csrfToken: String,
        url: String,
    };

    sortableInstances = [];
    promiseSortableLoading = null;

    connect = async () => {
        if (window.Sortable === undefined) {
            await this.loadSortableLibrary();
        }

        const mainList = new window.Sortable(this.sortableGroupTarget, {
            group: "mainList",
            handle: ".group-handle",
            animation: 150,
            onEnd: (evt) => {
                this.onSortEnd("mainList", evt);
            },
        });

        this.sortableInstances.push({ group: "mainList", sortable: mainList });
    };

    loadSortableLibrary = async () => {
        if (this.promiseSortableLoading === null) {
            this.promiseSortableLoading = loadScript({
                src: this.sortableUrlValue,
            });
        }

        return await this.promiseSortableLoading;
    };

    sortableGroupItemsTargetConnected = async (group) => {
        if (window.Sortable === undefined) {
            await this.loadSortableLibrary();
        }

        const groupId = group.dataset.groupIdValue;
        const isAlreadyAdded = this.sortableInstances.some(
            (instance) => instance.groupId === groupId
        );

        if (!isAlreadyAdded) {
            const sortable = new window.Sortable(group, {
                group: "shared",
                handle: ".item-handle",
                animation: 150,
                onEnd: (evt) => {
                    this.onSortEnd(groupId, evt);
                },
            });
            this.sortableInstances.push({ groupId, sortable });
        }
    };

    onSortEnd(groupId, evt) {
        const newOrder = this.sortableGroupItemsTargets.map((group) => {
            const groupId = group.dataset.groupIdValue;
            const children = [...group.children].map(
                (item) => item.dataset.itemIdValue
            );

            return { id: groupId, children: children };
        });

        this.sendAjaxRequest(this.urlValue, newOrder);
    }

    sendAjaxRequest(url, data) {
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": this.csrfTokenValue,
            },
            body: JSON.stringify({ newOrder: data }),
        })
            .then((response) => response.text())
            .then((response) => {
                if (response.includes("turbo-stream")) {
                    Turbo.renderStreamMessage(response);
                }
            })
            .catch((error) => console.error(error));
    }

    disconnect() {
        this.sortableInstances.forEach(({ sortable }) => {
            sortable.destroy();
        });
        this.sortableInstances = [];
    }
}
