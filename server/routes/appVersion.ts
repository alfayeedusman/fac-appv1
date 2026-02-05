import express, { RequestHandler } from "express";

const router = express.Router();

// In-memory storage (replace with database in production)
let currentVersion = {
  version: "1.0.0",
  buildNumber: "1",
  releaseNotes: "Initial release",
  forceUpdate: false,
  downloadUrl: {
    ios: "https://apps.apple.com/app/your-app",
    android:
      "https://play.google.com/store/apps/details?id=your.app",
  },
  createdAt: new Date().toISOString(),
};

// GET /api/app-version - Get latest version
export const getLatestVersion: RequestHandler = (req, res) => {
  try {
    res.json({
      success: true,
      version: currentVersion,
    });
  } catch (error) {
    console.error("Error fetching version:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch version",
    });
  }
};

// POST /api/app-version - Update version (admin only)
export const updateVersion: RequestHandler = (req, res) => {
  try {
    const {
      version,
      buildNumber,
      releaseNotes,
      forceUpdate,
      downloadUrl,
    } = req.body;

    // Validate required fields
    if (!version || !buildNumber) {
      return res.status(400).json({
        success: false,
        error: "Version and buildNumber are required",
      });
    }

    currentVersion = {
      version,
      buildNumber,
      releaseNotes: releaseNotes || "",
      forceUpdate: forceUpdate || false,
      downloadUrl: downloadUrl || currentVersion.downloadUrl,
      createdAt: new Date().toISOString(),
    };

    console.log("✅ Version updated:", currentVersion);
    res.json({
      success: true,
      version: currentVersion,
    });
  } catch (error) {
    console.error("Error updating version:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update version",
    });
  }
};

router.get("/app-version", getLatestVersion);
router.post("/app-version", updateVersion);

export default router;
