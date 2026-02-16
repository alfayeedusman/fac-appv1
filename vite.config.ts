import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server/index";

// Simpler build config for faster builds
export default defineConfig(({ mode, command }) => {
  const buildConfig = command === 'build' ? {
    outDir: "dist/spa",
    sourcemap: false,
    minify: false,
    reportCompressedSize: false,
    target: 'ES2020',
  } : {
    outDir: "dist/spa",
    sourcemap: false,
  };

  return {
    server: {
      host: "::",
      port: 8080,
      middlewareMode: false,
    },
    build: buildConfig,
    plugins: [
      react(),
      expressPlugin(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./client"),
        "@shared": path.resolve(__dirname, "./shared"),
      },
    },
    appType: 'spa',
  };
});

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    async configureServer(server) {
      const app = await createServer();

      // Add Express app as middleware to Vite's dev server
      // Express will handle all API routes
      server.middlewares.use(app);

      // Trigger database migrations and seeding in dev mode (non-blocking)
      // (In production, this happens when app.listen() is called)
      setTimeout(async () => {
        try {
          const { migrate } = await import("./server/database/migrate.js");

          console.log("🔄 Initializing database and running migrations...");
          // Don't await - let it run in the background
          migrate().catch((error) => {
            console.error("❌ Database initialization failed:", error);
          });

          console.log("✅ Database initialization started in background");
          console.log("🌱 Core database initialization complete");
        } catch (error) {
          console.error("❌ Database initialization setup failed:", error);
        }
      }, 1000); // Wait 1 second to ensure Vite is fully ready

      // Vite's appType: 'spa' config will handle SPA fallback for non-API routes
    },
  };
}
