import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  base: "/estudo-relevo-valdeorras",
  assetsInclude: ["modelos/*.tif"],
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        ascii: resolve(__dirname, "estudos/ascii/index.html"),
        normais: resolve(__dirname, "estudos/normais/index.html"),
        normais_2: resolve(__dirname, "estudos/normais_2/index.html"),
        semitonos: resolve(__dirname, "estudos/semitonos/index.html"),
      },
    },
  },
});
