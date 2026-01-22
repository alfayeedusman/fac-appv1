import serverless from "serverless-http";
import { createServer } from "../../server/index.ts";

// Create the Express app once
let handler: any;
let initError: Error | null = null;

try {
  const app = createServer();
  handler = serverless(app);
  console.log("✅ Netlify function initialized successfully");
} catch (error) {
  console.error("❌ Failed to initialize Netlify function:", error);
  initError = error instanceof Error ? error : new Error(String(error));

  // Fallback handler that returns error info
  handler = async (event: any) => {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Server initialization failed",
        message: initError?.message || "Unknown error",
        timestamp: new Date().toISOString(),
      }),
    };
  };
}

export { handler };
