-- CRITICAL: Enable Row Level Security on migrations_log table
-- This prevents unauthorized access to migration history

-- Enable RLS on migrations_log table
ALTER TABLE IF EXISTS migrations_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "migrations_log_select_policy" ON migrations_log;
DROP POLICY IF EXISTS "migrations_log_insert_policy" ON migrations_log;
DROP POLICY IF EXISTS "migrations_log_update_policy" ON migrations_log;

-- Policy to allow authenticated users to view migration history (read-only)
CREATE POLICY "migrations_log_select_policy" ON migrations_log
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy to allow service role to insert migration records
CREATE POLICY "migrations_log_insert_policy" ON migrations_log
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy to allow service role to update migration records
CREATE POLICY "migrations_log_update_policy" ON migrations_log
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE migrations_log IS 'Tracks all executed database migrations for idempotency and auditing. RLS enabled for security.';
