import serverless from "serverless-http";

let handler: any;

try {
  // Dynamically import to catch errors
  const { createServer } = await import("../../server/index.ts");
  const app = createServer();
  handler = serverless(app);
  console.log("✅ Netlify function initialized successfully");
} catch (error) {
  console.error("❌ Failed to initialize Netlify function:", error);

  // Fallback handler that returns error info
  handler = async (event: any, context: any) => {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Server initialization failed",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  };
}

export { handler };
