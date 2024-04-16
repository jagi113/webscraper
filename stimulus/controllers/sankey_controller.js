import { Controller } from "@hotwired/stimulus";
import { loadScript } from "./utils/load_script";

export default class extends Controller {
    static targets = ["diagram"];
    static values = {
        categories: String,
    };

    colorsLiving = {
        500: "#d4d9dd",
        600: "#00202e",
        700: "#003b71",
        800: "#012d55",
    };

    colorsWedding = {
        500: "#dab4bd",
        600: "#a52755",
        700: "#a70f43",
        800: "#8b0d38",
    };

    async connect() {
        if (!this.googleChartsLoaded()) {
            await loadScript({
                src: "https://www.gstatic.com/charts/loader.js",
            });
        }

        const categories = JSON.parse(
            this.categoriesValue.replace(/'/g, '"').replace(/None/g, "null")
        );

        const totalItems = categories.reduce(
            (total, category) => total + category.items.length,
            0
        );
        if (!categories || categories.length === 0 || totalItems === 0) {
            return;
        }
        const diagramHeight = Math.min(
            Math.max((categories.length + totalItems) * 35, 100),
            500
        );

        const categoryTotals = categories.map((category) => ({
            id: category.id,
            total: category.items.reduce((acc, item) => acc + item.price, 0),
        }));

        const data = [["Budget", "Category", "Cena"]];
        categories.forEach((category) => {
            let categoryTotal = categoryTotals.find(
                (total) => total.id === category.id
            ).total;
            categoryTotal = Math.round(categoryTotal * 100) / 100;

            if (category.items.length > 0) {
                if (category.name.length > 25) {
                    category.name = category.name.substring(0, 25) + "...";
                }
                data.push(["Budget", category.name, categoryTotal]);
                category.items.forEach((item) => {
                    if (item.name.length > 20) {
                        item.name = item.name.substring(0, 20) + "...";
                    }
                    item.price = Math.round(item.price * 100) / 100;
                    console.log(item.price);
                    data.push([category.name, item.name, item.price]);
                });
            }
        });

        google.charts.load("current", { packages: ["sankey"] });
        google.charts.setOnLoadCallback(() => {
            const chartData = google.visualization.arrayToDataTable(data);
            var options = {
                height: diagramHeight,
                width: "100%",
                sankey: {
                    link: { color: { fill: this.getColor(500) } },
                    node: {
                        colors: [this.getColor(700)],
                        label: {
                            color: this.getColor(800),
                            fontSize: 12,
                            bold: true,
                        },
                    },
                },
            };
            const chart = new google.visualization.Sankey(this.diagramTarget);
            chart.draw(chartData, options);
        });
    }

    getColor = (number) => {
        const bodyClass = document.body.classList;

        if (bodyClass.contains("living")) {
            return this.colorsLiving[number];
        } else if (bodyClass.contains("wedding")) {
            return this.colorsWedding[number];
        } else {
            return "#000000";
        }
    };

    googleChartsLoaded() {
        return (
            typeof google !== "undefined" &&
            typeof google.charts !== "undefined"
        );
    }

    disconnect() {
        google.charts.setOnLoadCallback(null);
    }
}
