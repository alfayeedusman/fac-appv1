import serverless from "serverless-http";

// Global variables to track initialization state
let cachedHandler: any = null;
let initError: Error | null = null;
let initAttempted = false;

/**
 * Initialize the Express server and wrap with serverless-http
 * This is called on the first request to ensure DB is available
 */
async function initializeHandler() {
  if (cachedHandler) return cachedHandler; // Already initialized
  if (initAttempted && initError) throw initError; // Failed before

  if (!initAttempted) {
    initAttempted = true;
    try {
      console.log("[Netlify Function] Initializing server...");

      // Import and create Express app
      const { createServer } = await import("../../server/index.ts");
      const app = createServer();

      // Wrap with serverless-http
      cachedHandler = serverless(app);
      console.log("[Netlify Function] ✅ Server initialized successfully");
      return cachedHandler;
    } catch (error) {
      initError = error instanceof Error ? error : new Error(String(error));
      console.error(
        "[Netlify Function] ❌ Initialization failed:",
        initError.message,
      );
      throw initError;
    }
  }

  return handler;
}

/**
 * Netlify handler function - called for every API request
 */
export async function handler(event: any, context: any) {
  try {
    // Initialize on first request
    const serverHandler = await initializeHandler();

    // Route request through Express
    return serverHandler(event, context);
  } catch (error) {
    console.error("[Netlify Function] Fatal error:", error);

    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : "";

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
      body: JSON.stringify({
        success: false,
        error: "Server initialization failed",
        message: errorMsg,
        debug: process.env.NODE_ENV === "development" ? errorStack : undefined,
        timestamp: new Date().toISOString(),
        availableEndpoints: [
          "POST /api/neon/auth/login",
          "POST /api/neon/auth/register",
          "GET /api/neon/test",
          "GET /api/neon/diagnose",
          "POST /api/neon/init",
        ],
      }),
    };
  }
}
