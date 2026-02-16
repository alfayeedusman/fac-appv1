import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

const isBuild = process.argv.includes('build');

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    middlewareMode: false,
  },
  build: {
    outDir: "dist/spa",
    sourcemap: false,
    minify: false,
    reportCompressedSize: false,
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Aggressively split dependencies to smaller chunks
          if (id.includes('node_modules')) {
            const parts = id.split('node_modules/')[1].split('/');
            const pkg = parts[0];
            // Each major dependency gets its own chunk
            return `vendor-${pkg}`;
          }
          // Client code split by folder
          if (id.includes('client/pages')) {
            return 'pages-bundle';
          }
          if (id.includes('client/components')) {
            return 'components-bundle';
          }
          return undefined;
        },
      },
      treeshake: {
        moduleSideEffects: false,
      },
    },
  },
  plugins: [
    !isBuild && react(),
    expressPlugin(),
  ].filter(Boolean),
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
    apply: "serve",
    async configureServer(server) {
      // Lazy load server only when actually needed
      const { createServer } = await import("./server/index.js");
      const app = await createServer();
      server.middlewares.use(app);

      setTimeout(async () => {
        try {
          const { migrate } = await import("./server/database/migrate.js");

          console.log("🔄 Initializing database and running migrations...");
          migrate().catch((error) => {
            console.error("❌ Database initialization failed:", error);
          });

          console.log("✅ Database initialization started in background");
          console.log("🌱 Core database initialization complete");
        } catch (error) {
          console.error("❌ Database initialization setup failed:", error);
        }
      }, 1000);
    },
  };
}
