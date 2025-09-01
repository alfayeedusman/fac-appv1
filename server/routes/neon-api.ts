import { RequestHandler } from 'express';
import { neonDbService } from '../services/neonDatabaseService';
import { initializeDatabase, testConnection } from '../database/connection';
import { migrate } from '../database/migrate';

// Simple in-memory guards to avoid repeated heavy migrations per server process
let __NEON_DB_INITIALIZED__ = false;
let __NEON_DB_INITIALIZING__ = false;

// Initialize database connection
export const initializeNeonDB: RequestHandler = async (req, res) => {
  try {
    if (__NEON_DB_INITIALIZED__) {
      return res.json({ success: true, message: 'Neon database already initialized', timestamp: new Date().toISOString() });
    }
    if (__NEON_DB_INITIALIZING__) {
      return res.json({ success: true, message: 'Initialization in progress', timestamp: new Date().toISOString() });
    }

    __NEON_DB_INITIALIZING__ = true;
    console.log('🔄 Initializing Neon database...');

    const db = initializeDatabase();
    if (!db) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to initialize database connection. Check NEON_DATABASE_URL environment variable.' 
      });
    }

    // Test connection
    const isConnected = await testConnection();
    if (!isConnected) {
      return res.status(500).json({ 
        success: false, 
        error: 'Database connection test failed' 
      });
    }

    // Run migrations (idempotent)
    await migrate();

    __NEON_DB_INITIALIZED__ = true;
    res.json({
      success: true,
      message: 'Neon database initialized and migrated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  } finally {
    __NEON_DB_INITIALIZING__ = false;
  }
};

// Test database connection
export const testNeonConnection: RequestHandler = async (req, res) => {
  try {
    console.log('🔍 Testing database connection...');

    // Check if database URL is configured
    const databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.log('❌ No database URL configured');
      return res.json({
        success: false,
        connected: false,
        error: 'No database URL configured. Please set NEON_DATABASE_URL environment variable.',
        stats: null,
        timestamp: new Date().toISOString()
      });
    }

    console.log('✅ Database URL found, testing connection...');
    const isConnected = await testConnection();
    console.log('🔗 Connection test result:', isConnected);

    let stats = null;
    if (isConnected) {
      try {
        stats = await neonDbService.getStats();
        console.log('📊 Stats retrieved:', stats);
      } catch (statsError) {
        console.warn('⚠️ Failed to get stats:', statsError);
      }
    }

    res.json({
      success: isConnected,
      connected: isConnected,
      stats: stats || null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Database test error:', error);
    res.json({
      success: false,
      connected: false,
      error: error instanceof Error ? error.message : 'Connection test failed',
      stats: null,
      timestamp: new Date().toISOString()
    });
  }
};

// User authentication endpoints
export const loginUser: RequestHandler = async (req, res) => {
  // Ensure JSON response headers
  res.setHeader('Content-Type', 'application/json');
  try {
    const { email, password } = req.body;
    console.log('🔐 Login attempt received', {
      email,
      hasPassword: typeof password === 'string' && password.length > 0,
      contentType: req.headers['content-type'],
      time: new Date().toISOString(),
    });
    
    if (!email || !password) {
      console.warn('🔐 Login failed: missing email or password');
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const user = await neonDbService.getUserByEmail(email);
    if (!user) {
      console.warn('🔐 Login failed: user not found', { email });
      const response = { success: false, error: 'Invalid credentials' };
      console.log('📤 Sending user not found response:', JSON.stringify(response));
      return res.status(401).json(response);
    }

    const isValidPassword = await neonDbService.verifyPassword(email, password);
    if (!isValidPassword) {
      console.warn('🔐 Login failed: invalid password', { email });
      const response = { success: false, error: 'Invalid credentials' };
      console.log('📤 Sending invalid password response:', JSON.stringify(response));
      return res.status(401).json(response);
    }

    if (!user.isActive) {
      console.warn('🔐 Login failed: account disabled', { email });
      return res.status(403).json({
        success: false,
        error: 'Account is disabled'
      });
    }

    // Update last login
    await neonDbService.updateUser(user.id, { lastLoginAt: new Date() });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    console.log('✅ Login successful', { email, role: userWithoutPassword.role, id: userWithoutPassword.id });
    const response = {
      success: true,
      user: userWithoutPassword,
      message: 'Login successful'
    };
    console.log('📤 Sending login success response:', JSON.stringify(response).substring(0, 200));
    return res.json(response);
  } catch (error: any) {
    console.error('❌ Login error:', error?.message || error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Internal server error'
    });
  }
};

export const registerUser: RequestHandler = async (req, res) => {
  try {
    const userData = req.body;
    
    // Check if user already exists
    const existingUser = await neonDbService.getUserByEmail(userData.email);
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        error: 'User with this email already exists' 
      });
    }

    const user = await neonDbService.createUser(userData);
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(201).json({ 
      success: true, 
      user: userWithoutPassword,
      message: 'User registered successfully' 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Registration failed' 
    });
  }
};

// Booking endpoints
export const createBooking: RequestHandler = async (req, res) => {
  try {
    const booking = await neonDbService.createBooking(req.body);
    
    // Create notification for new booking
    await neonDbService.createSystemNotification({
      type: 'new_booking',
      title: '🎯 New Booking Received',
      message: `New booking created: ${booking.service} on ${booking.date}`,
      priority: 'high',
      targetRoles: ['admin', 'superadmin', 'manager'],
      data: { bookingId: booking.id },
      playSound: true,
      soundType: 'new_booking'
    });
    
    res.status(201).json({ 
      success: true, 
      booking,
      message: 'Booking created successfully' 
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create booking' 
    });
  }
};

export const getBookings: RequestHandler = async (req, res) => {
  try {
    const { userId, status } = req.query;
    
    let bookings;
    if (userId) {
      bookings = await neonDbService.getBookingsByUserId(userId as string);
    } else if (status) {
      bookings = await neonDbService.getBookingsByStatus(status as string);
    } else {
      bookings = await neonDbService.getAllBookings();
    }
    
    res.json({ 
      success: true, 
      bookings 
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch bookings' 
    });
  }
};

export const updateBooking: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const booking = await neonDbService.updateBooking(id, updates);
    
    res.json({ 
      success: true, 
      booking,
      message: 'Booking updated successfully' 
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update booking' 
    });
  }
};

// Notification endpoints
export const getNotifications: RequestHandler = async (req, res) => {
  try {
    const { userId, userRole } = req.query;
    
    if (!userId || !userRole) {
      return res.status(400).json({ 
        success: false, 
        error: 'userId and userRole are required' 
      });
    }
    
    const notifications = await neonDbService.getNotificationsForUser(
      userId as string, 
      userRole as string
    );
    
    res.json({ 
      success: true, 
      notifications 
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch notifications' 
    });
  }
};

export const markNotificationRead: RequestHandler = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { userId } = req.body;
    
    await neonDbService.markNotificationAsRead(notificationId, userId);
    
    res.json({ 
      success: true, 
      message: 'Notification marked as read' 
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to mark notification as read' 
    });
  }
};

// Admin settings endpoints
export const getSettings: RequestHandler = async (req, res) => {
  try {
    const settings = await neonDbService.getAllSettings();
    res.json({ 
      success: true, 
      settings 
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch settings' 
    });
  }
};

export const updateSetting: RequestHandler = async (req, res) => {
  try {
    const { key, value, description, category } = req.body;
    
    const setting = await neonDbService.setSetting(key, value, description, category);
    
    res.json({ 
      success: true, 
      setting,
      message: 'Setting updated successfully' 
    });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update setting' 
    });
  }
};

// Ads endpoints
export const getAds: RequestHandler = async (req, res) => {
  try {
    const ads = await neonDbService.getActiveAds();
    res.json({ 
      success: true, 
      ads 
    });
  } catch (error) {
    console.error('Get ads error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch ads' 
    });
  }
};

export const createAd: RequestHandler = async (req, res) => {
  try {
    const ad = await neonDbService.createAd(req.body);
    
    res.status(201).json({ 
      success: true, 
      ad,
      message: 'Ad created successfully' 
    });
  } catch (error) {
    console.error('Create ad error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create ad' 
    });
  }
};

export const dismissAd: RequestHandler = async (req, res) => {
  try {
    const { adId } = req.params;
    const { userEmail } = req.body;
    
    await neonDbService.dismissAd(adId, userEmail);
    
    res.json({ 
      success: true, 
      message: 'Ad dismissed successfully' 
    });
  } catch (error) {
    console.error('Dismiss ad error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to dismiss ad' 
    });
  }
};

// Database stats endpoint
export const getDatabaseStats: RequestHandler = async (req, res) => {
  try {
    const stats = await neonDbService.getStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch database stats'
    });
  }
};

// ============= NEW FEATURES API ENDPOINTS =============

// Branches endpoints
export const getBranches: RequestHandler = async (req, res) => {
  try {
    const branches = await neonDbService.getBranches();
    res.json({
      success: true,
      branches: branches || []
    });
  } catch (error) {
    console.error('Get branches error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch branches'
    });
  }
};

// Service packages endpoints
export const getServicePackages: RequestHandler = async (req, res) => {
  try {
    const packages = await neonDbService.getServicePackages();
    res.json({
      success: true,
      packages: packages || []
    });
  } catch (error) {
    console.error('Get service packages error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch service packages'
    });
  }
};

// Gamification levels endpoints
export const getCustomerLevels: RequestHandler = async (req, res) => {
  try {
    const levels = await neonDbService.getCustomerLevels();
    res.json({
      success: true,
      levels: levels || []
    });
  } catch (error) {
    console.error('Get customer levels error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customer levels'
    });
  }
};

// POS categories endpoints
export const getPOSCategories: RequestHandler = async (req, res) => {
  try {
    const categories = await neonDbService.getPOSCategories();
    res.json({
      success: true,
      categories: categories || []
    });
  } catch (error) {
    console.error('Get POS categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch POS categories'
    });
  }
};
