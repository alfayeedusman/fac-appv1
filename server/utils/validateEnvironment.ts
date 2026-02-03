// Validate critical environment variables on startup
export function validateEnvironment() {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for database URL
  const databaseUrl =
    process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

  if (!databaseUrl) {
    errors.push(
      "❌ CRITICAL: Missing database URL configuration. Please set either NEON_DATABASE_URL or DATABASE_URL environment variable.",
    );
  } else {
    // Validate database URL format
    if (!databaseUrl.startsWith("postgresql://")) {
      errors.push(
        "❌ Invalid database URL format. Must start with postgresql://",
      );
    }

    // Check for SSL configuration
    if (!databaseUrl.includes("sslmode=require")) {
      warnings.push(
        "⚠️ WARNING: Database URL does not include sslmode=require. This is recommended for production.",
      );
    }

    // Check for connection pooler
    if (
      !databaseUrl.includes("-pooler") &&
      databaseUrl.includes("neon.tech")
    ) {
      warnings.push(
        "⚠️ WARNING: Not using Neon connection pooler (-pooler). Consider adding -pooler to hostname for better connection management.",
      );
      warnings.push(
        "   Recommended format: postgresql://user:pass@host-pooler.neon.tech/db?sslmode=require",
      );
    }
  }

  // Log database configuration info
  if (databaseUrl) {
    const maskedUrl = databaseUrl.replace(
      /postgresql:\/\/([^:]+):([^@]+)@/,
      "postgresql://***:***@",
    );
    console.log("✅ Database URL configured:", maskedUrl);
  }

  // Log errors
  if (errors.length > 0) {
    console.error("\n" + "=".repeat(60));
    console.error("CONFIGURATION ERRORS:");
    errors.forEach((err) => console.error(err));
    console.error("=".repeat(60) + "\n");

    if (process.env.NODE_ENV === "production") {
      console.error("❌ FATAL: Cannot start in production with configuration errors");
      process.exit(1);
    }
  }

  // Log warnings
  if (warnings.length > 0) {
    console.warn("\n" + "=".repeat(60));
    console.warn("CONFIGURATION WARNINGS:");
    warnings.forEach((warn) => console.warn(warn));
    console.warn("=".repeat(60) + "\n");
  }

  // Log database configuration details
  console.log("📊 Database Configuration Details:");
  console.log("   Node Environment:", process.env.NODE_ENV || "development");
  console.log(
    "   Neon Connection:",
    databaseUrl ? "✅ Configured" : "❌ Not configured",
  );

  if (databaseUrl && databaseUrl.includes("neon.tech")) {
    const hostname = databaseUrl.split("@")[1]?.split("/")[0];
    console.log("   Hostname:", hostname);
    console.log(
      "   Connection Pooling:",
      hostname?.includes("-pooler") ? "✅ Enabled" : "❌ Not enabled",
    );
    console.log(
      "   SSL:",
      databaseUrl.includes("sslmode=require") ? "✅ Required" : "⚠️ Not required",
    );
  }

  return errors.length === 0;
}
