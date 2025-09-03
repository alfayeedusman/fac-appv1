import {
  pgTable,
  text,
  timestamp,
  boolean,
  json,
  varchar,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

// ============= CMS CONTENT MANAGEMENT SYSTEM =============

// Homepage Content Table - Stores the complete homepage configuration
export const homepageContent = pgTable("homepage_content", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  
  // Content sections stored as JSON for flexibility
  heroSection: json("hero_section").$type<{
    logo: string;
    badge: string;
    mainTitle: string;
    highlightedTitle: string;
    subtitle: string;
    description: string;
    features: Array<{
      id: string;
      icon: string;
      title: string;
      subtitle: string;
      color: string;
    }>;
    ctaButtons: Array<{
      id: string;
      text: string;
      link: string;
      variant: "primary" | "secondary" | "outline";
      enabled: boolean;
    }>;
  }>(),

  servicesSection: json("services_section").$type<{
    badge: string;
    title: string;
    highlightedTitle: string;
    description: string;
    items: Array<{
      id: string;
      icon: string;
      title: string;
      description: string;
      gradient: string;
      enabled: boolean;
    }>;
  }>(),

  visionMissionSection: json("vision_mission_section").$type<{
    badge: string;
    title: string;
    highlightedTitle: string;
    vision: {
      title: string;
      content: string;
      icon: string;
      gradient: string;
    };
    mission: {
      title: string;
      content: string;
      icon: string;
      gradient: string;
    };
  }>(),

  locationsSection: json("locations_section").$type<{
    badge: string;
    title: string;
    highlightedTitle: string;
    description: string;
    branches: Array<{
      id: string;
      name: string;
      location: string;
      gradient: string;
      enabled: boolean;
    }>;
  }>(),

  footerSection: json("footer_section").$type<{
    companyName: string;
    tagline: string;
    poweredBy: string;
    copyright: string;
  }>(),

  themeSettings: json("theme_settings").$type<{
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  }>(),

  // Metadata
  version: varchar("version", { length: 50 }).default("1.0.0"),
  isActive: boolean("is_active").default(true),
  publishedAt: timestamp("published_at"),
  
  // Audit fields
  createdBy: text("created_by"), // User ID of creator
  updatedBy: text("updated_by"), // User ID of last updater
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// CMS Content History - Track changes to homepage content
export const cmsContentHistory = pgTable("cms_content_history", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  
  contentId: text("content_id").notNull(), // Reference to homepage_content
  action: varchar("action", { length: 50 }).notNull(), // 'create' | 'update' | 'publish' | 'unpublish'
  
  // Store the full content at time of change
  contentSnapshot: json("content_snapshot"),
  
  // Change details
  changedFields: json("changed_fields").$type<string[]>(),
  changeDescription: text("change_description"),
  
  // User who made the change
  changedBy: text("changed_by"),
  changedByName: varchar("changed_by_name", { length: 255 }),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// CMS Settings - Global CMS configuration
export const cmsSettings = pgTable("cms_settings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  
  settingKey: varchar("setting_key", { length: 100 }).notNull().unique(),
  settingValue: json("setting_value"),
  description: text("description"),
  
  // Metadata
  category: varchar("category", { length: 50 }).default("general"), // 'general' | 'theme' | 'seo' | 'analytics'
  isSystem: boolean("is_system").default(false), // System settings vs user configurable
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Export types for TypeScript
export type HomepageContent = typeof homepageContent.$inferSelect;
export type NewHomepageContent = typeof homepageContent.$inferInsert;
export type CMSContentHistory = typeof cmsContentHistory.$inferSelect;
export type NewCMSContentHistory = typeof cmsContentHistory.$inferInsert;
export type CMSSettings = typeof cmsSettings.$inferSelect;
export type NewCMSSettings = typeof cmsSettings.$inferInsert;
