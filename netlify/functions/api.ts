import serverless from "serverless-http";
import { createServer } from "../../server/index";

// Create the Express app once
const app = createServer();

// Wrap it with serverless-http for Netlify
export const handler = serverless(app);
