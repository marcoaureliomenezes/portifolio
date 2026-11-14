import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { readPosts } from "./scripts/blog-posts.mjs";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    __BLOG_PUBLISHED__: JSON.stringify(
      command === "build" && readPosts(path.resolve(__dirname, "content/blog")).length > 0,
    ),
  },
}));
