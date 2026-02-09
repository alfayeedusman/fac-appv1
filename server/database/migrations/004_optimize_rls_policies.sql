-- OPTIMIZATION: Optimize Row Level Security policies
-- Performance fix: Replace auth.<function>() with (SELECT auth.<function>())
-- This prevents unnecessary re-evaluation of auth functions for each row
-- Reference: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select

-- Crew Management Tables
DROP POLICY IF EXISTS "crew_members_select_policy" ON crew_members;
CREATE POLICY "crew_members_select_policy" ON crew_members
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "crew_members_insert_policy" ON crew_members;
CREATE POLICY "crew_members_insert_policy" ON crew_members
  FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "crew_members_update_policy" ON crew_members;
CREATE POLICY "crew_members_update_policy" ON crew_members
  FOR UPDATE USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "crew_members_delete_policy" ON crew_members;
CREATE POLICY "crew_members_delete_policy" ON crew_members
  FOR DELETE USING ((SELECT auth.uid()) IS NOT NULL);

-- Crew Groups
DROP POLICY IF EXISTS "crew_groups_select_policy" ON crew_groups;
CREATE POLICY "crew_groups_select_policy" ON crew_groups
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "crew_groups_insert_policy" ON crew_groups;
CREATE POLICY "crew_groups_insert_policy" ON crew_groups
  FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "crew_groups_update_policy" ON crew_groups;
CREATE POLICY "crew_groups_update_policy" ON crew_groups
  FOR UPDATE USING ((SELECT auth.uid()) IS NOT NULL);

-- Crew Locations
DROP POLICY IF EXISTS "crew_locations_select_policy" ON crew_locations;
CREATE POLICY "crew_locations_select_policy" ON crew_locations
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "crew_locations_insert_policy" ON crew_locations;
CREATE POLICY "crew_locations_insert_policy" ON crew_locations
  FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- Users Table
DROP POLICY IF EXISTS "users_select_policy" ON users;
CREATE POLICY "users_select_policy" ON users
  FOR SELECT USING ((SELECT auth.uid())::text = id::text OR (SELECT auth.role()) = 'admin');

DROP POLICY IF EXISTS "users_update_policy" ON users;
CREATE POLICY "users_update_policy" ON users
  FOR UPDATE USING ((SELECT auth.uid())::text = id::text);

-- User Vehicles
DROP POLICY IF EXISTS "user_vehicles_select_policy" ON user_vehicles;
CREATE POLICY "user_vehicles_select_policy" ON user_vehicles
  FOR SELECT USING ((SELECT auth.uid())::text = user_id::text);

DROP POLICY IF EXISTS "user_vehicles_insert_policy" ON user_vehicles;
CREATE POLICY "user_vehicles_insert_policy" ON user_vehicles
  FOR INSERT WITH CHECK ((SELECT auth.uid())::text = user_id::text);

DROP POLICY IF EXISTS "user_vehicles_update_policy" ON user_vehicles;
CREATE POLICY "user_vehicles_update_policy" ON user_vehicles
  FOR UPDATE USING ((SELECT auth.uid())::text = user_id::text);

-- Bookings
DROP POLICY IF EXISTS "bookings_select_policy" ON bookings;
CREATE POLICY "bookings_select_policy" ON bookings
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "bookings_insert_policy" ON bookings;
CREATE POLICY "bookings_insert_policy" ON bookings
  FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "bookings_update_policy" ON bookings;
CREATE POLICY "bookings_update_policy" ON bookings
  FOR UPDATE USING ((SELECT auth.uid()) IS NOT NULL);

-- Package Subscriptions
DROP POLICY IF EXISTS "package_subscriptions_select_policy" ON package_subscriptions;
CREATE POLICY "package_subscriptions_select_policy" ON package_subscriptions
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

-- POS Sessions
DROP POLICY IF EXISTS "pos_sessions_select_policy" ON pos_sessions;
CREATE POLICY "pos_sessions_select_policy" ON pos_sessions
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "pos_sessions_insert_policy" ON pos_sessions;
CREATE POLICY "pos_sessions_insert_policy" ON pos_sessions
  FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "pos_sessions_update_policy" ON pos_sessions;
CREATE POLICY "pos_sessions_update_policy" ON pos_sessions
  FOR UPDATE USING ((SELECT auth.uid()) IS NOT NULL);

-- POS Transactions
DROP POLICY IF EXISTS "pos_transactions_select_policy" ON pos_transactions;
CREATE POLICY "pos_transactions_select_policy" ON pos_transactions
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "pos_transactions_insert_policy" ON pos_transactions;
CREATE POLICY "pos_transactions_insert_policy" ON pos_transactions
  FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- Additional Critical Tables (select policies)
DROP POLICY IF EXISTS "crew_status_select_policy" ON crew_status;
CREATE POLICY "crew_status_select_policy" ON crew_status
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "crew_status_insert_policy" ON crew_status;
CREATE POLICY "crew_status_insert_policy" ON crew_status
  FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "crew_commission_entries_select_policy" ON crew_commission_entries;
CREATE POLICY "crew_commission_entries_select_policy" ON crew_commission_entries
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "crew_commission_entries_insert_policy" ON crew_commission_entries;
CREATE POLICY "crew_commission_entries_insert_policy" ON crew_commission_entries
  FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "crew_payouts_select_policy" ON crew_payouts;
CREATE POLICY "crew_payouts_select_policy" ON crew_payouts
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "crew_commission_rates_select_policy" ON crew_commission_rates;
CREATE POLICY "crew_commission_rates_select_policy" ON crew_commission_rates
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "crew_commission_rates_insert_policy" ON crew_commission_rates;
CREATE POLICY "crew_commission_rates_insert_policy" ON crew_commission_rates
  FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- Ads and Dismissals
DROP POLICY IF EXISTS "ads_select_policy" ON ads;
CREATE POLICY "ads_select_policy" ON ads
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "ad_dismissals_select_policy" ON ad_dismissals;
CREATE POLICY "ad_dismissals_select_policy" ON ad_dismissals
  FOR SELECT USING ((SELECT auth.email()) = user_email);

DROP POLICY IF EXISTS "ad_dismissals_insert_policy" ON ad_dismissals;
CREATE POLICY "ad_dismissals_insert_policy" ON ad_dismissals
  FOR INSERT WITH CHECK ((SELECT auth.email()) = user_email);

-- POS and Expenses
DROP POLICY IF EXISTS "pos_expenses_select_policy" ON pos_expenses;
CREATE POLICY "pos_expenses_select_policy" ON pos_expenses
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "pos_expenses_insert_policy" ON pos_expenses;
CREATE POLICY "pos_expenses_insert_policy" ON pos_expenses
  FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- Notifications and Related
DROP POLICY IF EXISTS "notifications_select_policy" ON notifications;
CREATE POLICY "notifications_select_policy" ON notifications
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

-- Service Packages
DROP POLICY IF EXISTS "service_packages_select_policy" ON service_packages;
CREATE POLICY "service_packages_select_policy" ON service_packages
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "service_packages_insert_policy" ON service_packages;
CREATE POLICY "service_packages_insert_policy" ON service_packages
  FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- Branches
DROP POLICY IF EXISTS "branches_select_policy" ON branches;
CREATE POLICY "branches_select_policy" ON branches
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "branches_insert_policy" ON branches;
CREATE POLICY "branches_insert_policy" ON branches
  FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- Payment Uploads
DROP POLICY IF EXISTS "payment_uploads_select_policy" ON payment_uploads;
CREATE POLICY "payment_uploads_select_policy" ON payment_uploads
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "payment_uploads_insert_policy" ON payment_uploads;
CREATE POLICY "payment_uploads_insert_policy" ON payment_uploads
  FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- Additional Tables
DROP POLICY IF EXISTS "loyalty_transactions_select_policy" ON loyalty_transactions;
CREATE POLICY "loyalty_transactions_select_policy" ON loyalty_transactions
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "pos_transaction_items_select_policy" ON pos_transaction_items;
CREATE POLICY "pos_transaction_items_select_policy" ON pos_transaction_items
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "user_sessions_select_policy" ON user_sessions;
CREATE POLICY "user_sessions_select_policy" ON user_sessions
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "admin_settings_select_policy" ON admin_settings;
CREATE POLICY "admin_settings_select_policy" ON admin_settings
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "admin_settings_insert_policy" ON admin_settings;
CREATE POLICY "admin_settings_insert_policy" ON admin_settings
  FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "push_subscriptions_select_policy" ON push_subscriptions;
CREATE POLICY "push_subscriptions_select_policy" ON push_subscriptions
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "push_subscriptions_insert_policy" ON push_subscriptions;
CREATE POLICY "push_subscriptions_insert_policy" ON push_subscriptions
  FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "booking_status_history_select_policy" ON booking_status_history;
CREATE POLICY "booking_status_history_select_policy" ON booking_status_history
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "image_collections_select_policy" ON image_collections;
CREATE POLICY "image_collections_select_policy" ON image_collections
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "image_collections_insert_policy" ON image_collections;
CREATE POLICY "image_collections_insert_policy" ON image_collections
  FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "image_collection_items_select_policy" ON image_collection_items;
CREATE POLICY "image_collection_items_select_policy" ON image_collection_items
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "vouchers_select_policy" ON vouchers;
CREATE POLICY "vouchers_select_policy" ON vouchers
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "subscriptions_select_policy" ON subscriptions;
CREATE POLICY "subscriptions_select_policy" ON subscriptions
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "user_achievements_select_policy" ON user_achievements;
CREATE POLICY "user_achievements_select_policy" ON user_achievements
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "fcm_tokens_select_policy" ON fcm_tokens;
CREATE POLICY "fcm_tokens_select_policy" ON fcm_tokens
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "fcm_tokens_insert_policy" ON fcm_tokens;
CREATE POLICY "fcm_tokens_insert_policy" ON fcm_tokens
  FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "push_notifications_select_policy" ON push_notifications;
CREATE POLICY "push_notifications_select_policy" ON push_notifications
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "daily_income_select_policy" ON daily_income;
CREATE POLICY "daily_income_select_policy" ON daily_income
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "daily_income_insert_policy" ON daily_income;
CREATE POLICY "daily_income_insert_policy" ON daily_income
  FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "voucher_redemptions_select_policy" ON voucher_redemptions;
CREATE POLICY "voucher_redemptions_select_policy" ON voucher_redemptions
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "notification_deliveries_select_policy" ON notification_deliveries;
CREATE POLICY "notification_deliveries_select_policy" ON notification_deliveries
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "inventory_items_select_policy" ON inventory_items;
CREATE POLICY "inventory_items_select_policy" ON inventory_items
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "stock_movements_select_policy" ON stock_movements;
CREATE POLICY "stock_movements_select_policy" ON stock_movements
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "suppliers_select_policy" ON suppliers;
CREATE POLICY "suppliers_select_policy" ON suppliers
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "pos_products_select_policy" ON pos_products;
CREATE POLICY "pos_products_select_policy" ON pos_products
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "images_select_policy" ON images;
CREATE POLICY "images_select_policy" ON images
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "purchase_orders_select_policy" ON purchase_orders;
CREATE POLICY "purchase_orders_select_policy" ON purchase_orders
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "purchase_order_items_select_policy" ON purchase_order_items;
CREATE POLICY "purchase_order_items_select_policy" ON purchase_order_items
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "pos_categories_select_policy" ON pos_categories;
CREATE POLICY "pos_categories_select_policy" ON pos_categories
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "achievements_select_policy" ON achievements;
CREATE POLICY "achievements_select_policy" ON achievements
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "customer_levels_select_policy" ON customer_levels;
CREATE POLICY "customer_levels_select_policy" ON customer_levels
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "customer_sessions_select_policy" ON customer_sessions;
CREATE POLICY "customer_sessions_select_policy" ON customer_sessions
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "customer_sessions_insert_policy" ON customer_sessions;
CREATE POLICY "customer_sessions_insert_policy" ON customer_sessions
  FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "system_notifications_select_policy" ON system_notifications;
CREATE POLICY "system_notifications_select_policy" ON system_notifications
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "homepage_content_select_policy" ON homepage_content;
CREATE POLICY "homepage_content_select_policy" ON homepage_content
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);
