import { Controller } from "@hotwired/stimulus";
import { loadScript, loadLink } from "./utils/load_script";
import { is_sk } from "./utils/utils";

const cz_translations = {
    "categories.activities": "Aktivity",
    "categories.animals-nature": "Zvířata a Příroda",
    "categories.custom": "Vlastní",
    "categories.flags": "Vlajky",
    "categories.food-drink": "Jídlo a Pití",
    "categories.objects": "Objekty",
    "categories.people-body": "Lidé a Tělo",
    "categories.recents": "Nedávno použité",
    "categories.smileys-emotion": "Smajlíky a Emoce",
    "categories.symbols": "Symboly",
    "categories.travel-places": "Cestování a Místa",

    "error.load": "Nepodařilo se načíst emotikony",

    "recents.clear": "Vymazat nedávné emotikony",
    "recents.none": "Zatím jste nevybrali žádné emotikony.",
    retry: "Zkuste to znovu",

    "search.clear": "Vymazat vyhledávání",

    "search.error": "Vyhledávání emotikonů selhalo",

    "search.notFound": "Nebyly nalezeny žádné výsledky",

    search: "Hledat emotikony...",
};

const sk_translations = {
    "categories.activities": "Aktivity",
    "categories.animals-nature": "Zvieratá a Príroda",
    "categories.custom": "Vlastné",
    "categories.flags": "Vlajky",
    "categories.food-drink": "Jedlo a Pitie",
    "categories.objects": "Objekty",
    "categories.people-body": "Ľudia a Telo",
    "categories.recents": "Nedávno použité",
    "categories.smileys-emotion": "Smajlíky a Emócie",
    "categories.symbols": "Symboly",
    "categories.travel-places": "Cestovanie a Miesta",

    "error.load": "Nepodarilo sa načítať emotikony",

    "recents.clear": "Vymazať nedávne emotikony",
    "recents.none": "Zatiaľ ste nevybrali žiadne emotikony.",

    retry: "Skúste to znova",

    "search.clear": "Vymazať vyhľadávanie",

    "search.error": "Vyhľadávanie emotikonov zlyhalo",

    "search.notFound": "Neboli nájdené žiadne výsledky",

    search: "Hľadať emotikony...",
};

export default class extends Controller {
    static targets = ["container", "button", "input"];

    static values = {
        scriptPicmoSrc: String,
        scriptPicmoPopupSrc: String,
        styleSrc: String,
    };

    addTextToEmoji = (event) => {
        this.inputTarget.value =
            this.inputTarget.value.substring(0, this.lastSelectionStart) +
            event.emoji +
            this.inputTarget.value.substring(this.lastSelectionStart);

        this.lastSelectionStart += 2;
    };

    togglePicker = () => {
        if (
            typeof this.lastSelectionStart === "undefined" ||
            this.lastSelectionStart == null
        ) {
            this.lastSelectionStart = this.inputTarget.selectionStart;
        }
        if (typeof window.picmo === "undefined") {
            Promise.all([
                new Promise((resolve, reject) => {
                    loadScript({ src: this.scriptPicmoSrcValue }).then(() => {
                        loadScript({ src: this.scriptPicmoPopupSrcValue }).then(
                            () => {
                                resolve();
                            }
                        );
                    });
                }),

                loadLink({ rel: "stylesheet", href: this.styleSrcValue }),
            ]).then(() => {
                this.picker = this.createPicker();
                this.picker.addEventListener(
                    "emoji:select",
                    this.addTextToEmoji
                );
                this.picker.toggle();
            });
        } else {
            if (!("picker" in this)) {
                this.picker = this.createPicker();
                this.picker.addEventListener(
                    "emoji:select",
                    this.addTextToEmoji
                );
            }
            this.picker.toggle();
        }
    };

    toggleBody = () => {
        this.lastSelectionStart = null;
    };

    createPicker = () => {
        return window.picmoPopup.createPopup(
            {
                rootElement: this.containerTarget,
                i18n: is_sk ? sk_translations : cz_translations,
                showVariants: false,
            },
            {
                triggerElement: this.buttonTarget,
                referenceElement: this.buttonTarget,
            }
        );
    };

    disconnect() {
        if ("picker" in this) {
            this.picker.removeEventListener(
                "emoji:select",
                this.addTextToEmoji
            );
        }
    }
}
