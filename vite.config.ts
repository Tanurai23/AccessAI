import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // 🔥 THIS is the critical fix
  base: "./",

  build: {
    outDir: "popup/dist",
    emptyOutDir: true,
    rollupOptions: {
      input: "popup/index.html",
    },
  },
});
