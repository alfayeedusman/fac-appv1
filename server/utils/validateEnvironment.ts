/**
 * Validate critical environment variables on application startup
 * Helps catch configuration issues early before they cause runtime errors
 */
export function validateEnvironment() {
  console.log("🔍 Validating environment configuration...");
  
  const issues: string[] = [];
  const warnings: string[] = [];
  
  // Check database configuration
  const hasDatabaseUrl = !!(process.env.NEON_DATABASE_URL || process.env.DATABASE_URL);
  
  if (!hasDatabaseUrl) {
    issues.push("Missing database configuration: NEON_DATABASE_URL or DATABASE_URL");
    console.error("❌ CRITICAL: No database URL configured!");
    console.error("   Please set either NEON_DATABASE_URL or DATABASE_URL");
    console.error("   Current DATABASE-related env vars:", 
      Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('NEON'))
    );
  } else {
    console.log("✅ Database URL configured");
    
    // Validate database URL format
    const dbUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || '';
    if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
      warnings.push("Database URL should start with postgresql:// or postgres://");
    }
    
    // Check if using pooler (recommended for serverless)
    if (!dbUrl.includes('-pooler.')) {
      warnings.push("Consider using Neon's connection pooler (add '-pooler' to hostname) for better performance");
    }
    
    // Check SSL mode
    if (!dbUrl.includes('sslmode=require') && !dbUrl.includes('ssl=true')) {
      warnings.push("SSL mode not explicitly set - consider adding ?sslmode=require to database URL");
    }
  }
  
  // Check optional but recommended environment variables
  const optionalVars = {
    'NODE_ENV': 'Application environment (development/production)',
    'VITE_API_BASE_URL': 'API base URL for frontend',
  };
  
  for (const [key, description] of Object.entries(optionalVars)) {
    if (!process.env[key]) {
      warnings.push(`${key} not set (${description})`);
    }
  }
  
  // Report findings
  if (issues.length > 0) {
    console.error("\n❌ CRITICAL ISSUES FOUND:");
    issues.forEach(issue => console.error(`   - ${issue}`));
    
    if (process.env.NODE_ENV === 'production') {
      console.error("\n🛑 Cannot start application with critical configuration issues in production");
      console.error("   Please fix the issues above and restart the application\n");
      process.exit(1);
    } else {
      console.warn("\n⚠️  Running in development mode with configuration issues");
      console.warn("   Application may not function correctly\n");
    }
  }
  
  if (warnings.length > 0) {
    console.warn("\n⚠️  CONFIGURATION WARNINGS:");
    warnings.forEach(warning => console.warn(`   - ${warning}`));
    console.warn("");
  }
  
  if (issues.length === 0 && warnings.length === 0) {
    console.log("✅ Environment configuration validated successfully\n");
  }
  
  return {
    valid: issues.length === 0,
    issues,
    warnings,
  };
}

/**
 * Get database connection info for debugging
 */
export function getDatabaseInfo() {
  const dbUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
  
  if (!dbUrl) {
    return {
      configured: false,
      message: "No database URL configured",
    };
  }
  
  try {
    const url = new URL(dbUrl);
    return {
      configured: true,
      host: url.hostname,
      database: url.pathname.slice(1),
      username: url.username,
      hasPassword: !!url.password,
      ssl: url.searchParams.get('sslmode') || url.searchParams.get('ssl') || 'not specified',
      isPooler: url.hostname.includes('-pooler'),
    };
  } catch (error) {
    return {
      configured: true,
      error: "Invalid database URL format",
      message: error instanceof Error ? error.message : String(error),
    };
  }
}
