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
        target: "https://nayomis-backend.onrender.com",
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
