import { Controller } from "@hotwired/stimulus";
import { loadScripts } from "./../utils/load_script";
import { is_garden, is_cz, is_wedding, is_mobile } from "./../utils/utils";

const is_desktop = !is_mobile;

const API_KEY = "yv04vmwJwiI40xOgTfWhTBni6Nxu5OhN";

const albumsCountToOffer = () => {
    if (window.innerWidth > 1280) {
        return 3;
    }
    return 2;
};

const articlesCountToOffer = () => {
    if (window.innerWidth > 1280) {
        return 3;
    }
    return 2;
};

const threadsCountToOffer = () => {
    const ih = window.innerHeight;

    if (is_desktop && ih < 700) {
        return 3;
    }

    if (is_desktop && ih < 800) {
        return 5;
    }

    if (is_desktop && ih < 900) {
        return 6;
    }

    return 8;
};

export default class extends Controller {
    static values = {
        instantsearchScriptUrl: String,
        instantsearchAdapterScriptUrl: String,
        serverId: Number,
    };

    static targets = ["container", "overlay"];

    connect() {
        this.initiatorElement = null;

        this.dropdownContainer = document.getElementById(
            "main-search-dropdown-container"
        );
        this.closeButton = document.getElementById("main-search-close-button");
        this.threadsMoreLink = document.getElementById(
            "threads-more-results-link"
        );
        this.albumsMoreLink = document.getElementById(
            "albums-more-results-link"
        );
        this.magazineMoreLink = document.getElementById(
            "magazine-more-results-link"
        );

        this.textColor = is_wedding
            ? "text-[#222425] group-focus-within:text-gray-700 placeholder:text-gray-600 group-focus-within:placeholder:text-gray-700"
            : is_garden
            ? "text-gray-500 placeholder:text-gray-500 group-focus-within:placeholder:text-gray-700"
            : "text-gray-600 group-focus-within:text-gray-100 placeholder:text-white group-focus-within:placeholder:text-gray-300";

        this.iconColor = is_wedding
            ? "text-[#1d8e8e]"
            : is_garden
            ? "text-gray-600"
            : "text-white";

        const arr_scripts_to_load = [];

        if (window.instantsearch === undefined) {
            arr_scripts_to_load.push({
                src: this.instantsearchScriptUrlValue,
                crossorigin: "anonymous",
            });
        }

        if (window.TypesenseInstantSearchAdapter === undefined) {
            arr_scripts_to_load.push({
                src: this.instantsearchAdapterScriptUrlValue,
            });
        }

        loadScripts(arr_scripts_to_load).then(() => {
            this.initializeSearch(this.serverIdValue);
        });
    }

    display = () => {
        this.containerTarget.style.display = "block";
    };

    hide = () => {
        this.containerTarget.style.display = "none";
    };

    setSearchAndFocus(newValue) {
        const inputElement = this.containerTarget.querySelector(
            "#main-search-searchbox input"
        );
        inputElement.focus();
        inputElement.value = newValue;
    }

    setInitiatorElement(element) {
        this.initiatorElement = element;
    }

    focusOnPreviousInitiator = () => {
        if (this.initiatorElement) {
            this.initiatorElement.focus();
        }
    };

    initializeSearch = (serverId) => {
        const typesenseInstantsearchAdapter =
            new window.TypesenseInstantSearchAdapter({
                server: {
                    apiKey: API_KEY,
                    nodes: [
                        {
                            host: window.location.hostname.replace(
                                "local.",
                                "www."
                            ),
                            path: "/typesense",
                            port: "",
                            protocol: "https",
                        },
                    ],
                    cacheSearchResultsForSeconds: 5 * 60,
                },
                collectionSpecificSearchParameters: {
                    [`thread-categories-${serverId}`]: {
                        query_by: "name",
                        per_page: 3,
                    },
                    [`faq-${serverId}`]: {
                        query_by: "question",
                        per_page: 2,
                    },
                    [`threads-${serverId}`]: {
                        query_by: "title,username,category_name",
                        query_by_weight: "7,2,1",
                        per_page: is_garden ? 4 : threadsCountToOffer(),
                    },
                    [`photoblog-${serverId}`]: {
                        query_by: "title,username",
                        query_by_weight: "7,1",
                        filter_by: "type:=Album",
                        per_page: albumsCountToOffer(),
                    },
                    [`magazine-${serverId}`]: {
                        query_by: "title,text",
                        query_by_weight: "5,1",
                        per_page: is_garden ? 4 : articlesCountToOffer(),
                    },
                },
            });

        const searchClient = typesenseInstantsearchAdapter.searchClient;

        this.search = window.instantsearch({
            searchClient,
            indexName: `threads-${serverId}`,
            searchFunction: (helper) => {
                if (helper.state.query === "") {
                    this.hide();
                    this.focusOnPreviousInitiator();
                } else {
                    helper.search();
                }
            },
        });

        this.search &&
            this.search.on("render", (e) => {
                this.threadsMoreLink.setAttribute(
                    "href",
                    encodeURI(
                        `/search?threads-${serverId}[query]=${this.search.helper.state.query}`
                    )
                );

                this.albumsMoreLink.setAttribute(
                    "href",
                    encodeURI(
                        `/search/photoblog/?photoblog-${serverId}[query]=${this.search.helper.state.query}`
                    )
                );

                this.magazineMoreLink.setAttribute(
                    "href",
                    encodeURI(
                        `/search/magazine?magazine-${serverId}[query]=${this.search.helper.state.query}`
                    )
                );
            });

        const connectSearchBox =
            window.instantsearch.connectors.connectSearchBox;

        const fn = (event) => {
            const queryValue = event.target.value;
            const uriToRedirect = is_garden
                ? `/search/magazine?magazine-${serverId}[query]=${queryValue}`
                : `/search/?threads-${serverId}[query]=${queryValue}`;

            if (event.key === "Enter") {
                window.location.assign(encodeURI(uriToRedirect));
            }
        };

        const renderSearchBox = (renderOptions, isFirstRender) => {
            const { query, refine } = renderOptions;
            const container = document.querySelector(
                renderOptions.widgetParams.container
            );

            if (isFirstRender) {
                const input = document.createElement("input");

                input.setAttribute(
                    "class",
                    renderOptions.widgetParams.cssClasses.input
                );
                input.setAttribute(
                    "placeholder",
                    renderOptions.widgetParams.placeholder
                );

                input.addEventListener("keydown", fn);

                input.addEventListener("input", (event) => {
                    refine(event.target.value);
                });

                container.appendChild(input);
            }

            container.querySelector("input").value = query;
        };

        const customSearchWidget = connectSearchBox(renderSearchBox);

        this.search.addWidgets([
            customSearchWidget({
                container: "#main-search-searchbox",
                placeholder: is_cz
                    ? "Hledejte. Začněte psát..."
                    : "Hľadajte. Začnite písať...",
                autofocus: false,
                showReset: false,
                showSubmit: false,
                showLoadingIndicator: true,
                cssClasses: {
                    input: `w-[200px] items-center flex-grow p-1 pl-2 bg-transparent border-none ${this.textColor} placeholder:text-sm placeholder:text-gray-400 outline-none border-none `,
                },
            }),
            window.instantsearch.widgets
                .index({
                    indexName: `thread-categories-${serverId}`,
                })
                .addWidgets([
                    window.instantsearch.widgets.panel({
                        cssClasses: {
                            header: "text-primary-700 font-bold text-xl mb-2",
                        },
                        templates: {
                            header: `Kategórie fóra`,
                        },
                        hidden: (options) => {
                            const nbHits = options.results.nbHits;
                            this.threadsMoreLink.style.display =
                                nbHits === 0 ? "none" : "block";

                            return nbHits === 0;
                        },
                    })(window.instantsearch.widgets.hits)({
                        escapeHTML: false,
                        container: "#main-search-thread-categories-results",
                        cssClasses: {
                            list: "flex flex-wrap gap-2 m-0 p-0 list-none",
                            emptyRoot: "text-gray-600 text-sm",
                        },
                        templates: {
                            empty: "",
                            item: (hit, { html, components }) => {
                                return `
                                <a 
                                    class="text-xs text-gray-800 bg-gray-100 hover:bg-blue-100 transition-colors duration-300 px-2 py-1 rounded-md"
                                    href="/forum/category/${hit.slug}/"
                                >
                                    ${hit._highlightResult.name.value}
                                </a>
                                `;
                            },
                        },
                    }),
                ]),
            window.instantsearch.widgets
                .index({
                    indexName: `faq-${serverId}`,
                })
                .addWidgets([
                    window.instantsearch.widgets.panel({
                        cssClasses: {
                            header: "text-primary-700 font-bold text-xl mb-2",
                        },
                        templates: {
                            header: `FaQ - Otázky a Odpovede`,
                        },
                        hidden: (options) => {
                            const nbHits = options.results.nbHits;
                            this.threadsMoreLink.style.display =
                                nbHits === 0 ? "none" : "block";

                            return nbHits === 0;
                        },
                    })(window.instantsearch.widgets.hits)({
                        escapeHTML: false,
                        container: "#main-search-faq-results",
                        cssClasses: {
                            list: "m-0 p-0 list-none links",
                            emptyRoot: "text-gray-600 text-sm",
                        },
                        templates: {
                            empty: "",
                            item: (hit, { html, components }) => {
                                return `
                                <div class="flex flex-col gap-0.5 flex-grow-0">
                                    <div class="font-bold text-xs px-2">
                                        ${hit._highlightResult.question.value}
                                    </div>
                                    <div class="text-xs text-gray-500 ml-4">► ${hit.answer}</div>
                                </div>`;
                            },
                        },
                    }),
                ]),
            window.instantsearch.widgets.panel({
                cssClasses: {
                    header: "text-gray-700 font-black text-xl mb-2",
                },
                templates: {
                    header: `💬 <a class="no-underline text-primary-700 hover:underline" href="/search" target="_blank">FÓRUM</a>`,
                },
                hidden: (options) => {
                    const nbHits = options.results.nbHits;
                    this.threadsMoreLink.style.display =
                        nbHits === 0 ? "none" : "block";

                    return nbHits === 0;
                },
            })(window.instantsearch.widgets.hits)({
                escapeHTML: false,
                container: "#main-search-thread-results",
                cssClasses: {
                    list: "list-none flex flex-col gap-2 p-0 my-0 mt-2",
                    item: "border-solid border-0 border-b last:border-b-0 border-gray-200 pb-2",
                    emptyRoot: "text-gray-600 text-sm",
                },
                templates: {
                    empty: is_cz ? "Žádné diskuse" : "Žiadne diskusie",
                    item: (hit, { html, components }) => {
                        return `
                        <div>
                            <a class="font-semibold no-underline hover:underline text-primary-700" href="${hit.href}">
                                ${hit._highlightResult.title.value}
                            </a>
                            <div class="text-xs text-gray-500">${hit._highlightResult.category_name.value} | @${hit._highlightResult.username.value}</div>
                        </div>
                        `;
                    },
                },
            }),
            window.instantsearch.widgets
                .index({
                    indexName: `photoblog-${serverId}`,
                })
                .addWidgets([
                    window.instantsearch.widgets.panel({
                        cssClasses: {
                            header: "text-gray-700 font-bold text-sm mb-2",
                        },
                        templates: {
                            header: `<span class="-mt-1 mr-0.5">📷</span><a class="no-underline text-primary-700 hover:underline" href="/search/photoblog/" target="_blank">${
                                is_cz ? "ALBA A FOTKY" : "ALBUMY A FOTKY"
                            }</a>`,
                        },
                        hidden: (options) => {
                            const nbHits = options.results.nbHits;
                            this.threadsMoreLink.style.display =
                                nbHits === 0 ? "none" : "block";

                            return nbHits === 0;
                        },
                    })(window.instantsearch.widgets.hits)({
                        escapeHTML: false,
                        container: "#main-search-photoblog-results",
                        cssClasses: {
                            list: "grid grid-cols-2 xl:grid-cols-3 gap-2 m-0 p-0 list-none",
                            emptyRoot: "text-gray-600 text-sm",
                        },
                        templates: {
                            empty: is_cz
                                ? "Žádná alba ani fotky"
                                : "Žiadne albumy ani fotky",
                            item: (hit, { html, components }) => {
                                return `
                                <div class="flex flex-col gap-2 flex-grow-0">
                                    <a href="${hit.href}" target="_blank" class="relative no-underline">
                                        <img
                                            class="rounded-md object-cover object-center"
                                            src="${hit.img}"
                                            style="width: 100%; height: 150px;"
                                        >
                                        <div
                                            class="absolute right-0 bottom-1 text-white text-xs px-2"
                                            style="background-color: rgba(0,0,0,0.6)"
                                        >
                                            @${hit._highlightResult.username.value}
                                        </div>
                                    </a>
                                    <div class="text-xs text-gray-500">${hit._snippetResult.title.value}</div>
                                </div>`;
                            },
                        },
                    }),
                ]),
            ,
            window.instantsearch.widgets
                .index({
                    indexName: `magazine-${serverId}`,
                })
                .addWidgets([
                    window.instantsearch.widgets.panel({
                        cssClasses: {
                            header: "text-gray-700 font-bold text-sm mb-2",
                        },
                        templates: {
                            header: '✍️ <a class="no-underline text-primary-700 hover:underline" href="/search/magazine" target="_blank">MAGAZÍN</a>',
                        },
                        hidden: (options) => {
                            const nbHits = options.results.nbHits;
                            this.threadsMoreLink.style.display =
                                nbHits === 0 ? "none" : "block";

                            return nbHits === 0;
                        },
                    })(window.instantsearch.widgets.hits)({
                        escapeHTML: false,
                        container: "#main-search-magazine-results",
                        cssClasses: {
                            list: "grid grid-cols-2 xl:grid-cols-3 gap-2 m-0 p-0 list-none",
                            emptyRoot: "text-gray-600 text-sm",
                        },
                        templates: {
                            empty: is_cz ? "Žádné články" : "Žiadne články",
                            item: (hit, { html, components }) => {
                                return `
                                <a href="${hit.link}" target="_blank" class="no-underline flex flex-col gap-2 flex-grow-0">
                                    <img
                                        class="rounded-md object-cover object-center"
                                        src="${hit.featured_photo_url}"
                                        style="width: 100%; height: 150px;"
                                    >
                                    <div class="text-xs text-gray-500">...${hit._snippetResult.title.value}...</div>
                                </a>`;
                            },
                        },
                    }),
                ]),
        ]);
        this.search.start();
    };
}
