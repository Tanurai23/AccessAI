import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  root: path.resolve(__dirname, "popup"),
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./popup/src"),
    },
  },

  build: {
    assetsDir: "assets",
    outDir: path.resolve(__dirname, "popup/dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, "popup/index.html"),
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]"
      }
    }
  },
});