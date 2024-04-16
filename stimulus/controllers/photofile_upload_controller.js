import { Controller } from "@hotwired/stimulus";
import uptil from "./utils/uptil";

export default class extends Controller {
    static targets = ["input", "container"];
    static values = {
        closeUrl: String,
        uploadingText: {
            type: String,
            default: "Nahráva sa...",
        },
        uploadUrl: {
            type: String,
            default: "/system/upload/album",
        },
    };

    /**
     * Conserve aspect ratio of the original region. Useful when shrinking/enlarging
     * images to fit into a certain area.
     *
     * @param {Number} srcWidth width of source image
     * @param {Number} srcHeight height of source image
     * @param {Number} maxWidth maximum available width
     * @param {Number} maxHeight maximum available height
     * @return {Object} { width, height }
     */
    calculateAspectRatioFit(
        srcWidth,
        srcHeight,
        maxWidth = 1920,
        maxHeight = 1080
    ) {
        var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

        return { width: srcWidth * ratio, height: srcHeight * ratio };
    }

    sendForm = async (imageData, url) => {
        const fd = new FormData();
        fd.set("file", imageData);

        const el = uptil(
            this.inputTarget,
            (element) => element.tagName === "FORM"
        );
        const csrfInput = el.querySelector('input[name="csrfmiddlewaretoken"]');

        fd.set("csrfmiddlewaretoken", csrfInput.value);

        const response = await fetch(url, {
            method: "POST",
            body: fd,
        });

        return await response.json();
    };

    base64toBlob(base64Data, contentType) {
        contentType = contentType || "";
        const sliceSize = 1024;
        const byteCharacters = atob(base64Data);
        const bytesLength = byteCharacters.length;
        const slicesCount = Math.ceil(bytesLength / sliceSize);
        let byteArrays = new Array(slicesCount);

        for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
            const begin = sliceIndex * sliceSize;
            const end = Math.min(begin + sliceSize, bytesLength);

            let bytes = new Array(end - begin);
            for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
                bytes[i] = byteCharacters[offset].charCodeAt(0);
            }
            byteArrays[sliceIndex] = new Uint8Array(bytes);
        }
        return new Blob(byteArrays, { type: contentType });
    }

    createImage = (event) => {
        return new Promise((resolve, reject) => {
            const fr = event.target;
            const img = new Image();
            img.onload = (ev) => {
                this.imageLoadedHandler(ev);
                resolve();
            };
            img.src = fr.result;
        });
    };

    imageLoadedHandler = async (event) => {
        const canvas = document.createElement("canvas");
        const img = event.target;

        if (img.width > 1920 || img.height > 1080) {
            const newDimensions = this.calculateAspectRatioFit(
                img.width,
                img.height
            );
            img.width = newDimensions.width;
            img.height = newDimensions.height;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, img.width, img.height);

        const data = canvas.toDataURL("image/jpeg", 0.8);

        this.containerTarget.innerHTML += `
        <div
            data-random-id="${Math.round(Math.random() * 1000000)}"
            data-controller="remove-container"
            data-remove-container-target="container"
            class="h-32 rounded-md overflow-hidden relative animate-pulse handle not-uploaded"
        >
            <a 
                class="flex justify-center items-center bg-black bg-opacity-60 select-none cursor-pointer absolute right-2 top-2 w-5 h-5" 
                data-action="click->remove-container#remove"
            >
                <i 
                    class="block w-3 h-3 bg-white"
                    style="-webkit-mask:url(${
                        this.closeUrlValue
                    });mask-url:url(${this.closeUrlValue})"
                ></i>
            </a>
            <img src="${data}" class="w-full h-full object-cover">
        </div>
        `;
    };

    uploadImageElement = async (htmlImgElement) => {
        const parent = htmlImgElement.parentNode;
        const src = htmlImgElement.src;
        const base64data = src.split("data:image/jpeg;base64,")[1];

        const downloadingInformationEl = document.createElement("div");
        downloadingInformationEl.classList =
            "font-bold text-sm text-center py-1 bottom-0 absolute w-full bg-black/50 text-white";
        downloadingInformationEl.innerText = this.uploadingTextValue;

        parent.appendChild(downloadingInformationEl);

        const response = await this.sendForm(
            this.base64toBlob(base64data, "image/jpeg"),
            this.uploadUrlValue
        );

        // remove animate animation
        parent.classList.remove("animate-pulse");

        // remove uploading information
        downloadingInformationEl.remove();

        // select, that this parent/img was uploaded
        parent.classList.remove("not-uploaded");

        // add input with img id
        parent.innerHTML += `<input type="hidden" name="photos" value="${response.photo_id}">`;
    };

    inputChanged = async (event) => {
        const input = event.target;
        const files = input.files;

        let arrPromises = [];

        for (const file of files) {
            arrPromises.push(
                new Promise((resolve, reject) => {
                    const fr = new FileReader();
                    fr.onload = async (event) => {
                        const img = await this.createImage(event);
                        resolve(img);
                    };
                    fr.readAsDataURL(file);
                })
            );
        }

        await Promise.all(arrPromises);

        // now we have locally loaded all images, now wait on Promise.all and then in for loop start to uploading
        const allNonUploadedLocalImgs = [
            ...this.containerTarget.querySelectorAll("div.not-uploaded > img"),
        ];

        for (const img of allNonUploadedLocalImgs) {
            // going to upload this img
            await this.uploadImageElement(img);
        }
    };
}
