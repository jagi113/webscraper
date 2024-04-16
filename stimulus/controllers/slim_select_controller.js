import { Controller } from "@hotwired/stimulus";
import SlimSelect from "slim-select";
import { is_sk } from "./utils/utils";

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
    ť: "t",
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
    ň: "n",
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
        showSearch: {
            type: Boolean,
            default: true,
        },
        allowDeselect: {
            type: Boolean,
            default: false,
        },
    };

    static targets = ["select"];

    getOptionsForSlimSelect() {
        return {
            select: this.selectTarget,
            placeholder: this.placeholderValue,
            allowDeselect: this.allowDeselectValue,
            showSearch: this.showSearchValue,
            searchPlaceholder: this.searchPlaceholderValue,
            searchText: this.searchTextValue,
            searchFilter: searchFunction,
        };
    }

    connect() {
        if (this.hasSelectTarget) {
            const options = this.getOptionsForSlimSelect();

            this.select = new SlimSelect(options);
            this.select.slim.container.classList.remove("hidden");
        } else {
            console.warn("Target select not found");
        }
    }

    disconnect() {
        this.select.destroy();
    }
}
