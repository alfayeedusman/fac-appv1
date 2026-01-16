import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "./index";
import * as express from "express";
import fs from "fs";

const app = createServer();
const port = process.env.PORT || 3000;

// In production, serve the built SPA files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, "../dist/spa");

// Check if dist/spa exists, if not try current directory structure
let spaCachePath = distPath;
if (!fs.existsSync(distPath)) {
  // Fallback: try dist/spa relative to process.cwd()
  const fallbackPath = path.join(process.cwd(), "dist/spa");
  if (fs.existsSync(fallbackPath)) {
    spaCachePath = fallbackPath;
    console.log(`✅ Using fallback SPA path: ${fallbackPath}`);
  } else {
    console.warn(`⚠️ SPA path not found. Tried: ${distPath}`);
    console.warn(`   Fallback path: ${fallbackPath}`);
    console.warn(`   Current working directory: ${process.cwd()}`);
  }
}

console.log(`📂 Serving SPA from: ${spaCachePath}`);

// Serve static files (CSS, JS, images, etc.)
app.use(express.static(spaCachePath));

// Handle React Router - serve index.html for all non-API routes
app.get("*", (req, res) => {
  // API routes should never reach here (they should be handled above)
  // If they do, return 404
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }

  const indexPath = path.join(spaCachePath, "index.html");
  if (!fs.existsSync(indexPath)) {
    console.warn(`⚠️ index.html not found at ${indexPath}`);
    // Still return HTML for SPA routing, but with a message
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Fusion Starter</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        <div id="root">
          <h1>Server is running but frontend assets are not available</h1>
          <p>API endpoints are available at: /api/*</p>
        </div>
        <script>
          // Try to fetch from alternative paths
          console.log('SPA not found at: ${indexPath}');
          console.log('Current working directory: ${process.cwd()}');
        </script>
      </body>
      </html>
    `);
  }
  res.sendFile(indexPath);
});

app.listen(port, () => {
  console.log(`🚀 Fusion Starter server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
