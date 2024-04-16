const path = require("path");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

module.exports = {
    entry: {
        bundle: "./src/index.js",
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "/static/js/stimulus/"),
    },
    optimization: {
        minimizer: [new UglifyJsPlugin()],
    },
    mode: "production",
    devtool: "source-map",
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: [/node_modules/],
                use: [{ loader: "babel-loader" }],
            },
        ],
    },
    stats: {
        errorDetails: true,
    },
};
