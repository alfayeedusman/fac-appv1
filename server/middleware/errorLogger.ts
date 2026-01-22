import { RequestHandler, ErrorRequestHandler } from "express";

// Track error frequency to prevent log spam
const errorCounts = new Map<string, { count: number; lastTime: number }>();
const ERROR_SPAM_THRESHOLD = 10; // Log if error occurs more than 10 times
const ERROR_SPAM_WINDOW = 60000; // in 60 seconds

/**
 * Log HTTP request (optional, can be verbose)
 */
export const requestLogger: RequestHandler = (req, res, next) => {
  const startTime = Date.now();

  // Log response when finished
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const isError = res.statusCode >= 400;
    const logLevel = isError ? "⚠️" : "ℹ️";

    // Don't spam logs for health checks
    if (req.path === "/api/health" || req.path === "/api/neon/test") {
      return;
    }

    console.log(
      `${logLevel} [${new Date().toISOString()}] ${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`,
    );
  });

  next();
};

/**
 * Global error handler (catches all errors from async handlers)
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const errorKey = `${req.path}:${err.message}`;
  const now = Date.now();
  const existing = errorCounts.get(errorKey);

  // Track error frequency
  if (existing) {
    if (now - existing.lastTime > ERROR_SPAM_WINDOW) {
      // Reset counter if window passed
      errorCounts.set(errorKey, { count: 1, lastTime: now });
    } else {
      existing.count++;
      existing.lastTime = now;
    }
  } else {
    errorCounts.set(errorKey, { count: 1, lastTime: now });
  }

  const errorCount = errorCounts.get(errorKey)?.count || 1;
  const isSpam = errorCount > ERROR_SPAM_THRESHOLD;

  // Log error with appropriate level
  if (!isSpam) {
    console.error(
      `❌ [${new Date().toISOString()}] Error in ${req.method} ${req.path}:`,
      {
        name: err.name,
        message: err.message,
        statusCode: err.statusCode || 500,
        path: req.path,
        method: req.method,
        userAgent: req.get("user-agent")?.substring(0, 50),
      },
    );

    // Log stack trace only in development
    if (process.env.NODE_ENV !== "production") {
      console.error("Stack:", err.stack);
    }
  } else {
    // Spam warning instead
    console.warn(
      `⚠️ [${new Date().toISOString()}] Repeated error (${errorCount} times): ${err.message}`,
    );
  }

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && {
      debug: {
        name: err.name,
        stack: err.stack?.split("\n").slice(0, 5),
        originalError: err,
      },
    }),
    timestamp: new Date().toISOString(),
  });
};

/**
 * Async error wrapper - use this to wrap async route handlers
 * Usage: app.get('/route', asyncHandler(async (req, res) => { ... }))
 */
export function asyncHandler(
  fn: (req: any, res: any, next?: any) => Promise<any> | any,
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Log initialization events
 */
export function logInit(message: string, data?: any) {
  console.log(
    `🔄 [${new Date().toISOString()}] ${message}`,
    data ? JSON.stringify(data, null, 2) : "",
  );
}

/**
 * Log success events
 */
export function logSuccess(message: string, data?: any) {
  console.log(
    `✅ [${new Date().toISOString()}] ${message}`,
    data ? JSON.stringify(data, null, 2) : "",
  );
}

/**
 * Log warning events
 */
export function logWarning(message: string, data?: any) {
  console.warn(
    `⚠️ [${new Date().toISOString()}] ${message}`,
    data ? JSON.stringify(data, null, 2) : "",
  );
}

/**
 * Log error events
 */
export function logError(message: string, error: any, data?: any) {
  console.error(`❌ [${new Date().toISOString()}] ${message}`, {
    error: error instanceof Error ? error.message : error,
    ...(data && { data }),
    ...(process.env.NODE_ENV === "development" &&
      error instanceof Error && {
        stack: error.stack,
      }),
  });
}
