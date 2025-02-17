import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  base: "/estudo-relevo-valdeorras",
  assetsInclude: ["modelos/*.tif"],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        ascii: resolve(__dirname, "estudos/ascii/index.html"),
        normais: resolve(__dirname, "estudos/normais/index.html"),
        semitonos: resolve(__dirname, "estudos/semitonos/index.html"),
      },
    },
  },
});
