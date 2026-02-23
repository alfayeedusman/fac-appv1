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
    chunkSizeWarningLimit: 1000000,
    target: 'esnext',
    cssCodeSplit: true,
    lib: undefined,
    rollupOptions: {
      output: {
        format: 'es',
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/chunk-[name].[hash].js',
        assetFileNames: 'assets/[name].[hash][extname]',
        manualChunks: (id, { getModuleInfo }) => {
          // Split core vendor libraries
          if (id.includes('node_modules/react/')) return 'vendor-react';
          if (id.includes('node_modules/react-dom/')) return 'vendor-react-dom';
          if (id.includes('node_modules/@tanstack/react-query/')) return 'vendor-react-query';
          if (id.includes('node_modules/recharts/')) return 'vendor-charts';
          if (id.includes('node_modules/@radix-ui/')) return 'vendor-radix';
          if (id.includes('node_modules/lucide-react/')) return 'vendor-icons';
          if (id.includes('node_modules/date-fns/')) return 'vendor-date-fns';
          if (id.includes('node_modules/zod/')) return 'vendor-zod';
          if (id.includes('node_modules/next-themes/')) return 'vendor-themes';
          if (id.includes('node_modules/sonner/')) return 'vendor-sonner';
          if (id.includes('node_modules/@supabase/')) return 'vendor-supabase';
          if (id.includes('node_modules/postgres/')) return 'vendor-postgres';
          if (id.includes('node_modules/drizzle-orm/')) return 'vendor-drizzle';
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
