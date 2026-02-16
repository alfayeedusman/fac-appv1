import { defineConfig, Plugin, PluginOption } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server/index";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    middlewareMode: false,
  },
  optimizeDeps: {
    exclude: ['node_modules']
  },
  build: {
    outDir: "dist/spa",
    sourcemap: false,
    minify: false,
    reportCompressedSize: false,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Aggressive chunking to reduce memory during build
          if (id.includes('node_modules/react')) return 'react-core';
          if (id.includes('node_modules/@radix-ui')) return 'radix-ui';
          if (id.includes('node_modules')) return 'vendor-' + id.split('node_modules/')[1].split('/')[0];
        },
        chunkFileNames: 'chunks/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      },
      onwarn(warning, warn) {
        // Suppress warnings about large chunks and circular deps during build
        if (warning.code === 'CIRCULAR_DEPENDENCY') return;
        if (warning.code === 'EVAL') return;
        if (warning.code === 'THIS_IS_UNDEFINED') return;
        warn(warning);
      }
    }
  },
  plugins: [
    react(),
    process.env.NODE_ENV !== 'production' && expressPlugin(),
  ].filter(Boolean) as PluginOption[],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  appType: 'spa',
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
