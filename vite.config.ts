import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { faviconPlugin } from "./favicon-plugin";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(), 
    faviconPlugin()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
