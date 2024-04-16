import { Controller } from "@hotwired/stimulus";
import { loadScript } from "./utils/load_script";

const createElement = (name, attributes) => {
    const el = document.createElement(name);

    Object.entries(attributes).forEach((entry) => {
        el.setAttribute(entry[0], entry[1]);
    });

    return el;
};

const createImage = (attributes) => {
    return createElement("img", attributes);
};
const pattern = "[^([]\b(?<x>https?:\\/\\/\\S+)\\b";
const lonelyUrlRegex = new RegExp(pattern, "g");

const replaceAllLonelyUrls = (text) => {
    return text.replaceAll(lonelyUrlRegex, "[$1]($1)");
};

const findLastMessage = (node_list) => {
    const arr = [...node_list];
    arr.reverse();

    return arr.find(
        (node) =>
            node.tagName === "DIV" && node.classList.contains("chat-message")
    );
};

export default class extends Controller {
    static targets = [
        "input",
        "messages",
        "iconsContainer",
        "iconsButton",
        "gifsButton",
        "gifsContainer",
        "gifsInput",
        "gifsFirstCol",
        "gifsSecondCol",
        "newMessageToast",
        "timeHolder",
        "attachment",
        "searchInput",
        "clearSearchInput",
    ];
    static values = {
        customEmojis: {
            type: Array,
            default: [],
        },
        newMessageUrl: String,
        csrfToken: String,
        refreshChatUrl: String,
        emojiMartUrl: String,
    };

    loadedMoreRooms = false;

    TENOR_API_KEY = "AIzaSyAo_ZkxtwqpS5_PN_mH4RC7IBts64C2Vio";
    TENOR_BASE_URL = "https://tenor.googleapis.com";

    connect() {
        this.scrollToTheBottom();
        this.iconsContainerOpened = false;
        this.gifsContainerOpened = false;

        document.addEventListener("click", this.documentClick);

        this.injectScrollBehaviorOfMessageList();

        setTimeout(this.scrollToTheBottom.bind(this), 1000);

        this.startRefreshingChat(5);

        window.addEventListener("blur", this.handleWindowBlur);
        window.addEventListener("focus", this.handleWindowFocus);
    }

    handleWindowBlur = () => {
        this.startRefreshingChat(15);
    };

    handleWindowFocus = () => {
        this.startRefreshingChat(5);
    };

    startRefreshingChat = (seconds) => {
        if (this.refreshingInterval) {
            clearInterval(this.refreshingInterval);
        }
        this.refreshingInterval = setInterval(
            () => this.refreshChat(),
            seconds * 1000
        );
    };

    refreshChat = async () => {
        const lastMessageTime = this.timeHolderTarget.dataset.value;
        const encodedLastMessageTime = encodeURIComponent(lastMessageTime);

        let url =
            this.refreshChatUrlValue +
            `?last_message_time=${encodedLastMessageTime}`;

        let allowUpdateSideRooms = true;

        if (this.searchInputTarget.value.length > 0) {
            allowUpdateSideRooms = false;
        } else if (this.loadedMoreRooms) {
            allowUpdateSideRooms = false;
        }

        if (allowUpdateSideRooms) {
            url += "&update_side_rooms=1";
        } else {
            url += "&update_side_rooms=0";
        }

        const response = await fetch(url);
        const html = await response.text();

        Turbo.renderStreamMessage(html);
    };

    setMoreRoomsLoadedStatus() {
        this.loadedMoreRooms = true;
    }

    displayNewMessageToast() {
        this.newMessageToastTarget.classList.remove("hidden");
    }

    hideNewMessageToast() {
        this.newMessageToastTarget.classList.add("hidden");
    }

    injectScrollBehaviorOfMessageList() {
        // beginning behavior
        this.scrollIsAtEnd = true;

        this.messagesTarget.addEventListener("scroll", () => {
            const container = this.messagesTarget;
            const isAtEnd =
                container.scrollTop + container.clientHeight >=
                container.scrollHeight;

            if (isAtEnd) {
                this.scrollIsAtEnd = true;
                this.hideNewMessageToast();
            } else {
                this.scrollIsAtEnd = false;
            }
        });

        // okay and now, attach mutable observer for new message
        const observerConfig = { childList: true, subtree: true };

        // Function to be called when mutation occurs
        const handleMutation = (mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === "childList") {
                    const lastMessageElement = findLastMessage(
                        mutation.addedNodes
                    );

                    // scroll into message that was added
                    if (this.scrollIsAtEnd) {
                        lastMessageElement.scrollIntoView({
                            behavior: "smooth",
                        });
                    } else {
                        this.displayNewMessageToast();
                    }
                }
            }
        };

        // Create a MutationObserver with the specified configuration and callback
        const observer = new MutationObserver(handleMutation);

        // Start observing the target node for configured mutations
        observer.observe(this.messagesTarget, observerConfig);
    }

    scrollToTheBottom() {
        this.messagesTarget.scrollTop = this.messagesTarget.scrollHeight;
    }

    /**
     *
     * @param {String | Event} useTextAsInput
     * @returns
     */
    async sendMessage(useTextAsInput) {
        if (this.sendingMessage) {
            return;
        }

        this.sendingMessage = true;

        let text =
            typeof useTextAsInput === "string"
                ? useTextAsInput
                : this.inputTarget.innerText;
        text = replaceAllLonelyUrls(text);

        const formData = new FormData();

        formData.append("message", text);
        formData.append("csrfmiddlewaretoken", this.csrfTokenValue);

        const allAttachmentIds = [...this.attachmentTargets].map(
            (att) => att.dataset.attachmentId
        );

        formData.append("attachment_ids", allAttachmentIds.join(","));

        try {
            const response = await fetch(this.newMessageUrlValue, {
                method: "POST",
                body: formData,
            });

            const html = await response.text();

            Turbo.renderStreamMessage(html);
        } catch (e) {
            console.error(e);
        } finally {
            this.sendingMessage = false;
            this.inputTarget.innerHTML = "";
        }
    }

    insertGifResultsIntoContainer = (results) => {
        this.gifsFirstColTarget.innerHTML = "";
        this.gifsSecondColTarget.innerHTML = "";

        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            const dims = result.media_formats.tinymp4.dims;

            const video = createElement("video", {
                class: "rounded-md overflow-hidden",
                width: dims[0],
                height: dims[1],
                autoplay: "",
                loop: "",
                muted: "",
                playsinline: "",
            });

            video.appendChild(
                createElement("source", {
                    src: result.media_formats.tinymp4.url,
                    type: "video/mp4",
                })
            );

            video.addEventListener("click", () => {
                const message = `<video width="${dims[0]}" height="${dims[1]}" autoplay="true" loop="true" muted="true" playsinline="true"><source src="${result.media_formats.tinymp4.url}" type="video/mp4"></video>`;

                this.closeGifsContainer();
                this.sendMessage(message);
            });

            if (i % 2) {
                this.gifsFirstColTarget.appendChild(video);
            } else {
                this.gifsSecondColTarget.appendChild(video);
            }
        }
    };

    gifSearchInputChanded = (e) => {
        const value = e.target.value;

        if (this.gifSearchInputTimeout) {
            clearTimeout(this.gifSearchInputTimeout);
        }

        if (value === "" || value === " ") {
            return;
        }

        this.gifSearchInputTimeout = setTimeout(() => {
            this.loadSearchGifs(value);
        }, 500);
    };

    async loadTrendingGifs() {
        const response = await fetch(
            `${this.TENOR_BASE_URL}/v2/featured?key=${this.TENOR_API_KEY}&limit=10`
        );
        const json = await response.json();

        this.insertGifResultsIntoContainer(json.results);
    }

    async loadSearchGifs(q) {
        const response = await fetch(
            `${this.TENOR_BASE_URL}/v2/search?q=${q}&key=${this.TENOR_API_KEY}&limit=10`
        );
        const json = await response.json();

        this.insertGifResultsIntoContainer(json.results);
    }

    documentClick = (e) => {
        if (
            this.iconsContainerTarget.contains(e.target) ||
            this.iconsButtonTarget.contains(e.target) ||
            this.gifsContainerTarget.contains(e.target) ||
            this.gifsButtonTarget.contains(e.target)
        ) {
            return;
        }

        if (this.iconsContainerOpened) {
            this.closeIconsContainer();
        }

        if (this.gifsContainerOpened) {
            this.closeGifsContainer();
        }
    };

    handleEmojiClick = (obj) => {
        const selection = window.getSelection();
        const isCustom = !obj.native;
        const selectionIsOnInput =
            selection && this.inputTarget.contains(selection.focusNode);

        // Create a new text node with the content you want to insert
        let nodeToAdd = isCustom
            ? createImage({
                  src: obj.src,
                  class: "w-5 h-5 inline-block",
                  "data-alt": obj.shortcodes,
                  style: "vertical-align: middle;",
              })
            : document.createTextNode(obj.native);

        if (nodeToAdd.tagName && nodeToAdd.tagName.toLowerCase() === "img") {
            const imgContainer = createElement("span", {
                class: "w-5 h-5",
                style: "font-size: 0px; vertical-align: text-bottom;",
                contenteditable: "false",
            });

            imgContainer.innerText = obj.shortcodes;
            imgContainer.appendChild(nodeToAdd);

            nodeToAdd = imgContainer;
        }

        if (selectionIsOnInput) {
            const range = selection.getRangeAt(0);

            range.insertNode(nodeToAdd);
            range.setStartAfter(nodeToAdd);
            range.setEndAfter(nodeToAdd);
            selection.removeAllRanges();
            selection.addRange(range);
        } else {
            this.inputTarget.appendChild(nodeToAdd);
        }
    };

    async loadAndInitializeEmojiMart() {
        await loadScript({
            async: true,
            defer: true,
            src: "https://cdn.jsdelivr.net/npm/emoji-mart@latest/dist/browser.js",
        });

        if (this.iconsContainerTarget.children.length > 0) {
            return;
        }

        const pickerOptions = {
            onEmojiSelect: this.handleEmojiClick,
            custom: this.customEmojisValue,
        };
        const picker = new EmojiMart.Picker(pickerOptions);

        this.iconsContainerTarget.appendChild(picker);
    }

    openGifsContainer() {
        this.gifsContainerTarget.classList.remove("hidden");
        this.gifsContainerOpened = true;
        this.gifsInputTarget.value = "";

        this.loadTrendingGifs();

        this.gifsInputTarget.focus();
    }

    closeGifsContainer() {
        this.gifsContainerTarget.classList.add("hidden");
        this.gifsContainerOpened = false;
    }

    async openIconsContainer() {
        this.iconsContainerTarget.classList.remove("hidden");
        this.iconsContainerOpened = true;

        if (window.EmojiMart) {
            return;
        }

        await this.loadAndInitializeEmojiMart();
    }

    closeIconsContainer() {
        this.iconsContainerTarget.classList.add("hidden");
        this.iconsContainerOpened = false;
    }

    toggleIconsContainer() {
        if (this.iconsContainerOpened) {
            this.closeIconsContainer();
        } else {
            this.openIconsContainer();
        }
    }

    toggleGifsContainer() {
        if (this.gifsContainerOpened) {
            this.closeGifsContainer();
        } else {
            this.openGifsContainer();
        }
    }

    searchTag(event) {
        const tag = event.params.tag;
        const isMobile = event.params.isMobile || false;
        this.searchInputTarget.value = "label:" + tag;
        this.searchInputTarget.form.requestSubmit();

        if (isMobile) {
            document.getElementById("side-panel").classList.add("opened");
        }

        // also check and display close btn
        this.checkSearchInput();
    }

    displaySearchTags = () => {
        document.getElementById("search-tags").classList.remove("hidden");
    };

    hideSearchTags = () => {
        document.getElementById("search-tags").classList.add("hidden");
    };

    checkSearchInput = () => {
        if (this.searchInputTarget.value.length === 0) {
            this.clearSearchInputTarget.classList.add("hidden");
            this.hideSearchTags();
        } else {
            this.clearSearchInputTarget.classList.remove("hidden");
            this.displaySearchTags();
        }
    };

    disconnect() {
        document.removeEventListener("click", this.documentClick);

        if (this.gifSearchInputTimeout) {
            clearTimeout(this.gifSearchInputTimeout);
        }

        if (this.refreshingInterval) {
            clearInterval(this.refreshingInterval);
        }

        window.removeEventListener("blur", this.handleWindowBlur);
        window.removeEventListener("focus", this.handleWindowFocus);
    }
}
