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
  appType: 'spa', // Enable SPA fallback - serve index.html for non-existent files
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    async configureServer(server) {
      const app = await createServer();

      // Add Express app as middleware to Vite's dev server
      // Express will handle all API routes
      server.middlewares.use(app);

      // Trigger database migrations and seeding in dev mode
      // (In production, this happens when app.listen() is called)
      setTimeout(async () => {
        try {
          const { migrate } = await import("./server/database/migrate.js");

          console.log("🔄 Initializing database and running migrations...");
          await migrate();
          console.log("✅ Database initialization and migrations completed successfully");

          // Skip additional seeding - the migrate() function already handles initial data
          // seedBranches() and seedUsers() have schema mismatches and will cause server errors
          console.log("🌱 Core database initialization complete");
        } catch (error) {
          console.error("❌ Database initialization failed:", error);
        }
      }, 2000); // Wait 2 seconds to ensure Vite is fully ready

      // Vite's appType: 'spa' config will handle SPA fallback for non-API routes
    },
  };
}
