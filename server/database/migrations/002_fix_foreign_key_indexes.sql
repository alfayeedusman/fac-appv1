-- FIX: Add missing index on payment_uploads.user_id foreign key
-- This improves query performance for foreign key lookups
-- References: https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys

DROP INDEX IF EXISTS idx_payment_uploads_user_id;

CREATE INDEX idx_payment_uploads_user_id 
  ON payment_uploads(user_id);

COMMENT ON INDEX idx_payment_uploads_user_id 
  IS 'Performance index for payment_uploads.user_id foreign key lookups';
