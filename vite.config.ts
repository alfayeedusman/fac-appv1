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

      // Add Express app as middleware to Vite dev server
      server.middlewares.use(app);

      // Add fallback middleware to serve index.html for SPA routing
      server.middlewares.use((req, res, next) => {
        // Skip if it's an API route
        if (req.path.startsWith("/api/")) {
          return next();
        }

        // For non-API routes, serve index.html and let React Router handle it
        if (!req.path.match(/\.[^.]*$/)) {
          // If path doesn't have a file extension, serve index.html
          req.url = "/index.html";
        }

        next();
      });
    },
  };
}
