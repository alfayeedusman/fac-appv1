-- CLEANUP: Remove unused indexes and duplicate indexes
-- These were identified by Supabase database linter as never being used
-- Keeping unused indexes wastes storage and slows down writes

-- Remove duplicate index on user_vehicles (keep idx_user_vehicles_user_id)
DROP INDEX IF EXISTS idx_vehicles_user;

-- Remove unused indexes that have never been accessed
DROP INDEX IF EXISTS idx_bookings_user;
DROP INDEX IF EXISTS idx_bookings_date;
DROP INDEX IF EXISTS idx_subscriptions_user;
DROP INDEX IF EXISTS idx_subscriptions_status;
DROP INDEX IF EXISTS idx_notifications_user;
DROP INDEX IF EXISTS idx_notifications_read;
DROP INDEX IF EXISTS idx_daily_income_date;
DROP INDEX IF EXISTS idx_branches_code;
DROP INDEX IF EXISTS idx_branches_city;
DROP INDEX IF EXISTS idx_branches_active;
DROP INDEX IF EXISTS idx_packages_category;
DROP INDEX IF EXISTS idx_packages_active;
DROP INDEX IF EXISTS idx_user_achievements_user;
DROP INDEX IF EXISTS idx_loyalty_user;
DROP INDEX IF EXISTS idx_images_category;
DROP INDEX IF EXISTS idx_push_user;

COMMENT ON TABLE user_vehicles IS 'User vehicles with consolidated indexes for performance';
COMMENT ON TABLE bookings IS 'Booking records with optimized indexing strategy';
COMMENT ON TABLE subscriptions IS 'User subscriptions with optimized indexing';
COMMENT ON TABLE notifications IS 'User notifications with optimized indexing';
COMMENT ON TABLE branches IS 'Branch locations with optimized indexing';
COMMENT ON TABLE service_packages IS 'Service packages with optimized indexing';
COMMENT ON TABLE images IS 'Image storage with optimized indexing';
