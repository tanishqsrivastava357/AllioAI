const { defineConfig } = require("vite");
const react = require("@vitejs/plugin-react");

module.exports = defineConfig({
  plugins: [react()],
  define: {
    "process.env.NODE_ENV": JSON.stringify("production")
  },
  build: {
    lib: {
      entry: "src/react/signin.jsx",
      name: "AllioGoogleSignIn",
      formats: ["iife"],
      fileName: () => "google-react-bundle.js"
    },
    outDir: "src/scripts",
    emptyOutDir: false,
    minify: false
  }
});
