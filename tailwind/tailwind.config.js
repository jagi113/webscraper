/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./webscraper/templates/**/*.html",
    "./webscraper/**/templates/**/*.html",
    "./webscraper/**/**/**/*.html",
    "./stimulus/static_src/src/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        "prism-tomorrow-bg": "#2d2d2d",
      },
    },
  },
  plugins: [],
};
