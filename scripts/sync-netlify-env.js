#!/usr/bin/env node
/**
 * Netlify Environment Variable Sync Script
 *
 * Usage: node scripts/sync-netlify-env.js [env-file-path]
 * Example: node scripts/sync-netlify-env.js .env.production.local
 *
 * This script reads a local .env file and syncs all variables to Netlify.
 * Requires: netlify-cli to be installed and authenticated
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Determine which env file to use
const envFile = process.argv[2] || ".env.production.local";

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkNetlifyCLI() {
  try {
    execSync("netlify --version", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

function checkNetlifyAuthentication() {
  try {
    execSync("netlify status", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    log(colors.red, `\n❌ Error: ${filePath} not found`);
    log(colors.yellow, "\nTo fix this:");
    log(colors.cyan, `  1. Copy the template:    cp .env.example ${filePath}`);
    log(colors.cyan, `  2. Fill in your values:  nano ${filePath}`);
    log(colors.cyan, `  3. Run this script again\n`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  const variables = {};

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip comments, empty lines, and multi-line values
    if (!trimmed || trimmed.startsWith("#")) continue;

    const [key, ...valueParts] = trimmed.split("=");
    const rawValue = valueParts.join("=").trim();

    if (!key || !rawValue) continue;

    // Remove surrounding quotes if present
    const value =
      rawValue.startsWith('"') && rawValue.endsWith('"')
        ? rawValue.slice(1, -1)
        : rawValue.startsWith("'") && rawValue.endsWith("'")
          ? rawValue.slice(1, -1)
          : rawValue;

    // Handle escaped newlines in keys
    variables[key.trim()] = value.replace(/\\n/g, "\n");
  }

  return variables;
}

function maskValue(value) {
  if (!value) return "(empty)";
  if (value.length <= 10) return value;
  return value.substring(0, 10) + "...";
}

async function syncVariables(variables) {
  const keys = Object.keys(variables);
  log(
    colors.blue,
    `\n📝 Found ${keys.length} variables in ${path.basename(envFile)}\n`,
  );

  // Preview what will be set
  log(colors.cyan, "Variables to sync:");
  keys.forEach((key) => {
    const value = variables[key];
    const masked = maskValue(value);
    const isSensitive = [
      "TOKEN",
      "KEY",
      "SECRET",
      "PASSWORD",
      "URL",
      "ID",
    ].some((keyword) => key.toUpperCase().includes(keyword));
    const badge = isSensitive ? "🔐" : "  ";
    console.log(`  ${badge} ${key.padEnd(35)} = ${masked}`);
  });

  // Confirm before syncing
  if (process.argv.includes("--skip-confirm")) {
    log(
      colors.yellow,
      "\n⏭️  Skipping confirmation (--skip-confirm flag used)\n",
    );
  } else {
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    await new Promise((resolve) => {
      readline.question(
        `\n${colors.yellow}Continue syncing to Netlify? (yes/no): ${colors.reset}`,
        (answer) => {
          readline.close();
          if (answer.toLowerCase() !== "yes") {
            log(colors.yellow, "❌ Cancelled\n");
            process.exit(0);
          }
          resolve();
        },
      );
    });
  }

  log(colors.blue, `\n🚀 Syncing ${keys.length} variables to Netlify...\n`);

  let successCount = 0;
  let failedVars = [];

  for (const [key, value] of Object.entries(variables)) {
    try {
      // Escape special characters for shell
      const escapedValue = value.replace(/"/g, '\\"').replace(/\$/g, "\\$");
      execSync(`netlify env:set ${key} "${escapedValue}"`, {
        stdio: "pipe",
        shell: "/bin/bash",
      });
      log(colors.green, `  ✅ ${key}`);
      successCount++;
    } catch (error) {
      log(colors.red, `  ❌ ${key} - ${error.message.split("\n")[0]}`);
      failedVars.push(key);
    }
  }

  // Summary
  log(colors.blue, "\n" + "=".repeat(60));
  log(
    colors.green,
    `✅ Successfully synced: ${successCount}/${keys.length} variables`,
  );

  if (failedVars.length > 0) {
    log(colors.red, `❌ Failed to sync: ${failedVars.length} variables`);
    log(colors.yellow, `\nFailed variables: ${failedVars.join(", ")}`);
    log(colors.yellow, "\nTroubleshooting:");
    log(
      colors.cyan,
      "  1. Check if netlify-cli is installed: netlify --version",
    );
    log(colors.cyan, "  2. Check if authenticated: netlify status");
    log(colors.cyan, "  3. Check if site is linked: netlify link");
    log(colors.cyan, "  4. Check variable values for special characters");
  }

  log(colors.blue, "=".repeat(60) + "\n");

  // Next steps
  log(colors.cyan, "📢 Next steps:");
  log(colors.cyan, "  1. Verify variables on Netlify dashboard:");
  log(
    colors.cyan,
    "     https://app.netlify.com → Site settings → Build & deploy → Environment",
  );
  log(colors.cyan, "  2. Commit and push your code:");
  log(
    colors.cyan,
    '     git add . && git commit -m "Add env vars sync script"',
  );
  log(colors.cyan, "     git push origin main");
  log(
    colors.cyan,
    "  3. Netlify will automatically deploy with these variables\n",
  );

  if (failedVars.length > 0) {
    process.exit(1);
  }
}

async function main() {
  // Check prerequisites
  if (!checkNetlifyCLI()) {
    log(colors.red, "\n❌ Netlify CLI not found\n");
    log(colors.yellow, "Install it first:");
    log(colors.cyan, "  npm install -g netlify-cli");
    log(colors.cyan, "  # or: brew install netlify-cli\n");
    process.exit(1);
  }

  if (!checkNetlifyAuthentication()) {
    log(colors.red, "\n❌ Not authenticated with Netlify\n");
    log(colors.yellow, "Authenticate first:");
    log(colors.cyan, "  netlify login\n");
    process.exit(1);
  }

  // Check if site is linked
  try {
    execSync("netlify status", { stdio: "pipe" });
  } catch {
    log(colors.red, "\n❌ Netlify site not linked to this project\n");
    log(colors.yellow, "Link your site first:");
    log(colors.cyan, "  netlify link\n");
    process.exit(1);
  }

  // Parse and sync
  try {
    const variables = parseEnvFile(envFile);
    await syncVariables(variables);
  } catch (error) {
    log(colors.red, `\n❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

main().catch((error) => {
  log(colors.red, `\n❌ Unexpected error: ${error.message}\n`);
  process.exit(1);
});
