// import SearchController from "./search_controller";
// import trans from "../../translations/search";
// import { last_domain_part } from "./../utils/utils";

// export default class extends SearchController {
//     static values = {
//         ...SearchController.values,
//         likeImgSrc: String,
//     };

//     getCollectionKey = () => {
//         return `photoblog-${this.serverIdValue}`;
//     };

//     getAdditionalSearchParams = () => ({
//         query_by: "title",
//         per_page: 20,
//         sort_by: `_text_match:desc,year:desc`,
//     });

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
//                         value: `${collectionKey}/sort/year:desc`,
//                     },
//                     {
//                         label: trans.SORT_OPTION_YEAR_ASC[last_domain_part],
//                         value: `${collectionKey}/sort/year:asc`,
//                     },
//                     {
//                         label: trans.SORT_OPTION_LIKES_DESC[last_domain_part],
//                         value: `${collectionKey}/sort/likes:desc`,
//                     },
//                     {
//                         label: trans.SORT_OPTION_YEAR_ASC[last_domain_part],
//                         value: `${collectionKey}/sort/likes:asc`,
//                     },
//                 ],
//                 // Optional parameters
//                 cssClasses: {
//                     select: "p-2 border w-full bg-white text-gray-700",
//                 },
//             }),
//             instantsearch.widgets.refinementList({
//                 container: "#username-panel",
//                 attribute: "username",
//                 operator: "or",
//                 searchable: true,
//                 searchablePlaceholder: trans.SEARCH_FOR_USER[last_domain_part],
//                 sortBy: ["count:desc"],
//                 templates: {
//                     searchableNoResults() {
//                         return `<div>${trans.NO_RESULTS[last_domain_part]}</div>`;
//                     },
//                 },
//                 cssClasses: {
//                     searchBox: "mb-2",
//                     searchableInput: "p-2",
//                     searchableSubmit:
//                         "p-3 bg-primary-600 rounded-sm fill-white",
//                     item: "mb-2",
//                     label: "flex",
//                     labelText: "flex-grow ml-1 mr-2 text-gray-700",
//                     count: "rounded-full px-2 text-xs bg-gray-200 flex items-center",
//                     checkbox: "transform scale-110",
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
//                 container: "#type-panel",
//                 attribute: "type",
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
//                     list: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
//                     item: "mb-2",
//                 },
//                 templates: {
//                     empty: `${trans.NO_RESULTS[last_domain_part]}`,
//                     item: `
//                         <a href="{{href}}" target="_blank" class="bg-white border-b border-gray-200 mb-1 pb-2 shadow-md rounded-md h-full flex flex-col">
//                             <img src="{{ img }}" class="object-cover h-[250px] w-full">
//                             <div class="flex flex-col flex-grow px-4 pt-4 pb-2">
//                                 <div class="text-primary-700">
//                                     {{#helpers.snippet}}{ "attribute": "title" }{{/helpers.snippet}}
//                                 </div>
//                                 <div class="text-gray-600 mt-2 flex-grow">
//                                     <div class="text-xs  mb-1">od {{username}}</div>
//                                 </div>
//                                 <div class="flex text-gray-600">
//                                     <div class="text-xs flex-grow flex gap-1 items-center">
//                                         <div>{{likes}}</div>
//                                         <img src="${this.likeImgSrcValue}" class="w-4 h-4 -mt-0.5">
//                                     </div>
//                                     <div class="text-xs">r. {{year}}</div>
//                                 </div>
//                             </div>
//                         </a>
//                     `,
//                 },
//             }),
//         ];
//     };
// }
