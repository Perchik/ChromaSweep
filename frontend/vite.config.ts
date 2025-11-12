import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    host: "127.0.0.1", // don’t bind to 0.0.0.0
    strictPort: true,
    cors: false, // disable CORS on dev server
    origin: "http://localhost:5173",
  },
  resolve: {
    alias: {
      "@": "./src",
    },
  },
});
