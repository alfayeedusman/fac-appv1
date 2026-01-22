import serverless from "serverless-http";
import { createServer } from "../../dist/server/production.mjs";

// Create the Express app once and wrap it with serverless-http for Netlify
const app = createServer();
export const handler = serverless(app);
