module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary:"#0058be",
        "primary-container":"#2170e4",
        background:"#f8f9ff",
        "surface-container-low":"#eff4ff",
        "surface-container-lowest":"#ffffff",
        "surface-container-high":"#dce9ff",
        "surface-container-highest":"#d3e4fe",
        "on-surface":"#0b1c30",
        "on-surface-variant":"#424754"
      },
      fontFamily:{
        headline:["Manrope"],
        body:["Inter"]
      }
    }
  },
  plugins:[]
}