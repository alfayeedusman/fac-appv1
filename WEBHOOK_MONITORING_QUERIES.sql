-- Webhook Event Log Monitoring Queries
-- Use these queries to monitor webhook idempotency and processing

-- =============================================================================
-- 1. VIEW ALL WEBHOOK EVENTS (Most Recent First)
-- =============================================================================

SELECT 
    event_id,
    provider,
    external_id,
    event_type,
    event_status,
    processing_time_ms,
    processed_at,
    error_message,
    created_at
FROM webhook_event_logs
ORDER BY created_at DESC
LIMIT 50;


-- =============================================================================
-- 2. CHECK FOR DUPLICATE WEBHOOKS (Idempotency Verification)
-- =============================================================================

-- Find events that were processed more than once (should not happen if idempotency works)
SELECT 
    event_id,
    COUNT(*) as occurrence_count,
    MIN(created_at) as first_received,
    MAX(created_at) as last_received,
    EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) as seconds_between
FROM webhook_event_logs
GROUP BY event_id
HAVING COUNT(*) > 1
ORDER BY occurrence_count DESC;

-- Expected result: Empty (no duplicates)
-- If results appear, idempotency may not be working


-- =============================================================================
-- 3. FAILED WEBHOOK PROCESSING
-- =============================================================================

-- Find webhooks that failed processing
SELECT 
    event_id,
    provider,
    external_id,
    event_type,
    error_message,
    payload,
    processed_at
FROM webhook_event_logs
WHERE event_status = 'failure'
ORDER BY processed_at DESC
LIMIT 20;


-- =============================================================================
-- 4. WEBHOOK PROCESSING PERFORMANCE
-- =============================================================================

-- Analyze webhook processing times
SELECT 
    provider,
    event_type,
    COUNT(*) as total_events,
    AVG(processing_time_ms) as avg_time_ms,
    MIN(processing_time_ms) as min_time_ms,
    MAX(processing_time_ms) as max_time_ms,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY processing_time_ms) as p95_time_ms
FROM webhook_event_logs
WHERE event_status = 'success'
GROUP BY provider, event_type
ORDER BY avg_time_ms DESC;


-- =============================================================================
-- 5. BOOKING PAYMENT WEBHOOK TRACKING
-- =============================================================================

-- Track all booking payment webhooks
SELECT 
    event_id,
    external_id,
    event_type,
    event_status,
    processing_time_ms,
    result,
    processed_at
FROM webhook_event_logs
WHERE external_id LIKE 'BOOKING_%'
ORDER BY processed_at DESC
LIMIT 50;


-- =============================================================================
-- 6. SUBSCRIPTION PAYMENT WEBHOOK TRACKING
-- =============================================================================

-- Track all subscription renewal webhooks
SELECT 
    event_id,
    external_id,
    event_type,
    event_status,
    processing_time_ms,
    result,
    processed_at
FROM webhook_event_logs
WHERE external_id LIKE 'SUBSCRIPTION_%'
ORDER BY processed_at DESC
LIMIT 50;


-- =============================================================================
-- 7. WEBHOOK EVENT SUMMARY DASHBOARD
-- =============================================================================

-- Get a summary dashboard of webhook health
WITH event_summary AS (
    SELECT 
        provider,
        event_status,
        COUNT(*) as total,
        COUNT(DISTINCT external_id) as unique_payments,
        ROUND(AVG(processing_time_ms), 2) as avg_time_ms,
        COUNT(CASE WHEN error_message IS NOT NULL THEN 1 END) as errors
    FROM webhook_event_logs
    GROUP BY provider, event_status
)
SELECT 
    provider,
    event_status,
    total,
    unique_payments,
    avg_time_ms,
    errors,
    ROUND(100.0 * errors / total, 2) as error_rate_percent
FROM event_summary
ORDER BY provider, event_status;


-- =============================================================================
-- 8. VERIFY PAYMENT PROCESSING MATCHES WEBHOOKS
-- =============================================================================

-- Cross-check: Booking payment status should match webhook status
SELECT 
    b.id as booking_id,
    b.payment_status,
    COUNT(w.event_id) as webhook_count,
    MAX(w.processed_at) as last_webhook,
    MAX(b.updated_at) as booking_updated
FROM bookings b
LEFT JOIN webhook_event_logs w ON b.id = REPLACE(w.external_id, 'BOOKING_', '')
WHERE b.payment_status = 'completed'
GROUP BY b.id, b.payment_status
ORDER BY b.updated_at DESC
LIMIT 20;

-- Expected: Each completed booking should have 1 PAID webhook


-- =============================================================================
-- 9. VERIFY SUBSCRIPTION PROCESSING MATCHES WEBHOOKS
-- =============================================================================

-- Cross-check: Subscription renewal should match webhook status
SELECT 
    s.id as subscription_id,
    s.status,
    s.usage_count,
    COUNT(w.event_id) as webhook_count,
    MAX(w.processed_at) as last_webhook,
    MAX(s.updated_at) as subscription_updated
FROM package_subscriptions s
LEFT JOIN webhook_event_logs w ON s.id = REPLACE(w.external_id, 'SUBSCRIPTION_', '')
WHERE s.status = 'active'
GROUP BY s.id, s.status, s.usage_count
ORDER BY s.updated_at DESC
LIMIT 20;

-- Expected: Active subscriptions should have matching renewal webhooks


-- =============================================================================
-- 10. WEBHOOK EVENT LOG CLEANUP (For Testing - Archive Old Records)
-- =============================================================================

-- Archive old webhook events (keep last 30 days)
-- CAUTION: Only run after verifying data
/*
DELETE FROM webhook_event_logs
WHERE created_at < NOW() - INTERVAL '30 days'
AND event_status = 'success';

-- Or just view how many would be deleted
SELECT COUNT(*) as records_to_delete
FROM webhook_event_logs
WHERE created_at < NOW() - INTERVAL '30 days'
AND event_status = 'success';
*/


-- =============================================================================
-- 11. REAL-TIME WEBHOOK MONITORING (Last Hour)
-- =============================================================================

-- Monitor webhooks received in the last hour
SELECT 
    EXTRACT(HOUR FROM processed_at) as hour,
    event_status,
    COUNT(*) as count,
    ROUND(AVG(processing_time_ms), 2) as avg_time_ms
FROM webhook_event_logs
WHERE processed_at > NOW() - INTERVAL '1 hour'
GROUP BY EXTRACT(HOUR FROM processed_at), event_status
ORDER BY hour DESC, event_status;


-- =============================================================================
-- 12. WEBHOOK TOKEN VERIFICATION (Security Check)
-- =============================================================================

-- Check for unauthorized webhook attempts (if IP logging was enabled)
-- This would require additional logging; for now, verify event logs only contain valid events
SELECT 
    event_id,
    event_status,
    error_message,
    created_at
FROM webhook_event_logs
WHERE event_status = 'failure'
AND error_message LIKE '%Unauthorized%'
ORDER BY created_at DESC;

-- Expected: Should be empty if webhook token validation is working correctly


-- =============================================================================
-- INTERPRETATION GUIDE
-- =============================================================================

/*

EXPECTED RESULTS:

1. Duplicate Check (Query 2):
   ✅ Empty result set - Each event_id appears only once
   ❌ Results found - Duplicates exist, idempotency may have failed

2. Failed Webhooks (Query 3):
   ✅ Empty result set - All webhooks processed successfully
   ⚠️  Few entries - Normal, investigate error_message
   ❌ Many entries - Check error patterns

3. Processing Time (Query 4):
   ✅ p95_time_ms < 100ms - Good performance
   ⚠️  p95_time_ms 100-500ms - Acceptable
   ❌ p95_time_ms > 500ms - Performance issue

4. Payment Matching (Queries 8-9):
   ✅ webhook_count = 1 for each completed payment - Correct
   ❌ webhook_count = 0 - Webhook not received
   ❌ webhook_count > 1 - Duplicates processed (idempotency failed!)

5. Recent Activity (Query 11):
   ✅ Regular webhook arrivals
   ⚠️  Gaps in activity - Check if Xendit is sending webhooks
   ❌ Only failures - Something is wrong

*/
