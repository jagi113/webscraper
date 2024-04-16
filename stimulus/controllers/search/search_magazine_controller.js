// import SearchController from "./search_controller";
// import trans from "../../translations/search";
// import { last_domain_part } from "./../utils/utils";

// export default class extends SearchController {
//     static values = {
//         ...SearchController.values,
//         likeImgSrc: String,
//     };

//     getAdditionalSearchParams = () => ({
//         query_by: "title,text",
//         query_by_weights: "5,1",
//         highlight_affix_num_tokens: 12,
//         sort_by: `unix_timestamp:desc`,
//     });

//     getCollectionKey = () => {
//         return `magazine-${this.serverIdValue}`;
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
//                         value: collectionKey,
//                     },
//                     {
//                         label: trans.SORT_OPTION_YEAR_DESC[last_domain_part],
//                         value: `${collectionKey}/sort/unix_timestamp:desc`,
//                     },
//                     {
//                         label: trans.SORT_OPTION_YEAR_ASC[last_domain_part],
//                         value: `${collectionKey}/sort/unix_timestamp:asc`,
//                     },
//                 ],
//                 // Optional parameters
//                 cssClasses: {
//                     select: "p-2 border w-full bg-white text-gray-700",
//                 },
//             }),
//             instantsearch.widgets.rangeInput({
//                 container: "#years-panel",
//                 attribute: "year",
//                 precision: 1,
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
//             instantsearch.widgets.refinementList({
//                 container: "#categories-panel",
//                 attribute: "categories",
//                 operator: "or",
//                 sortBy: ["count:desc"],
//                 cssClasses: {
//                     item: "mb-2",
//                     label: "flex",
//                     labelText: "flex-grow ml-1 mr-2",
//                     count: "rounded-full px-2 text-xs bg-gray-200 flex items-center",
//                     checkbox: "transform scale-110",
//                 },
//             }),
//             instantsearch.widgets.refinementList({
//                 container: "#tags-panel",
//                 attribute: "tags",
//                 operator: "or",
//                 sortBy: ["count:desc"],
//                 cssClasses: {
//                     item: "mb-2",
//                     label: "flex",
//                     labelText: "flex-grow ml-1 mr-2",
//                     count: "rounded-full px-2 text-xs bg-gray-200 flex items-center",
//                     checkbox: "transform scale-110",
//                 },
//             }),
//             instantsearch.widgets.hits({
//                 container: "#hits",
//                 cssClasses: {
//                     list: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4",
//                     item: "mb-2",
//                 },
//                 escapeHTML: false,
//                 templates: {
//                     empty: `${trans.NO_RESULTS[last_domain_part]}`,
//                     item: (hit, { html, components }) => {
//                         const categories = hit.categories.map(
//                             (cat) =>
//                                 `<div class="bg-primary-600 rounded-md px-2 py-1">${cat}</div>`
//                         );

//                         const bottomTextElement =
//                             hit._highlightResult.text.matchedWords.length === 0
//                                 ? html(hit.excerpt)
//                                 : html`...${components.Snippet({
//                                       attribute: "text",
//                                       hit,
//                                   })}...`;

//                         return html`
//                             <a
//                                 href="${hit.link}"
//                                 target="_blank"
//                                 class="bg-white border-b border-gray-200 mb-1 pb-2 shadow-md rounded-md h-full flex flex-col"
//                             >
//                                 <div class="relative">
//                                     <img
//                                         src="${hit.featured_photo_url}"
//                                         class="object-cover h-[200px] w-full"
//                                     />
//                                     <div
//                                         class="flex flex-wrap gap-2 absolute bottom-2 left-2 text-white text-xs"
//                                     >
//                                         ${html(categories)}
//                                     </div>
//                                 </div>
//                                 <div class="flex flex-col gap-2 px-4 pt-4 pb-2">
//                                     <div
//                                         class="text-primary-700 text-lg font-bold"
//                                     >
//                                         ${components.Highlight({
//                                             attribute: "title",
//                                             hit,
//                                         })}
//                                     </div>
//                                     <div class="text-gray-500 text-sm">
//                                         ${bottomTextElement}
//                                     </div>
//                                 </div>
//                             </a>
//                         `;
//                     },
//                 },
//             }),
//         ];
//     };
// }
