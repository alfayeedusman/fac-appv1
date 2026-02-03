import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  json,
  uuid,
  varchar,
  serial,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

// Crew Groups/Teams table
export const crewGroups = pgTable("crew_groups", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  leaderId: text("leader_id"),
  colorCode: varchar("color_code", { length: 7 }).default("#3B82F6"),
  maxMembers: integer("max_members").default(10),
  status: varchar("status", { length: 20 }).default("active"), // 'active' | 'inactive' | 'disbanded'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Crew Members table
export const crewMembers = pgTable("crew_members", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id").notNull(),
  crewGroupId: text("crew_group_id"),
  employeeId: varchar("employee_id", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 100 }),
  hireDate: timestamp("hire_date"),
  status: varchar("status", { length: 20 }).default("active"), // 'active' | 'inactive' | 'suspended' | 'terminated'
  specializations: json("specializations").$type<string[]>(),
  skillLevel: varchar("skill_level", { length: 20 }).default("trainee"), // 'trainee' | 'junior' | 'senior' | 'expert'
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).default(
    "0.00",
  ),
  commissionRate: decimal("commission_rate", {
    precision: 5,
    scale: 2,
  }).default("0.00"),
  emergencyContactName: varchar("emergency_contact_name", { length: 100 }),
  emergencyContactPhone: varchar("emergency_contact_phone", { length: 20 }),
  notes: text("notes"),
  washBay: varchar("wash_bay", { length: 50 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Crew commission rates (by service type)
export const crewCommissionRates = pgTable("crew_commission_rates", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  serviceType: varchar("service_type", { length: 255 }).notNull(),
  rate: decimal("rate", { precision: 5, scale: 2 }).notNull().default("0.00"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Manual crew commission entries
export const crewCommissionEntries = pgTable("crew_commission_entries", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  crewUserId: text("crew_user_id").notNull(),
  entryDate: timestamp("entry_date").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  notes: text("notes"),
  recordedBy: text("recorded_by").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  payoutId: text("payout_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Crew payout history
export const crewPayouts = pgTable("crew_payouts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  crewUserId: text("crew_user_id").notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  createdBy: text("created_by").notNull(),
  releasedAt: timestamp("released_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Daily income entries (admin/manager input)
export const dailyIncome = pgTable("daily_income", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  branch: varchar("branch", { length: 255 }).notNull(),
  incomeDate: timestamp("income_date").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  recordedBy: text("recorded_by").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Real-time Crew Locations table
export const crewLocations = pgTable("crew_locations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  crewId: text("crew_id").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  accuracy: decimal("accuracy", { precision: 6, scale: 2 }),
  altitude: decimal("altitude", { precision: 8, scale: 2 }),
  heading: decimal("heading", { precision: 5, scale: 2 }),
  speed: decimal("speed", { precision: 6, scale: 2 }),
  address: text("address"),
  locationSource: varchar("location_source", { length: 20 }).default("gps"), // 'gps' | 'manual' | 'estimated'
  batteryLevel: integer("battery_level"),
  signalStrength: integer("signal_strength"),
  timestamp: timestamp("timestamp").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Crew Status Tracking table
export const crewStatus = pgTable("crew_status", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  crewId: text("crew_id").notNull(),
  status: varchar("status", { length: 20 }).notNull(), // 'online' | 'offline' | 'busy' | 'available' | 'break' | 'emergency'
  previousStatus: varchar("previous_status", { length: 20 }),
  reason: varchar("reason", { length: 255 }),
  autoGenerated: boolean("auto_generated").default(false),
  locationId: text("location_id"),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  endedAt: timestamp("ended_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Customer Sessions table (for active customer tracking)
export const customerSessions = pgTable("customer_sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id"),
  sessionType: varchar("session_type", { length: 20 }).notNull(), // 'browsing' | 'booking' | 'service_active' | 'waiting'
  status: varchar("status", { length: 20 }).default("active"), // 'active' | 'inactive' | 'expired'
  deviceInfo: json("device_info").$type<{
    userAgent?: string;
    ip?: string;
    location?: string;
  }>(),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  lastActivity: timestamp("last_activity").notNull().defaultNow(),
  endedAt: timestamp("ended_at"),
});

// Users table
export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  email: varchar("email", { length: 255 }).notNull().unique(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  password: text("password").notNull(), // Bcrypt hash (60+ characters)
  role: varchar("role", { length: 50 }).notNull().default("user"), // 'user' | 'admin' | 'superadmin' | 'cashier' | 'inventory_manager' | 'manager' | 'dispatcher' | 'crew'
  contactNumber: varchar("contact_number", { length: 20 }),
  address: text("address"),
  defaultAddress: text("default_address"), // For home service bookings
  carUnit: varchar("car_unit", { length: 255 }), // Legacy - kept for backward compatibility
  carPlateNumber: varchar("car_plate_number", { length: 20 }), // Legacy
  carType: varchar("car_type", { length: 100 }), // Legacy
  branchLocation: varchar("branch_location", { length: 255 }).notNull(),
  profileImage: text("profile_image"),
  isActive: boolean("is_active").notNull().default(true),
  emailVerified: boolean("email_verified").notNull().default(false),
  loyaltyPoints: integer("loyalty_points").notNull().default(0),
  subscriptionStatus: varchar("subscription_status", { length: 20 })
    .notNull()
    .default("free"), // 'free' | 'basic' | 'premium' | 'vip'
  subscriptionExpiry: timestamp("subscription_expiry"),
  // Crew specific fields
  crewSkills: json("crew_skills").$type<string[]>(),
  crewStatus: varchar("crew_status", { length: 20 }).default("available"), // 'available' | 'busy' | 'offline'
  currentAssignment: text("current_assignment"),
  crewRating: decimal("crew_rating", { precision: 3, scale: 2 }),
  crewExperience: integer("crew_experience"),
  lastLoginAt: timestamp("last_login_at"),
  // Branch access control
  canViewAllBranches: boolean("can_view_all_branches").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// User Vehicles table (for multiple vehicles support)
export const userVehicles = pgTable("user_vehicles", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id").notNull(), // Foreign key to users.id
  unitType: varchar("unit_type", { length: 20 }).notNull(), // 'car' | 'motorcycle'
  unitSize: varchar("unit_size", { length: 50 }).notNull(), // sedan, suv, pickup, regular, medium, big_bike
  plateNumber: varchar("plate_number", { length: 20 }).notNull(),
  vehicleModel: varchar("vehicle_model", { length: 255 }).notNull(), // e.g., "Toyota Hilux 2024"
  isDefault: boolean("is_default").notNull().default(false), // One default vehicle per user
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Bookings table
export const bookings = pgTable("bookings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id"), // null for guest bookings
  guestInfo: json("guest_info").$type<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }>(),
  type: varchar("type", { length: 20 }).notNull(), // 'registered' | 'guest'
  confirmationCode: varchar("confirmation_code", { length: 50 }).notNull(),

  // Service Details
  category: varchar("category", { length: 50 }).notNull(), // 'carwash' | 'auto_detailing' | 'graphene_coating'
  service: varchar("service", { length: 255 }).notNull(),
  serviceType: varchar("service_type", { length: 20 })
    .notNull()
    .default("branch"), // 'branch' | 'home'

  // Vehicle Details
  unitType: varchar("unit_type", { length: 20 }).notNull(), // 'car' | 'motorcycle'
  unitSize: varchar("unit_size", { length: 50 }),
  plateNumber: varchar("plate_number", { length: 20 }),
  vehicleModel: varchar("vehicle_model", { length: 255 }),

  // Schedule Details
  date: varchar("date", { length: 20 }).notNull(),
  timeSlot: varchar("time_slot", { length: 50 }).notNull(),
  branch: varchar("branch", { length: 255 }).notNull(),
  serviceLocation: text("service_location"),
  estimatedDuration: integer("estimated_duration"),

  // Pricing
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).notNull().default("PHP"),

  // Payment Details
  paymentMethod: varchar("payment_method", { length: 50 }), // 'cash' | 'online' | 'gcash' | 'onsite' | 'branch'
  paymentStatus: varchar("payment_status", { length: 50 })
    .notNull()
    .default("pending"),
  receiptUrl: text("receipt_url"),

  // Status and Progress
  status: varchar("status", { length: 50 }).notNull().default("pending"),

  // Additional Info
  notes: text("notes"),
  specialRequests: text("special_requests"),

  // Loyalty
  pointsEarned: integer("points_earned").default(0),
  loyaltyRewardsApplied: json("loyalty_rewards_applied").$type<string[]>(),

  // Assignment
  assignedCrew: json("assigned_crew").$type<string[]>(),
  crewNotes: text("crew_notes"),

  // Completion
  completedAt: timestamp("completed_at"),
  customerRating: decimal("customer_rating", { precision: 3, scale: 2 }),
  customerFeedback: text("customer_feedback"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// System Notifications table
export const systemNotifications = pgTable("system_notifications", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  priority: varchar("priority", { length: 20 }).notNull(), // 'low' | 'medium' | 'high' | 'urgent'
  targetRoles: json("target_roles").$type<string[]>().notNull(),
  targetUsers: json("target_users").$type<string[]>(),
  data: json("data"),
  scheduledFor: timestamp("scheduled_for"),
  sentAt: timestamp("sent_at"),
  readBy: json("read_by")
    .$type<Array<{ userId: string; readAt: string }>>()
    .notNull()
    .default([]),
  actions: json("actions").$type<
    Array<{
      label: string;
      action: string;
      variant?: "default" | "destructive" | "secondary";
    }>
  >(),
  playSound: boolean("play_sound").default(false),
  soundType: varchar("sound_type", { length: 50 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Admin Settings table
export const adminSettings = pgTable("admin_settings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: json("value").notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }), // 'booking' | 'notification' | 'general' | 'pricing'
  isPublic: boolean("is_public").default(false), // If setting can be accessed by non-admin users
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Ads table
export const ads = pgTable("ads", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  duration: varchar("duration", { length: 20 }).notNull(), // 'weekly' | 'monthly' | 'yearly'
  isActive: boolean("is_active").notNull().default(true),
  targetPages: json("target_pages").$type<string[]>().notNull(), // ["welcome", "dashboard"]
  adminEmail: varchar("admin_email", { length: 255 }).notNull(),
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Ad Dismissals table
export const adDismissals = pgTable("ad_dismissals", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  adId: text("ad_id").notNull(),
  userEmail: varchar("user_email", { length: 255 }).notNull(),
  dismissedAt: timestamp("dismissed_at").notNull().defaultNow(),
});

// Booking Status History table
export const bookingStatusHistory = pgTable("booking_status_history", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  bookingId: text("booking_id").notNull(),
  fromStatus: varchar("from_status", { length: 50 }),
  toStatus: varchar("to_status", { length: 50 }).notNull(),
  notes: text("notes"),
  changedBy: text("changed_by"), // User ID who made the change
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// User Sessions table (for better auth management)
export const userSessions = pgTable("user_sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id").notNull(),
  sessionToken: text("session_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Inventory Items table (for admin inventory management)
export const inventoryItems = pgTable("inventory_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description"),
  currentStock: integer("current_stock").notNull().default(0),
  minStockLevel: integer("min_stock_level").notNull().default(10),
  maxStockLevel: integer("max_stock_level").notNull().default(1000),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
  supplier: varchar("supplier", { length: 255 }),
  barcode: varchar("barcode", { length: 100 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Stock Movements table (for tracking inventory changes)
export const stockMovements = pgTable("stock_movements", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  itemId: text("item_id").notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'in' | 'out' | 'adjustment'
  quantity: integer("quantity").notNull(),
  reason: varchar("reason", { length: 255 }),
  reference: varchar("reference", { length: 255 }), // Could be booking ID, purchase order, etc.
  performedBy: text("performed_by"), // User ID
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============= SERVICE PACKAGES SYSTEM =============

// Service Packages table (for Package Studio)
export const servicePackages = pgTable("service_packages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(), // 'carwash' | 'detailing' | 'coating' | 'subscription'
  type: varchar("type", { length: 50 }).notNull(), // 'single' | 'recurring' | 'bundle'
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).notNull().default("PHP"),

  // Duration settings
  durationType: varchar("duration_type", { length: 20 }).default("preset"), // 'preset' | 'hours' | 'custom'
  duration: varchar("duration", { length: 50 }), // 'Daily' | 'Weekly' | 'Monthly' | 'Yearly'
  hours: integer("hours"), // For hour-based packages
  startDate: timestamp("start_date"), // For custom date ranges
  endDate: timestamp("end_date"), // For custom date ranges

  // Package details
  features: json("features").$type<string[]>().notNull().default([]),
  inclusions: json("inclusions").$type<string[]>().default([]),
  exclusions: json("exclusions").$type<string[]>().default([]),
  vehicleTypes: json("vehicle_types")
    .$type<string[]>()
    .notNull()
    .default(["car"]), // 'car' | 'motorcycle' | 'suv' | 'truck'

  // Pricing variations
  carPrice: decimal("car_price", { precision: 10, scale: 2 }),
  motorcyclePrice: decimal("motorcycle_price", { precision: 10, scale: 2 }),
  suvPrice: decimal("suv_price", { precision: 10, scale: 2 }),
  truckPrice: decimal("truck_price", { precision: 10, scale: 2 }),

  // Media and branding
  imageUrl: text("image_url"),
  bannerUrl: text("banner_url"),
  color: varchar("color", { length: 50 }).default("#f97316"), // Theme color

  // Availability
  isActive: boolean("is_active").notNull().default(true),
  isPopular: boolean("is_popular").default(false),
  isFeatured: boolean("is_featured").default(false),
  availableBranches: json("available_branches").$type<string[]>(), // Branch IDs where available

  // Limits and restrictions
  maxBookingsPerDay: integer("max_bookings_per_day"),
  maxBookingsPerMonth: integer("max_bookings_per_month"),
  minAdvanceBooking: integer("min_advance_booking"), // Hours
  maxAdvanceBooking: integer("max_advance_booking"), // Days

  // Metadata
  tags: json("tags").$type<string[]>().default([]),
  priority: integer("priority").default(0), // For sorting
  createdBy: text("created_by"), // Admin user ID
  updatedBy: text("updated_by"), // Admin user ID
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Package Subscriptions (customer package purchases)
export const packageSubscriptions = pgTable("package_subscriptions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id").notNull(),
  packageId: text("package_id").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("active"), // 'active' | 'paused' | 'cancelled' | 'expired'

  // Subscription details
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  autoRenew: boolean("auto_renew").default(true),
  renewalDate: timestamp("renewal_date"),

  // Pricing at time of purchase
  originalPrice: decimal("original_price", {
    precision: 10,
    scale: 2,
  }).notNull(),
  discountApplied: decimal("discount_applied", {
    precision: 10,
    scale: 2,
  }).default("0"),
  finalPrice: decimal("final_price", { precision: 10, scale: 2 }).notNull(),

  // Usage tracking
  usageCount: integer("usage_count").default(0),
  usageLimit: integer("usage_limit"), // If package has usage limits
  remainingCredits: integer("remaining_credits"),

  // Payment tracking
  paymentMethod: varchar("payment_method", { length: 50 }),
  paymentStatus: varchar("payment_status", { length: 50 }).default("pending"),
  lastPaymentDate: timestamp("last_payment_date"),
  nextPaymentDate: timestamp("next_payment_date"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============= BRANCHES SYSTEM =============

// Branches table
export const branches = pgTable("branches", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 20 }).notNull().unique(), // Short code like 'MNL01'
  type: varchar("type", { length: 50 }).notNull().default("full_service"), // 'full_service' | 'express' | 'mobile' | 'kiosk'

  // Contact information
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }),
  postalCode: varchar("postal_code", { length: 20 }),
  country: varchar("country", { length: 100 }).notNull().default("Philippines"),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),

  // Location data
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  timezone: varchar("timezone", { length: 100 }).default("Asia/Manila"),

  // Operational details
  managerName: varchar("manager_name", { length: 255 }),
  managerPhone: varchar("manager_phone", { length: 20 }),
  capacity: integer("capacity").default(10), // Max concurrent services

  // Services offered
  services: json("services").$type<string[]>().notNull().default([]),
  specializations: json("specializations").$type<string[]>().default([]),

  // Operating hours
  operatingHours: json("operating_hours").$type<{
    monday: { open: string; close: string; closed?: boolean };
    tuesday: { open: string; close: string; closed?: boolean };
    wednesday: { open: string; close: string; closed?: boolean };
    thursday: { open: string; close: string; closed?: boolean };
    friday: { open: string; close: string; closed?: boolean };
    saturday: { open: string; close: string; closed?: boolean };
    sunday: { open: string; close: string; closed?: boolean };
  }>(),

  // Status and features
  isActive: boolean("is_active").notNull().default(true),
  isMainBranch: boolean("is_main_branch").default(false),
  hasWifi: boolean("has_wifi").default(true),
  hasParking: boolean("has_parking").default(true),
  hasWaitingArea: boolean("has_waiting_area").default(true),
  has24HourService: boolean("has_24_hour_service").default(false),

  // Media
  images: json("images").$type<string[]>().default([]),
  logoUrl: text("logo_url"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============= ENHANCED GAMIFICATION SYSTEM =============

// Customer Achievement Levels
export const customerLevels = pgTable("customer_levels", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  minPoints: integer("min_points").notNull(),
  maxPoints: integer("max_points"),

  // Level benefits
  discountPercentage: decimal("discount_percentage", {
    precision: 5,
    scale: 2,
  }).default("0"),
  priority: integer("priority").default(0), // Booking priority
  specialPerks: json("special_perks").$type<string[]>().default([]),

  // Visual elements
  badgeIcon: varchar("badge_icon", { length: 100 }),
  badgeColor: varchar("badge_color", { length: 50 }).default("#6B7280"),
  levelColor: varchar("level_color", { length: 50 }).default("#F97316"),
  gradient: varchar("gradient", { length: 100 }).default("from-gray-400 to-gray-600"),
  badgeShape: varchar("badge_shape", { length: 20 }).default("circle"),
  badgePattern: varchar("badge_pattern", { length: 20 }).default("solid"),

  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Achievements system
export const achievements = pgTable("achievements", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(), // 'loyalty' | 'usage' | 'social' | 'special'

  // Achievement criteria
  type: varchar("type", { length: 50 }).notNull(), // 'visit_count' | 'spending' | 'referral' | 'streak' | 'special'
  targetValue: integer("target_value"), // Required value to unlock
  requirementData: json("requirement_data"), // Additional criteria

  // Rewards
  pointsReward: integer("points_reward").default(0),
  badgeIcon: varchar("badge_icon", { length: 100 }),
  badgeColor: varchar("badge_color", { length: 50 }).default("#10B981"),

  // Availability
  isActive: boolean("is_active").default(true),
  isRepeatable: boolean("is_repeatable").default(false),
  validFrom: timestamp("valid_from"),
  validUntil: timestamp("valid_until"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// User achievements tracking
export const userAchievements = pgTable("user_achievements", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id").notNull(),
  achievementId: text("achievement_id").notNull(),

  progress: integer("progress").default(0),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  pointsEarned: integer("points_earned").default(0),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Loyalty Point Transactions
export const loyaltyTransactions = pgTable("loyalty_transactions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'earned' | 'redeemed' | 'expired' | 'bonus'
  amount: integer("amount").notNull(),
  description: text("description"),

  // Reference data
  referenceType: varchar("reference_type", { length: 50 }), // 'booking' | 'achievement' | 'referral' | 'manual'
  referenceId: text("reference_id"),

  balanceBefore: integer("balance_before").notNull(),
  balanceAfter: integer("balance_after").notNull(),

  expiresAt: timestamp("expires_at"), // For points that expire
  processedBy: text("processed_by"), // Admin user ID for manual transactions

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============= SUPPLIERS SYSTEM =============

// Suppliers table
export const suppliers = pgTable("suppliers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: varchar("name", { length: 255 }).notNull(),
  contactPerson: varchar("contact_person", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  website: varchar("website", { length: 255 }),
  taxId: varchar("tax_id", { length: 100 }),

  // Payment terms
  paymentTerms: varchar("payment_terms", { length: 100 }).default("Net 30"),
  creditLimit: decimal("credit_limit", { precision: 12, scale: 2 }).default(
    "0.00",
  ),
  currentBalance: decimal("current_balance", {
    precision: 12,
    scale: 2,
  }).default("0.00"),

  // Rating and performance
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  totalOrders: integer("total_orders").default(0),
  totalValue: decimal("total_value", { precision: 12, scale: 2 }).default(
    "0.00",
  ),

  // Status and metadata
  status: varchar("status", { length: 20 }).default("active"), // 'active' | 'inactive' | 'blacklisted'
  notes: text("notes"),
  tags: json("tags").$type<string[]>().default([]),

  // Lead times and delivery
  averageLeadTime: integer("average_lead_time"), // in days
  deliveryReliability: decimal("delivery_reliability", {
    precision: 5,
    scale: 2,
  }).default("100.00"), // percentage

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Purchase Orders table
export const purchaseOrders = pgTable("purchase_orders", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  supplierId: text("supplier_id").notNull(),

  // Order details
  status: varchar("status", { length: 50 }).default("draft"), // 'draft' | 'pending' | 'approved' | 'ordered' | 'partial' | 'completed' | 'cancelled'
  orderDate: timestamp("order_date").notNull().defaultNow(),
  expectedDelivery: timestamp("expected_delivery"),
  actualDelivery: timestamp("actual_delivery"),

  // Financial details
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }).default("0.00"),
  shippingCost: decimal("shipping_cost", { precision: 12, scale: 2 }).default(
    "0.00",
  ),
  discountAmount: decimal("discount_amount", {
    precision: 12,
    scale: 2,
  }).default("0.00"),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),

  // Approval workflow
  requestedBy: text("requested_by").notNull(), // User ID
  approvedBy: text("approved_by"), // User ID
  approvedAt: timestamp("approved_at"),

  // Additional info
  notes: text("notes"),
  internalReference: varchar("internal_reference", { length: 100 }),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Purchase Order Items table
export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  purchaseOrderId: text("purchase_order_id").notNull(),
  inventoryItemId: text("inventory_item_id").notNull(),

  // Item details at time of order
  itemName: varchar("item_name", { length: 255 }).notNull(),
  itemSku: varchar("item_sku", { length: 100 }),

  // Quantities
  quantityOrdered: integer("quantity_ordered").notNull(),
  quantityReceived: integer("quantity_received").default(0),
  quantityPending: integer("quantity_pending").notNull(), // calculated field

  // Pricing
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }).notNull(),
  lineTotal: decimal("line_total", { precision: 12, scale: 2 }).notNull(),

  // Delivery tracking
  receivedDate: timestamp("received_date"),
  receivedBy: text("received_by"), // User ID

  // Quality control
  qualityStatus: varchar("quality_status", { length: 50 }).default("pending"), // 'pending' | 'approved' | 'rejected'
  qualityNotes: text("quality_notes"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============= POS SYSTEM =============

// Product Categories for POS
export const posCategories = pgTable("pos_categories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 100 }),
  color: varchar("color", { length: 50 }).default("#F97316"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Products for POS
export const posProducts = pgTable("pos_products", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  categoryId: text("category_id"),

  // Pricing
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  carPrice: decimal("car_price", { precision: 10, scale: 2 }),
  motorcyclePrice: decimal("motorcycle_price", { precision: 10, scale: 2 }),
  suvPrice: decimal("suv_price", { precision: 10, scale: 2 }),
  truckPrice: decimal("truck_price", { precision: 10, scale: 2 }),

  // Product details
  sku: varchar("sku", { length: 100 }),
  barcode: varchar("barcode", { length: 100 }),
  unit: varchar("unit", { length: 50 }).default("piece"),

  // Inventory tracking
  trackInventory: boolean("track_inventory").default(false),
  currentStock: integer("current_stock").default(0),
  minStockLevel: integer("min_stock_level").default(0),

  // Service-specific
  isService: boolean("is_service").default(false),
  estimatedDuration: integer("estimated_duration"), // in minutes
  vehicleTypes: json("vehicle_types").$type<string[]>().default(["car"]),

  // Media and display
  imageUrl: text("image_url"),
  color: varchar("color", { length: 50 }),

  // Availability
  isActive: boolean("is_active").default(true),
  availableBranches: json("available_branches").$type<string[]>(),

  // Metadata
  tags: json("tags").$type<string[]>().default([]),
  sortOrder: integer("sort_order").default(0),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// POS Transactions
export const posTransactions = pgTable("pos_transactions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  transactionNumber: varchar("transaction_number", { length: 50 })
    .notNull()
    .unique(),

  // Customer information
  customerId: text("customer_id"), // null for walk-in customers
  customerName: varchar("customer_name", { length: 255 }),
  customerEmail: varchar("customer_email", { length: 255 }),
  customerPhone: varchar("customer_phone", { length: 20 }),

  // Transaction details
  type: varchar("type", { length: 50 }).notNull().default("sale"), // 'sale' | 'refund' | 'void'
  status: varchar("status", { length: 50 }).notNull().default("completed"), // 'pending' | 'completed' | 'cancelled' | 'refunded'

  // Location and staff
  branchId: text("branch_id").notNull(),
  cashierId: text("cashier_id").notNull(),
  cashierName: varchar("cashier_name", { length: 255 }).notNull(),

  // Pricing
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
  discountAmount: decimal("discount_amount", {
    precision: 10,
    scale: 2,
  }).default("0"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),

  // Payment
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(), // 'cash' | 'card' | 'gcash' | 'paymaya'
  paymentReference: varchar("payment_reference", { length: 255 }),
  amountPaid: decimal("amount_paid", { precision: 10, scale: 2 }).notNull(),
  changeAmount: decimal("change_amount", { precision: 10, scale: 2 }).default(
    "0",
  ),

  // Additional data
  notes: text("notes"),
  receiptData: json("receipt_data"), // Full receipt information

  // Loyalty points
  pointsEarned: integer("points_earned").default(0),
  pointsRedeemed: integer("points_redeemed").default(0),

  refundedAt: timestamp("refunded_at"),
  refundReason: text("refund_reason"),
  refundedBy: text("refunded_by"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// POS Transaction Items
export const posTransactionItems = pgTable("pos_transaction_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  transactionId: text("transaction_id").notNull(),
  productId: text("product_id"),

  // Item details at time of sale
  itemName: varchar("item_name", { length: 255 }).notNull(),
  itemSku: varchar("item_sku", { length: 100 }),
  itemCategory: varchar("item_category", { length: 100 }),

  // Pricing
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull().default(1),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  discountAmount: decimal("discount_amount", {
    precision: 10,
    scale: 2,
  }).default("0"),
  finalPrice: decimal("final_price", { precision: 10, scale: 2 }).notNull(),

  // Service-specific data
  vehicleType: varchar("vehicle_type", { length: 50 }),
  serviceNotes: text("service_notes"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// POS Expenses
export const posExpenses = pgTable("pos_expenses", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  // Session reference
  posSessionId: text("pos_session_id").notNull(),

  // Expense details
  category: varchar("category", { length: 100 }).notNull(), // 'supplies' | 'utilities' | 'rent' | 'maintenance' | 'fuel' | 'other'
  description: varchar("description", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),

  // Payment information
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(), // 'cash' | 'card' | 'gcash' | 'bank'
  notes: text("notes"),

  // Staff information
  recordedBy: text("recorded_by").notNull(), // Cashier/User ID
  recordedByName: varchar("recorded_by_name", { length: 255 }).notNull(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// POS Sessions (Opening and Closing)
export const posSessions = pgTable("pos_sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  // Session details
  status: varchar("status", { length: 20 }).notNull().default("open"), // 'open' | 'closed'
  sessionDate: timestamp("session_date").notNull(),

  // Staff information
  cashierId: text("cashier_id").notNull(),
  cashierName: varchar("cashier_name", { length: 255 }).notNull(),
  branchId: text("branch_id").notNull(),

  // Opening balance
  openingBalance: decimal("opening_balance", {
    precision: 10,
    scale: 2,
  }).notNull(),
  openedAt: timestamp("opened_at").notNull().defaultNow(),

  // Closing balance and reconciliation
  closingBalance: decimal("closing_balance", { precision: 10, scale: 2 }),
  closedAt: timestamp("closed_at"),

  // Calculated totals
  totalCashSales: decimal("total_cash_sales", {
    precision: 10,
    scale: 2,
  }).default("0"),
  totalCardSales: decimal("total_card_sales", {
    precision: 10,
    scale: 2,
  }).default("0"),
  totalGcashSales: decimal("total_gcash_sales", {
    precision: 10,
    scale: 2,
  }).default("0"),
  totalBankSales: decimal("total_bank_sales", {
    precision: 10,
    scale: 2,
  }).default("0"),
  totalExpenses: decimal("total_expenses", { precision: 10, scale: 2 }).default(
    "0",
  ),

  // Reconciliation data
  expectedCash: decimal("expected_cash", { precision: 10, scale: 2 }), // Opening balance + cash sales - expenses
  actualCash: decimal("actual_cash", { precision: 10, scale: 2 }), // Actual cash counted
  cashVariance: decimal("cash_variance", { precision: 10, scale: 2 }), // Difference between expected and actual

  // Digital payment reconciliation
  expectedDigital: decimal("expected_digital", { precision: 10, scale: 2 }), // Card + GCash + Bank
  actualDigital: decimal("actual_digital", { precision: 10, scale: 2 }), // Actual digital verified
  digitalVariance: decimal("digital_variance", { precision: 10, scale: 2 }),

  // Remittance data
  remittanceNotes: text("remittance_notes"),
  isBalanced: boolean("is_balanced").default(false),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============= IMAGE MANAGEMENT SYSTEM =============

// Image Storage and Management
export const images = pgTable("images", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  // Basic image information
  originalName: varchar("original_name", { length: 255 }).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  size: integer("size").notNull(), // File size in bytes

  // Image dimensions
  width: integer("width"),
  height: integer("height"),

  // Storage information
  storageType: varchar("storage_type", { length: 50 })
    .notNull()
    .default("local"), // 'local' | 'cloudinary' | 's3' | 'firebase'
  storagePath: text("storage_path").notNull(), // Local path or cloud URL
  publicUrl: text("public_url").notNull(), // Publicly accessible URL

  // Image categorization
  category: varchar("category", { length: 100 }).notNull(), // 'profile' | 'service' | 'branch' | 'product' | 'banner' | 'gallery'
  tags: json("tags").$type<string[]>().default([]),

  // Ownership and association
  uploadedBy: text("uploaded_by"), // User ID who uploaded
  associatedWith: varchar("associated_with", { length: 50 }), // 'user' | 'service_package' | 'branch' | 'pos_product' | 'ad'
  associatedId: text("associated_id"), // ID of the associated entity

  // Image metadata
  altText: text("alt_text"),
  description: text("description"),

  // Processing status
  processingStatus: varchar("processing_status", { length: 50 }).default(
    "completed",
  ), // 'pending' | 'processing' | 'completed' | 'failed'
  thumbnailUrl: text("thumbnail_url"), // URL for thumbnail version
  mediumUrl: text("medium_url"), // URL for medium resolution

  // Usage tracking
  downloadCount: integer("download_count").default(0),
  viewCount: integer("view_count").default(0),

  // Status
  isActive: boolean("is_active").default(true),
  isPublic: boolean("is_public").default(true),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Image Collections (for organizing images)
export const imageCollections = pgTable("image_collections", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),

  // Collection properties
  category: varchar("category", { length: 100 }).notNull(), // 'gallery' | 'portfolio' | 'banners' | 'products'
  isPublic: boolean("is_public").default(true),
  sortOrder: integer("sort_order").default(0),

  // Ownership
  createdBy: text("created_by").notNull(), // User ID

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Image Collection Items (many-to-many relationship)
export const imageCollectionItems = pgTable("image_collection_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  collectionId: text("collection_id").notNull(),
  imageId: text("image_id").notNull(),
  sortOrder: integer("sort_order").default(0),
  caption: text("caption"),

  addedAt: timestamp("added_at").notNull().defaultNow(),
});

// ============= PUSH NOTIFICATION SYSTEM =============

// FCM Token Storage
export const fcmTokens = pgTable("fcm_tokens", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  // Token information
  token: text("token").notNull().unique(),
  userId: text("user_id"), // null for guest/anonymous tokens

  // Device information
  deviceType: varchar("device_type", { length: 50 }), // 'web' | 'android' | 'ios'
  browserInfo: text("browser_info"), // User agent string
  deviceName: varchar("device_name", { length: 255 }),

  // Status
  isActive: boolean("is_active").default(true),
  lastUsed: timestamp("last_used").defaultNow(),

  // Subscription preferences
  notificationTypes: json("notification_types")
    .$type<string[]>()
    .default(["booking_updates", "loyalty_updates", "system"]),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Push Notification History
export const pushNotifications = pgTable("push_notifications", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  // Notification content
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body").notNull(),
  imageUrl: text("image_url"),

  // Targeting
  targetType: varchar("target_type", { length: 50 }).notNull(), // 'user' | 'role' | 'all' | 'topic'
  targetIds: json("target_ids").$type<string[]>(), // User IDs, role names, or topic names

  // Notification data
  notificationType: varchar("notification_type", { length: 100 }).notNull(), // 'booking_update' | 'loyalty_update' | 'achievement' | 'system'
  data: json("data"), // Additional data payload

  // Delivery information
  totalTargets: integer("total_targets").default(0),
  successfulDeliveries: integer("successful_deliveries").default(0),
  failedDeliveries: integer("failed_deliveries").default(0),

  // Status
  status: varchar("status", { length: 50 }).default("pending"), // 'pending' | 'sending' | 'sent' | 'failed'
  scheduledFor: timestamp("scheduled_for"), // For scheduled notifications
  sentAt: timestamp("sent_at"),

  // Metadata
  createdBy: text("created_by"), // Admin user ID
  campaign: varchar("campaign", { length: 255 }), // Campaign identifier

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Notification Delivery Tracking
export const notificationDeliveries = pgTable("notification_deliveries", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  notificationId: text("notification_id").notNull(),
  fcmTokenId: text("fcm_token_id").notNull(),
  userId: text("user_id"),

  // Delivery status
  status: varchar("status", { length: 50 }).notNull(), // 'sent' | 'delivered' | 'clicked' | 'dismissed' | 'failed'
  errorMessage: text("error_message"),

  // Interaction tracking
  deliveredAt: timestamp("delivered_at"),
  clickedAt: timestamp("clicked_at"),
  dismissedAt: timestamp("dismissed_at"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============= WEBHOOK IDEMPOTENCY =============

// Webhook Event Log for deduplication (prevent duplicate processing)
export const webhookEventLogs = pgTable("webhook_event_logs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  // Webhook identification
  provider: varchar("provider", { length: 50 }).notNull(), // 'xendit' | 'stripe' | etc
  eventId: varchar("event_id", { length: 255 }).notNull(), // External event ID from provider
  externalId: varchar("external_id", { length: 255 }), // e.g., "BOOKING_123" or "SUBSCRIPTION_456"
  eventType: varchar("event_type", { length: 100 }), // e.g., "PAID", "SETTLED", "FAILED"
  eventStatus: varchar("event_status", { length: 50 }).notNull(), // 'success' | 'failure' | 'pending'

  // Webhook payload (store original for audit)
  payload: json("payload"), // Full webhook payload

  // Processing information
  processedAt: timestamp("processed_at").notNull().defaultNow(),
  processingTimeMs: integer("processing_time_ms"), // How long processing took

  // Result information
  result: json("result"), // What was updated (booking ID, subscription ID, etc)
  errorMessage: text("error_message"), // If failed

  // Metadata
  ipAddress: varchar("ip_address", { length: 45 }), // IPv4 or IPv6
  userAgent: text("user_agent"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Export CMS schema types and tables
export * from "./cmsSchema";
