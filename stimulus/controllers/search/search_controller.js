// import { Controller } from "@hotwired/stimulus";
// import { loadScripts } from "./../utils/load_script";
// import { last_domain_part } from "./../utils/utils";
// import trans from "../../translations/search";

// const neomarketMiddleware = ({ instantSearchInstance }) => {
//     return {
//         onStateChange({ uiState }, ...everythingElse) {
//             try {
//                 const values = Object.values(uiState);
//                 const firstValue = values[0];
//                 const query = firstValue.query;

//                 document
//                     .getElementById("search-neomarket-tab")
//                     .setAttribute("href", `/market/?query=${query}`);
//             } catch (e) {
//                 console.exception(e);
//             }
//         },
//     };
// };

// export default class extends Controller {
//     static values = {
//         instantsearchStaticSrc: String,
//         adapterStaticSrc: String,
//         typesenseHost: {
//             type: String,
//             default: window.location.hostname.startsWith("local.")
//                 ? "www." +
//                   window.location.hostname.split(".").slice(1).join(".")
//                 : window.location.hostname,
//         },
//         serverId: {
//             type: Number,
//             default: 301,
//         },
//     };

//     connect = () => {
//         let arr_scripts_to_load = [];

//         if (typeof window.instantsearch === "undefined") {
//             arr_scripts_to_load.push({
//                 src: this.instantsearchStaticSrcValue,
//             });
//         }

//         if (typeof window.TypesenseInstantSearchAdapter === "undefined") {
//             arr_scripts_to_load.push({
//                 src: this.adapterStaticSrcValue,
//             });
//         }

//         loadScripts(arr_scripts_to_load).then(() => {
//             this.initializeSearch();
//         });
//     };

//     getCollectionKey = () => {
//         return `threads-${this.serverIdValue}`;
//     };

//     getAdditionalSearchParams = () => ({
//         query_by: "title,username,body,category_name",
//         query_by_weights: "2,1,1,1",
//         num_typos: "1,2,2,4",
//         highlight_affix_num_tokens: 16,
//         sort_by: `_text_match:desc,year:desc`,
//     });

//     initializeSearch = () => {
//         const typesenseInstantsearchAdapter = new TypesenseInstantSearchAdapter(
//             {
//                 server: {
//                     apiKey: "yv04vmwJwiI40xOgTfWhTBni6Nxu5OhN", // Be sure to use an API key that only allows search operations
//                     nodes: [
//                         {
//                             host: this.typesenseHostValue,
//                             path: "/typesense",
//                             port: "",
//                             protocol: "https",
//                         },
//                     ],
//                     cacheSearchResultsForSeconds: 2 * 60, // Cache search results from server. Defaults to 2 minutes. Set to 0 to disable caching.
//                 },
//                 // The following parameters are directly passed to Typesense's search API endpoint.
//                 //  So you can pass any parameters supported by the search endpoint below.
//                 //  query_by is required.
//                 additionalSearchParameters: this.getAdditionalSearchParams(),
//             }
//         );
//         const searchClient = typesenseInstantsearchAdapter.searchClient;
//         const collectionKey = this.getCollectionKey();

//         const search = instantsearch({
//             searchClient,
//             indexName: collectionKey,
//             routing: true,
//         });

//         search.addWidgets(this.getWidgets());
//         search.start();

//         search.use(neomarketMiddleware);
//     };

//     getWidgets = () => {
//         const collectionKey = this.getCollectionKey();

//         return [
//             this.getAnalyticsWidget(),
//             this.getSearchBoxWidget(),
//             this.getStatsWidget(),
//             this.getPaginationWidget(),
//             instantsearch.widgets.sortBy({
//                 container: "#sort-panel",
//                 items: [
//                     {
//                         label: trans.SORT_OPTION_MOST_RELEVANT[
//                             last_domain_part
//                         ],
//                         value: `${collectionKey}`,
//                     },
//                     {
//                         label: trans.SORT_OPTION_YEAR_DESC[last_domain_part],
//                         value: `${collectionKey}/sort/year:desc`,
//                     },
//                     {
//                         label: trans.SORT_OPTION_YEAR_ASC[last_domain_part],
//                         value: `${collectionKey}/sort/year:asc`,
//                     },
//                     {
//                         label: trans.SORT_OPTION_POSTS_DESC[last_domain_part],
//                         value: `${collectionKey}/sort/message_count:desc`,
//                     },
//                     {
//                         label: trans.SORT_OPTION_POSTS_ASC[last_domain_part],
//                         value: `${collectionKey}/sort/message_count:asc`,
//                     },
//                 ],
//                 // Optional parameters
//                 cssClasses: {
//                     select: "p-2 border w-full bg-white text-gray-700",
//                 },
//             }),
//             instantsearch.widgets.refinementList({
//                 container: "#category-panel",
//                 attribute: "category_name",
//                 operator: "or",
//                 sortBy: ["count:desc"],
//                 templates: {
//                     showMoreText: (data, { html }) => {
//                         return html`${data.isShowingMore
//                             ? "<span class='text-primary-700 hover:underline'>Ukázať menej</span>"
//                             : "<span class='text-primary-700 hover:underline'>Ukázať viac</span>"}`;
//                     },
//                 },
//                 limit: 10,
//                 showMore: true,
//                 showMoreLimit: 25,
//                 cssClasses: {
//                     item: "mb-2",
//                     label: "flex",
//                     labelText: "flex-grow ml-1 mr-2",
//                     count: "rounded-full px-2 text-xs bg-gray-200 flex items-center",
//                     checkbox: "transform scale-110",
//                 },
//             }),
//             instantsearch.widgets.rangeInput({
//                 container: "#years-panel",
//                 attribute: "year",
//                 precision: 0,
//                 templates: {
//                     separatorText: "do",
//                     submitText: "Nastav",
//                 },
//                 cssClasses: {
//                     form: "flex items-center",
//                     separator: "mx-2",
//                     submit: "ml-2 bg-primary-600 text-white px-4 py-2",
//                     inputMin: "p-2 w-20 ",
//                     inputMax: "p-2 w-20",
//                 },
//             }),
//             instantsearch.widgets.hits({
//                 container: "#hits",
//                 cssClasses: {
//                     item: "mb-2",
//                 },
//                 templates: {
//                     item: (hit, { html, components }) => {
//                         return html`
//                             <a
//                                 href="${hit.href}"
//                                 target="_blank"
//                                 class="hit-name block border-b border-gray-200 mb-1 pb-2"
//                             >
//                                 <div class="font-bold text-primary-700 text-lg">
//                                     ${components.Highlight({
//                                         attribute: "title",
//                                         hit,
//                                     })}
//                                 </div>
//                                 <div class="text-xs text-gray-600 mb-2">
//                                     ${hit.message_count} odpovedí,${" "}
//                                     ${trans.DISCUSSION_BEGINNING[
//                                         last_domain_part
//                                     ]}${" "}
//                                     v roku ${hit.year} od
//                                     ${" "}${components.Highlight({
//                                         attribute: "username",
//                                         hit,
//                                     })}
//                                 </div>
//                                 <div class="text-sm text-gray-600">
//                                     ${hit.body.length > 500
//                                         ? hit.body.slice(0, 500) + "..."
//                                         : components.Snippet({
//                                               attribute: "body",
//                                               hit,
//                                           })}
//                                 </div>
//                             </a>
//                         `;
//                     },
//                 },
//             }),
//         ];
//     };

//     getAnalyticsWidget = () => {
//         return instantsearch.widgets.analytics({
//             pushFunction(formattedParameters, state, results) {
//                 window.gtag("event", "page_view", {
//                     page_path: location.pathname + location.search,
//                 });
//             },
//         });
//     };

//     getSearchBoxWidget = () => {
//         return instantsearch.widgets.searchBox({
//             container: "#searchbox",
//             placeholder: trans.SEARCH_PLACEHOLDER[last_domain_part],
//             autofocus: true,
//             showReset: false,
//             showSubmit: false,
//             showLoadingIndicator: true,
//             cssClasses: {
//                 input: "p-2 pl-4 shadow-sm w-full",
//             },
//         });
//     };
//     getStatsWidget = () => {
//         return instantsearch.widgets.stats({
//             container: "#stats",
//             templates: {
//                 text(data, { html }) {
//                     let count = "";

//                     if (data.hasManyResults) {
//                         if (data.nbHits > 1 && data.nbHits < 5) {
//                             count += `${data.nbHits} ${trans.FEW_RESULTS[last_domain_part]}`;
//                         } else {
//                             count += `${data.nbHits} ${trans.LOT_RESULTS[last_domain_part]}`;
//                         }
//                     } else if (data.hasOneResult) {
//                         count += `1 ${trans.RESULT[last_domain_part]}`;
//                     } else {
//                         count += trans.NO_RESULTS[last_domain_part];
//                     }

//                     return `
//                         <span class="text-gray-400 text-xs">
//                             ${count} za ${data.processingTimeMS}ms
//                         </span>
//                     `;
//                 },
//             },
//         });
//     };

//     getPaginationWidget = () => {
//         return instantsearch.widgets.pagination({
//             container: "#pagination",
//             // Optional parameters
//             showFirst: true,
//             showPrevious: true,
//             showNext: true,
//             showLast: false,
//             padding: window.innerWidth < 500 ? 1 : 2,
//             templates: {},
//             cssClasses: {
//                 root: "flex justify-center",
//                 list: "flex gap-2",
//                 item: "border bg-white",
//                 selectedItem: "bg-primary-600 text-white",
//                 link: "px-4 py-2 block",
//             },
//         });
//     };
// }
