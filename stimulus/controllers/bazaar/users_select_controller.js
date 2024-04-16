import { Controller } from "@hotwired/stimulus";
import SlimSelect from "slim-select";
import { is_sk } from "./../utils/utils";

const charMap = {
    ď: "d",
    ť: "t",
    ň: "n",
    ž: "z",
    č: "c",
    ľ: "l",
    ĺ: "l",
    é: "e",
    ě: "e",
    ř: "r",
    ŕ: "r",
    ý: "y",
    ú: "u",
    í: "i",
    ǐ: "i",
    ó: "o",
    ô: "o",
    ǒ: "o",
    ä: "a",
    á: "a",
    ǎ: "a",
    š: "s",
};

const getSafeChar = (c) => {
    if (c in charMap) {
        return charMap[c];
    }
    return c;
};

const unaccent_and_lower = (str) =>
    str.toLowerCase().split("").map(getSafeChar).join();

// unaccent and lower everything
// if search = "Ženích" or "zenich", it will find option with "Ženích", or "Zenich" or "zenich"
const searchFunction = (option, search) => {
    const unaccented_lowered_option_text = unaccent_and_lower(option.text);
    const unaccented_lowered_search_text = unaccent_and_lower(search);

    return unaccented_lowered_option_text.includes(
        unaccented_lowered_search_text
    );
};

export default class extends Controller {
    static values = {
        placeholder: {
            type: String,
            default: "Vyberte hodnotu",
        },
        searchPlaceholder: {
            type: String,
            default: is_sk ? "Hľadať" : "Hledat",
        },
        searchText: {
            type: String,
            default: is_sk ? "Žiadne výsledky" : "Žádné výsledky",
        },
        data: {
            type: Array,
            default: [],
        },
        url: String,
    };

    static targets = ["select"];

    pendingTimeout = null;

    fetchResults(search) {
        // pozriem sa na pendingTimeout
        // ak tam nieco je, tak zrusit... a nastavit novy timeout
        // ak tam nic nie je, mozem nastavit
        // po konci timeoutu zrusit

        if (this.pendingTimeout !== null) {
            clearTimeout(this.pendingTimeout);
            this.pendingTimeout = null;
        }

        return new Promise((resolve, reject) => {
            this.pendingTimeout = setTimeout(() => {
                fetch(this.urlValue + "?search=" + search)
                    .then(function (response) {
                        resolve(response.json());
                    })
                    .catch((e) => reject(e))
                    .finally(() => {
                        this.pendingTimeout = null;
                    });
            }, 300);
        });
    }

    getOptionsForSlimSelect() {
        return {
            data: this.dataValue,
            select: this.selectTarget,
            placeholder: this.placeholderValue,
            searchPlaceholder: this.searchPlaceholderValue,
            searchText: this.searchTextValue,
            searchFilter: searchFunction,
            ajax: (search, callback) => {
                this.fetchResults(search)
                    .then(function (json) {
                        callback(json.data);
                    })
                    .catch(function (error) {
                        callback(false);
                    });
            },
        };
    }

    connect = () => {
        if (this.hasSelectTarget) {
            const options = this.getOptionsForSlimSelect();

            this.select = new SlimSelect(options);
            this.select.set(this.dataValue.map((obj) => obj.value));
        } else {
            console.warn("Target select not found");
        }
    };

    disconnect() {
        if (this.select) {
            this.select.destroy();
        }
    }
}
