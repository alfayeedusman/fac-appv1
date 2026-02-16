import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server/index";

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    middlewareMode: false,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@radix-ui/react-dialog',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      'lucide-react',
    ]
  },
  build: {
    outDir: "dist/spa",
    sourcemap: false,
    minify: false,
    reportCompressedSize: false,
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-core': ['react', 'react-dom', 'react-router-dom'],
          'radix': ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-tabs'],
          'icons': ['lucide-react'],
        },
        chunkFileNames: 'chunks/[name].js',
        entryFileNames: 'js/[name].js',
        assetFileNames: 'assets/[name][extname]'
      },
      onwarn(warning, warn) {
        if (warning.code === 'CIRCULAR_DEPENDENCY') return;
        if (warning.code === 'EVAL') return;
        if (warning.code === 'THIS_IS_UNDEFINED') return;
        warn(warning);
      }
    }
  },
  plugins: [
    react(),
    !isProduction && expressPlugin(),
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
