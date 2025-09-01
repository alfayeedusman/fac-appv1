import { Router, RequestHandler } from "express";
import { neonDbService } from "../services/neonDatabaseService.js";

const router = Router();

// Mock Firebase auth middleware
const mockAuth: RequestHandler = (req, res, next) => {
  // In production, this would verify Firebase tokens
  req.user = { uid: "user123", email: "john@example.com" };
  next();
};

// Health check for new system
router.get("/health", async (req, res) => {
  try {
    const stats = await neonDbService.getStats();
    res.json({
      status: "healthy",
      system: "neon-database",
      timestamp: new Date().toISOString(),
      services: {
        neon: "connected",
        firebase: "mock-connected",
        stats
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      system: "neon-database",
      timestamp: new Date().toISOString(),
      error: "Database connection failed"
    });
  }
});

// User routes
router.get("/users", async (req, res) => {
  console.log('🔍 GET /api/users endpoint called');
  try {
    console.log('📋 Fetching users from database...');
    const users = await neonDbService.getAllUsers();
    console.log('✅ Users retrieved:', users);
    res.json({ success: true, users });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ success: false, error: "Failed to get users" });
  }
});

router.get("/user/profile", mockAuth, async (req, res) => {
  try {
    const profile = await neonDbService.getUserById(req.user.uid);
    if (!profile) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: "Failed to get profile" });
  }
});

router.get("/user/analytics", mockAuth, async (req, res) => {
  try {
    const bookings = await neonDbService.getBookingsByUserId(req.user.uid);
    const analytics = {
      totalBookings: bookings.length,
      pendingBookings: bookings.filter(b => b.status === 'pending').length,
      completedBookings: bookings.filter(b => b.status === 'completed').length,
      recentBookings: bookings.slice(0, 5)
    };
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: "Failed to get analytics" });
  }
});

// Services routes - mock data for now
router.get("/services", async (req, res) => {
  try {
    // Mock services data since we don't have a services table yet
    const services = [
      { id: "1", name: "Basic Wash", price: 15, duration: 30 },
      { id: "2", name: "Premium Wash", price: 25, duration: 45 },
      { id: "3", name: "Full Detail", price: 50, duration: 90 }
    ];
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: "Failed to get services" });
  }
});

// Branches routes - mock data for now
router.get("/branches", async (req, res) => {
  try {
    // Mock branches data since we don't have a branches table yet
    const branches = [
      { id: "1", name: "Downtown Branch", address: "123 Main St", phone: "+1234567890" },
      { id: "2", name: "Mall Branch", address: "456 Mall Ave", phone: "+1234567891" },
      { id: "3", name: "Airport Branch", address: "789 Airport Rd", phone: "+1234567892" }
    ];
    res.json(branches);
  } catch (error) {
    res.status(500).json({ error: "Failed to get branches" });
  }
});

// Bookings routes
router.get("/bookings", mockAuth, async (req, res) => {
  try {
    const bookings = await neonDbService.getBookingsByUserId(req.user.uid);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Failed to get bookings" });
  }
});

router.post("/bookings", mockAuth, async (req, res) => {
  try {
    const booking = await neonDbService.createBooking({
      userId: req.user.uid,
      ...req.body,
    });
    res.status(201).json({ booking_id: booking.id, success: true, booking });
  } catch (error) {
    res.status(500).json({ error: "Failed to create booking" });
  }
});

// QR routes - mock implementation
router.post("/qr/checkin", mockAuth, async (req, res) => {
  try {
    const { branch_id } = req.body;
    // Mock check-in logic - in real app this would update a check-in table
    res.json({ success: true, message: "Checked in successfully!", branch_id });
  } catch (error) {
    res.status(500).json({ error: "Failed to check in" });
  }
});

export default router;
