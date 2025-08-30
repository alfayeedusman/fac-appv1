import { pgTable, text, timestamp, boolean, integer, decimal, json, uuid, varchar, serial } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: varchar('email', { length: 255 }).notNull().unique(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(), // Should be hashed
  role: varchar('role', { length: 50 }).notNull().default('user'), // 'user' | 'admin' | 'superadmin' | 'cashier' | 'inventory_manager' | 'manager' | 'crew'
  contactNumber: varchar('contact_number', { length: 20 }),
  address: text('address'),
  carUnit: varchar('car_unit', { length: 255 }),
  carPlateNumber: varchar('car_plate_number', { length: 20 }),
  carType: varchar('car_type', { length: 100 }),
  branchLocation: varchar('branch_location', { length: 255 }).notNull(),
  profileImage: text('profile_image'),
  isActive: boolean('is_active').notNull().default(true),
  emailVerified: boolean('email_verified').notNull().default(false),
  loyaltyPoints: integer('loyalty_points').notNull().default(0),
  subscriptionStatus: varchar('subscription_status', { length: 20 }).notNull().default('free'), // 'free' | 'basic' | 'premium' | 'vip'
  subscriptionExpiry: timestamp('subscription_expiry'),
  // Crew specific fields
  crewSkills: json('crew_skills').$type<string[]>(),
  crewStatus: varchar('crew_status', { length: 20 }).default('available'), // 'available' | 'busy' | 'offline'
  currentAssignment: text('current_assignment'),
  crewRating: decimal('crew_rating', { precision: 3, scale: 2 }),
  crewExperience: integer('crew_experience'),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Bookings table
export const bookings = pgTable('bookings', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id'), // null for guest bookings
  guestInfo: json('guest_info').$type<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }>(),
  type: varchar('type', { length: 20 }).notNull(), // 'registered' | 'guest'
  confirmationCode: varchar('confirmation_code', { length: 50 }).notNull(),
  
  // Service Details
  category: varchar('category', { length: 50 }).notNull(), // 'carwash' | 'auto_detailing' | 'graphene_coating'
  service: varchar('service', { length: 255 }).notNull(),
  
  // Vehicle Details
  unitType: varchar('unit_type', { length: 20 }).notNull(), // 'car' | 'motorcycle'
  unitSize: varchar('unit_size', { length: 50 }),
  plateNumber: varchar('plate_number', { length: 20 }),
  vehicleModel: varchar('vehicle_model', { length: 255 }),
  
  // Schedule Details
  date: varchar('date', { length: 20 }).notNull(),
  timeSlot: varchar('time_slot', { length: 50 }).notNull(),
  branch: varchar('branch', { length: 255 }).notNull(),
  serviceLocation: text('service_location'),
  estimatedDuration: integer('estimated_duration'),
  
  // Pricing
  basePrice: decimal('base_price', { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).notNull().default('PHP'),
  
  // Payment Details
  paymentMethod: varchar('payment_method', { length: 50 }), // 'cash' | 'online' | 'gcash'
  paymentStatus: varchar('payment_status', { length: 50 }).notNull().default('pending'),
  receiptUrl: text('receipt_url'),
  
  // Status and Progress
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  
  // Additional Info
  notes: text('notes'),
  specialRequests: text('special_requests'),
  
  // Loyalty
  pointsEarned: integer('points_earned').default(0),
  loyaltyRewardsApplied: json('loyalty_rewards_applied').$type<string[]>(),
  
  // Assignment
  assignedCrew: json('assigned_crew').$type<string[]>(),
  crewNotes: text('crew_notes'),
  
  // Completion
  completedAt: timestamp('completed_at'),
  customerRating: decimal('customer_rating', { precision: 3, scale: 2 }),
  customerFeedback: text('customer_feedback'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// System Notifications table
export const systemNotifications = pgTable('system_notifications', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  type: varchar('type', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  priority: varchar('priority', { length: 20 }).notNull(), // 'low' | 'medium' | 'high' | 'urgent'
  targetRoles: json('target_roles').$type<string[]>().notNull(),
  targetUsers: json('target_users').$type<string[]>(),
  data: json('data'),
  scheduledFor: timestamp('scheduled_for'),
  sentAt: timestamp('sent_at'),
  readBy: json('read_by').$type<Array<{ userId: string; readAt: string }>>().notNull().default([]),
  actions: json('actions').$type<Array<{
    label: string;
    action: string;
    variant?: 'default' | 'destructive' | 'secondary';
  }>>(),
  playSound: boolean('play_sound').default(false),
  soundType: varchar('sound_type', { length: 50 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Admin Settings table
export const adminSettings = pgTable('admin_settings', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  key: varchar('key', { length: 255 }).notNull().unique(),
  value: json('value').notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }), // 'booking' | 'notification' | 'general' | 'pricing'
  isPublic: boolean('is_public').default(false), // If setting can be accessed by non-admin users
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Ads table
export const ads = pgTable('ads', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  imageUrl: text('image_url'),
  duration: varchar('duration', { length: 20 }).notNull(), // 'weekly' | 'monthly' | 'yearly'
  isActive: boolean('is_active').notNull().default(true),
  targetPages: json('target_pages').$type<string[]>().notNull(), // ["welcome", "dashboard"]
  adminEmail: varchar('admin_email', { length: 255 }).notNull(),
  impressions: integer('impressions').default(0),
  clicks: integer('clicks').default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Ad Dismissals table
export const adDismissals = pgTable('ad_dismissals', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  adId: text('ad_id').notNull(),
  userEmail: varchar('user_email', { length: 255 }).notNull(),
  dismissedAt: timestamp('dismissed_at').notNull().defaultNow(),
});

// Booking Status History table
export const bookingStatusHistory = pgTable('booking_status_history', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  bookingId: text('booking_id').notNull(),
  fromStatus: varchar('from_status', { length: 50 }),
  toStatus: varchar('to_status', { length: 50 }).notNull(),
  notes: text('notes'),
  changedBy: text('changed_by'), // User ID who made the change
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// User Sessions table (for better auth management)
export const userSessions = pgTable('user_sessions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull(),
  sessionToken: text('session_token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Inventory Items table (for admin inventory management)
export const inventoryItems = pgTable('inventory_items', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  description: text('description'),
  currentStock: integer('current_stock').notNull().default(0),
  minStockLevel: integer('min_stock_level').notNull().default(10),
  maxStockLevel: integer('max_stock_level').notNull().default(1000),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }),
  supplier: varchar('supplier', { length: 255 }),
  barcode: varchar('barcode', { length: 100 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Stock Movements table (for tracking inventory changes)
export const stockMovements = pgTable('stock_movements', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  itemId: text('item_id').notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'in' | 'out' | 'adjustment'
  quantity: integer('quantity').notNull(),
  reason: varchar('reason', { length: 255 }),
  reference: varchar('reference', { length: 255 }), // Could be booking ID, purchase order, etc.
  performedBy: text('performed_by'), // User ID
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
