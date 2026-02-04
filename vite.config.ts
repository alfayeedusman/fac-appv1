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
    middlewareMode: true, // Use middleware mode so Express handles all routing
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
  let viteDevServer: any;

  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configReady(env) {
      // Store reference to Vite dev server when config is ready
    },
    async configureServer(server) {
      viteDevServer = server;
      const app = await createServer();

      // Add Vite's dev middleware to Express so it can serve React files
      app.use(server.middlewares);

      // Return the configured app to replace Vite's server
      return app;
    },
  };
}
