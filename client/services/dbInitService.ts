/**
 * Client-side database initialization service
 * Ensures database is properly initialized before any operations
 */

let initializationPromise: Promise<boolean> | null = null;
let isInitialized = false;

/**
 * Initialize the database by calling the backend initialization endpoint
 * This ensures all tables are created and migrations are run
 */
export async function initializeDatabase(): Promise<boolean> {
  // Return cached result if already initialized
  if (isInitialized) {
    console.log("✅ Database already initialized (cached)");
    return true;
  }

  // Return existing promise if initialization is in progress
  if (initializationPromise) {
    console.log("⏳ Database initialization in progress, waiting...");
    return initializationPromise;
  }

  // Create new initialization promise
  initializationPromise = performInitialization();
  return initializationPromise;
}

/**
 * Perform the actual initialization
 */
async function performInitialization(): Promise<boolean> {
  try {
    console.log("🔄 Initializing database...");

    const response = await fetch("/api/neon/init", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error ||
          `Database initialization failed with status ${response.status}`,
      );
    }

    const data = await response.json();

    if (data.success) {
      console.log("✅ Database initialized successfully:", data.message);
      isInitialized = true;
      return true;
    } else {
      throw new Error(
        data.error || "Database initialization returned success:false",
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Database initialization failed:", errorMessage);

    // Reset promise so next attempt can try again
    initializationPromise = null;

    // Don't throw - let the app attempt to continue
    // The middleware will catch actual connection errors
    return false;
  }
}

/**
 * Ensure database is initialized before performing critical operations
 * Throws error if initialization fails (for login, booking, etc)
 */
export async function ensureInitialized(): Promise<void> {
  const initialized = await initializeDatabase();

  if (!initialized) {
    throw new Error(
      "Database service is not available. Please check your internet connection and try again.",
    );
  }
}

/**
 * Reset initialization state (useful for testing)
 */
export function resetInitializationState() {
  isInitialized = false;
  initializationPromise = null;
  console.log("🔄 Reset database initialization state");
}

/**
 * Check if database is initialized
 */
export function isDatabaseInitialized(): boolean {
  return isInitialized;
}

/**
 * Test database connection
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const response = await fetch("/api/neon/test", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.success && data.connected;
  } catch (error) {
    console.error("Database connection test failed:", error);
    return false;
  }
}

/**
 * Get database diagnostic information
 */
export async function getDatabaseDiagnostics() {
  try {
    const response = await fetch("/api/neon/diagnose", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get diagnostics");
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to get database diagnostics:", error);
    return null;
  }
}
