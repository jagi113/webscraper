import { Controller } from "@hotwired/stimulus";
import { sendPlausibleEvent } from "./utils/plausible";
import { getGemiusCode, gemiusHit } from "./gemius_controller";

const sendGoogleAnalyticsPageView = () => {
    try {
        window.gtag("event", "page_view", {
            page_path: window.location.pathname + window.location.search,
        });
    } catch (e) {
        console.error(e);
    }
};

const getPreviousIndex = (currentIndex, count) =>
    currentIndex <= 0 ? count - 1 : currentIndex - 1;
const getNextIndex = (currentIndex, count) =>
    currentIndex >= count - 1 ? 0 : currentIndex + 1;

function prefetchImageWithIndex(index, photos) {
    const url = photos[index].photofile_url;

    // don't prefetch again
    if (document.querySelector(`link[href="${url}"]`)) {
        return;
    }

    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = url;

    document.head.append(link);
}

function prefetchNextImage(currentIndex, photos) {
    const nextIndex = getNextIndex(currentIndex, photos.length);
    prefetchImageWithIndex(nextIndex, photos);
}

function prefetchPreviousImage(currentIndex, photos) {
    const previousIndex = getPreviousIndex(currentIndex, photos.length);
    prefetchImageWithIndex(previousIndex, photos);
}

function replaceUrl(albumId, imageId, placeholderUrl) {
    const replacedUrl = placeholderUrl.replace("IMAGE_ID_PLACEHOLDER", imageId);

    history.replaceState({}, null, replacedUrl);
}

const commentsLoader = `
<div class="flex flex-col gap-2 animate-pulse">
<div class="flex gap-2">
  <div class="rounded-full w-6 h-6 bg-gray-200"></div>
  <div class="w-full h-6 bg-gray-200 rounded-2xl"></div>
</div>
<div class="flex gap-2">
  <div class="rounded-full w-6 h-6 bg-gray-200"></div>
  <div class="w-full h-6 bg-gray-200 rounded-2xl"></div>
</div>
<div class="flex gap-2">
  <div class="rounded-full w-6 h-6 bg-gray-200"></div>
  <div class="w-full h-6 bg-gray-200 rounded-2xl"></div>
</div>
<div class="ml-8 w-32 h-8 bg-gray-200 rounded-xl"></div>
</div>
`;

const smallPulseLoader =
    '<div class="animate-pulse h-6 bg-gray-200 rounded-md w-full px-8"></div>';

let touchstartX = 0;
let touchendX = 0;

export default class extends Controller {
    static targets = [
        "left",
        "right",
        "img",
        "title",
        "currentIndex",
        "comments",
        "backToAlbum",
        "smallLoader",
        "imageContainer",
        "adContainer",
    ];

    static values = {
        serverId: Number,
        imageId: Number,
        albumId: Number,
        urlPlaceholder: String,
        albumTitle: String,
        isMobile: {
            default: false,
            type: Boolean,
        },
    };

    // isFirstChange = prevent sending same event twice at the beginning. See connect()
    changeImageHandler = (isFirstChange = false) => {
        this.prefetchAroundIndex(this.currentIndex);

        this.currentIndexTarget.innerText = this.currentIndex + 1; // +1 because of indexing from 0

        // send new page view in plausible (only if it is modrastrecha.sk for now`)
        if (
            isFirstChange == false &&
            window.location.hostname.includes("modrastrecha.sk") // for now. TODO: remove modrastrecha.sk in the future
        ) {
            sendPlausibleEvent();
            sendGoogleAnalyticsPageView();
            gemiusHit(getGemiusCode(this.serverIdValue, location.pathname));
        }

        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        this.smallLoaderTargets.forEach((target) => {
            target.innerHTML = smallPulseLoader;
        });

        this.timeout = setTimeout(async () => {
            const currentImage = this.photos[this.currentIndex];

            // load comments
            const url = `/django-api/album/${this.albumIdValue}/${currentImage.img_id}/side-info/`;

            if (this.hasCommentsTarget) {
                this.commentsTarget.innerHTML = commentsLoader;
            }

            let startedWithIndex = this.currentIndex;

            const resp = await fetch(url, {
                method: "GET",
                headers: {
                    Accept: "text/vnd.turbo-stream.html",
                },
            });

            // we already can have very different img to be loading at this time
            if (this.currentIndex == startedWithIndex) {
                const html = await resp.text();
                Turbo.renderStreamMessage(html);
            }
        }, 300);
    };

    touchStartHandler = (e) => {
        touchstartX = e.changedTouches[0].screenX;
    };

    touchEndHandler = (e) => {
        touchendX = e.changedTouches[0].screenX;

        // if event was registered from outside of image container, do nothing and go away
        if (!this.imageContainerTarget.contains(e.target)) {
            return;
        }

        if (touchendX + 30 < touchstartX) {
            this.goRight();
        }
        if (touchendX - 30 > touchstartX) {
            this.goLeft();
        }
    };

    registerTouchEvents = () => {
        document.addEventListener("touchstart", this.touchStartHandler);
        document.addEventListener("touchend", this.touchEndHandler);
    };

    connect() {
        this.registerTouchEvents();

        this.photos = window.photos;
        this.count = this.photos.length;
        this.timeout = null;
        this.currentIndex = this.photos.findIndex(
            (photo) => photo.img_id == this.imageIdValue
        );

        this.changeImageHandler(true);

        this.observer = new ResizeObserver(() => {
            if (document.body.scrollHeight > window.innerHeight) {
                const imageContainerShouldHaveHeight =
                    window.innerHeight -
                    (this.isMobileValue
                        ? this.adContainerTarget.clientHeight
                        : 0);

                this.imageContainerTarget.style.height =
                    imageContainerShouldHaveHeight + "px";
            }

            // Safari on iPhone stuff (hide navigation tab)
            window.scrollTo(0, 1);
        });

        this.observer.observe(this.adContainerTarget);

        // Safari on iPhone stuff (hide navigation tab)
        window.scrollTo(0, 1);
    }

    prefetchAroundIndex = (index) => {
        prefetchNextImage(this.currentIndex, this.photos);
        prefetchNextImage(this.currentIndex + 1, this.photos);
        prefetchNextImage(this.currentIndex + 2, this.photos);

        prefetchPreviousImage(this.currentIndex, this.photos);
        prefetchPreviousImage(this.currentIndex - 1, this.photos);
        prefetchPreviousImage(this.currentIndex - 2, this.photos);
    };

    goLeft() {
        this.currentIndex = getPreviousIndex(this.currentIndex, this.count);
        this.imgTarget.src = this.photos[this.currentIndex].photofile_url;

        replaceUrl(
            this.albumIdValue,
            this.photos[this.currentIndex].img_id,
            this.urlPlaceholderValue
        );

        this.changeImageHandler();
    }

    goRight() {
        this.currentIndex = getNextIndex(this.currentIndex, this.count);
        this.imgTarget.src = this.photos[this.currentIndex].photofile_url;

        replaceUrl(
            this.albumIdValue,
            this.photos[this.currentIndex].img_id,
            this.urlPlaceholderValue
        );

        this.changeImageHandler();
    }

    arrowLeft() {
        const activeElement = document.activeElement;
        const commentForm = document.getElementById("comment-form");

        if (commentForm && commentForm.contains(activeElement)) {
            return;
        }

        this.goLeft();
    }

    arrowRight() {
        const activeElement = document.activeElement;
        const commentForm = document.getElementById("comment-form");

        if (commentForm && commentForm.contains(activeElement)) {
            return;
        }

        this.goRight();
    }

    goToAlbum() {
        this.backToAlbumTarget.click();
    }

    disconnect = () => {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        if (this.observer) {
            this.observer.disconnect();
        }

        // unregister listeners for swipe
        document.removeEventListener("touchstart", this.touchStartHandler);
        document.removeEventListener("touchend", this.touchEndHandler);

        // remove photos at leaving the page, we don't need them anymore
        window.photos = undefined;
    };
}
