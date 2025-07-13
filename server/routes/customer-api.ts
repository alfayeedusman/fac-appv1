import { Router, RequestHandler } from "express";
import { MockMySQLService } from "../services/mock-mysql.js";

const router = Router();

// Mock Firebase auth middleware
const mockAuth: RequestHandler = (req, res, next) => {
  // In production, this would verify Firebase tokens
  req.user = { uid: "user123", email: "john@example.com" };
  next();
};

// Health check for new system
router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    system: "flutter-mysql-firebase",
    timestamp: new Date().toISOString(),
    services: {
      mysql: "mock-connected",
      firebase: "mock-connected",
      flutter: "ready",
    },
  });
});

// User routes
router.get("/user/profile", mockAuth, async (req, res) => {
  try {
    const profile = await MockMySQLService.getUserProfile(req.user.uid);
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: "Failed to get profile" });
  }
});

router.get("/user/analytics", mockAuth, async (req, res) => {
  try {
    const analytics = await MockMySQLService.getUserAnalytics(req.user.uid);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: "Failed to get analytics" });
  }
});

// Services routes
router.get("/services", async (req, res) => {
  try {
    const services = await MockMySQLService.getServices();
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: "Failed to get services" });
  }
});

// Branches routes
router.get("/branches", async (req, res) => {
  try {
    const branches = await MockMySQLService.getBranches();
    res.json(branches);
  } catch (error) {
    res.status(500).json({ error: "Failed to get branches" });
  }
});

// Bookings routes
router.get("/bookings", mockAuth, async (req, res) => {
  try {
    const bookings = await MockMySQLService.getUserBookings(req.user.uid);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Failed to get bookings" });
  }
});

router.post("/bookings", mockAuth, async (req, res) => {
  try {
    const bookingId = await MockMySQLService.createBooking({
      user_id: req.user.uid,
      ...req.body,
    });
    res.status(201).json({ booking_id: bookingId, success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to create booking" });
  }
});

// QR routes
router.post("/qr/checkin", mockAuth, async (req, res) => {
  try {
    const { branch_id } = req.body;
    const success = await MockMySQLService.checkIn(req.user.uid, branch_id);
    res.json({ success, message: "Checked in successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to check in" });
  }
});

export default router;
