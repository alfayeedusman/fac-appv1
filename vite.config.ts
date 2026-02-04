import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { createServer } from "./server/index";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    middlewareMode: false,
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [
    react(),
    expressPlugin(),
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html',
      apply: 'build' // Only apply during build, not dev
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    async configureServer(server) {
      const app = await createServer();

      // Add Express app as middleware to Vite's dev server
      // Express will handle API routes
      server.middlewares.use(app);

      // Add SPA fallback middleware AFTER Express
      // This serves index.html for any non-API route that Vite didn't handle
      server.middlewares.use((req, res, next) => {
        // Don't handle API routes here - let Express 404 them
        if (req.path.startsWith("/api/")) {
          return next();
        }

        // For SPA navigation routes (no file extension), serve index.html
        if (!req.path.match(/\.[^./]*$/)) {
          req.url = "/index.html";
        }

        next();
      });
    },
  };
}
