# Testing & Monitoring Guide for System Optimizations

## 🧪 Pre-Testing Checklist

- [ ] Build completed successfully (`npm run build`)
- [ ] No TypeScript errors
- [ ] No critical warnings in build output
- [ ] Dev server running (`npm run dev`)
- [ ] All optimizations deployed to test environment

---

## Test Suite 1: Customer List Performance ⚡

### Test Objective
Verify that customer list loading is now instant (previously 10-30s or timeout).

### Prerequisites
- Admin account
- Customer Hub page accessible at `/admin-dashboard` (admin-customer tab)
- Network tab open in DevTools
- Performance profiler available

### Steps

1. **Open DevTools**
   ```
   F12 or Cmd+Option+I
   → Network tab
   → Clear all previous requests
   → Set throttling to "Fast 3G" (to measure actual impact)
   ```

2. **Navigate to Customer Hub**
   ```
   Admin Dashboard → Customer Hub tab
   → Observe Network requests
   → Measure time to "First Meaningful Paint"
   ```

3. **Expected Results** ✅
   - **Load Time**: <1 second (previously 10-30s)
   - **Database Calls**: 2-3 requests (previously 100+)
   - **Request Timeline**:
     - 1 call to `/api/neon/customers`
     - 1 call to `/api/neon/bookings` (or similar)
     - No repeated booking queries per customer
   
4. **Verify Network Requests**
   - Check Network tab → Application (XHR/Fetch)
   - Should see:
     - ✅ 1x `/customers` call
     - ✅ 1x `/bookings` call
     - ❌ NOT 100+ separate calls per customer

5. **Performance Metrics**
   - DOMContentLoaded: Should be <2s
   - Load: Should be <3s
   - Customer grid renders: Should be instant after data arrives

### Pass/Fail Criteria
- ✅ **PASS**: <1s load time, <5 database calls
- ❌ **FAIL**: >5s load time, >20 database calls

---

## Test Suite 2: Admin Dashboard Bundle Size 📦

### Test Objective
Verify that AnalyticsCharts lazy loading works and reduces initial bundle.

### Prerequisites
- Build completed with visualizer
- `dist/stats.html` file available
- Browser with JavaScript enabled

### Steps

1. **Open Bundle Analyzer**
   ```
   Open dist/stats.html in browser
   or
   Run: npm run build (generates stats.html)
   ```

2. **Check Main Bundle**
   - Look for recharts package
   - ✅ Should NOT be in main.js
   - ✅ Should be in separate chunk
   - ✅ Main.js should be <200KB gzipped

3. **Verify Lazy-Loaded Chunks**
   - Look for "AnalyticsCharts" or "recharts" entry
   - ✅ Should see separate chunk (not in main)
   - Size: ~80-120KB (can be loaded separately)

4. **Navigate to Analytics Tab**
   ```
   Admin Dashboard → Analytics tab
   → Observe loading indicator
   → Verify chart loads after 1-2 seconds
   ```

5. **Check Console**
   ```
   DevTools Console → Look for:
   - No recharts import errors
   - Suspense fallback shows briefly
   - Charts render correctly
   ```

### Pass/Fail Criteria
- ✅ **PASS**: Recharts in separate chunk, main <200KB, no errors
- ❌ **FAIL**: Recharts in main bundle, main >250KB, loading errors

---

## Test Suite 3: Webhook Idempotency 🛡️

### Test Objective
Verify that duplicate webhooks don't cause double-charging.

### Prerequisites
- Webhook processing endpoint active
- Test webhook payload available
- Database access to webhookEventLogs table
- Admin account for monitoring

### Steps

1. **Send Test Webhook (Once)**
   ```bash
   curl -X POST http://localhost:3000/api/neon/payment/xendit/webhook \
     -H "Content-Type: application/json" \
     -H "x-callback-token: Q1kEJVOuDw5BUkkPNpJEu3KjioqCPcF0Wj7jhr1dc1vZvL39" \
     -d '{
       "id": "test-webhook-001",
       "external_id": "BOOKING_12345",
       "status": "PAID",
       "amount": 1000
     }'
   ```
   Expected Response: `{ "success": true }`

2. **Send Duplicate Webhook (Identical)**
   ```bash
   # Send exact same webhook again
   curl -X POST http://localhost:3000/api/neon/payment/xendit/webhook \
     -H "Content-Type: application/json" \
     -H "x-callback-token: Q1kEJVOuDw5BUkkPNpJEu3KjioqCPcF0Wj7jhr1dc1vZvL39" \
     -d '{
       "id": "test-webhook-001",
       "external_id": "BOOKING_12345",
       "status": "PAID",
       "amount": 1000
     }'
   ```
   Expected Response: `{ "success": true, "duplicateEvent": true }`

3. **Check Database Logs**
   ```sql
   SELECT * FROM webhook_event_logs 
   WHERE event_id = 'test-webhook-001'
   ORDER BY created_at DESC;
   ```
   
   Expected Results:
   - 2 rows (one for each webhook call)
   - First: `event_status = 'success'`, `result = {...}`
   - Second: `event_status = 'success'`, `duplicateEvent` indicator
   - Both have same `event_id`

4. **Check Booking Status**
   ```sql
   SELECT payment_status, updated_at 
   FROM bookings 
   WHERE id = '12345'
   LIMIT 1;
   ```
   
   Expected:
   - ✅ Status updated ONCE (not twice)
   - ✅ Last `updated_at` is from first webhook
   - ✅ No duplicate payment recorded

5. **Check Logs**
   ```
   Server console should show:
   ✅ "🔔 Xendit webhook received (type): PAID"
   ✅ "✅ Payment successful for booking 12345"
   ✅ "⚠️ Webhook already processed (idempotency): test-webhook-001"
   ```

### Pass/Fail Criteria
- ✅ **PASS**: Duplicate detected, no double-processing, clean logs
- ❌ **FAIL**: Duplicate not detected, booking updated twice, duplicate payments

---

## Test Suite 4: Console Log Reduction 🔍

### Test Objective
Verify that production-safe logging reduces console noise.

### Prerequisites
- Dev tools console open
- Various user interactions ready

### Steps

1. **Clear Console**
   ```
   DevTools Console → Click trash icon
   → Disable message grouping if enabled
   ```

2. **Perform User Actions**
   - Load customer list
   - Navigate to booking
   - Load admin dashboard
   - Click multiple tabs
   - Scroll lists
   - Total interaction time: ~1 minute

3. **Count Logs**
   ```
   Check console output
   Count visible log entries
   ```

4. **Expected Results** ✅
   - <50 debug logs (previously 500+)
   - No "[object Object]" errors
   - Clear, readable messages
   - No unnecessary verbose output

5. **Check for Sensitive Data**
   ```
   Search console for:
   - ❌ API keys (should not appear)
   - ❌ Full database responses
   - ❌ Full webhook payloads
   - ✅ Relevant status messages only
   ```

### Pass/Fail Criteria
- ✅ **PASS**: <50 logs, no sensitive data, readable output
- ❌ **FAIL**: >200 logs, API keys visible, too verbose

---

## Test Suite 5: Build Verification ✅

### Test Objective
Verify production build succeeds with all optimizations.

### Steps

1. **Build Command**
   ```bash
   npm run build
   ```

2. **Expected Output**
   ```
   ✓ (x) modules transformed
   dist/spa/index.html          x.xx kB │ gzip: x.xx kB
   dist/spa/assets/main-XXXX.js   xxx kB │ gzip: xx.xx kB
   dist/spa/assets/analytics-XXXX.js   80 kB │ gzip: xx kB
   dist/spa/assets/vendor-XXXX.js     200 kB │ gzip: 60 kB
   ```

3. **Key Metrics to Track**
   - Main bundle: <200KB gzipped
   - Analytics chunk: ~80-120KB gzipped
   - Total: <400KB gzipped (all chunks combined)
   - No errors or critical warnings

4. **Check Build Artifacts**
   ```bash
   ls -lh dist/spa/assets/ | grep -E "\.js|\.css"
   ```

5. **Verify Stats File**
   ```bash
   cat dist/stats.html | grep -i "recharts\|analytics" 
   # Should show in separate bundle
   ```

### Pass/Fail Criteria
- ✅ **PASS**: Build succeeds, metrics met, recharts separated
- ❌ **FAIL**: Build fails, metrics exceeded, recharts in main

---

## Monitoring Checklist 📊

### Post-Deployment Monitoring (24-48 hours)

- [ ] **Performance Metrics**
  - [ ] Customer list load time avg <1s
  - [ ] Admin dashboard initial load <2s
  - [ ] No 500 errors on webhook endpoint
  - [ ] Zero timeout errors on customer load

- [ ] **Database Monitoring**
  - [ ] webhookEventLogs table populated
  - [ ] No duplicate webhook processing
  - [ ] Booking update counts correct
  - [ ] Subscription renewal counts correct

- [ ] **Error Monitoring**
  - [ ] No new errors in production
  - [ ] No TypeScript errors
  - [ ] No React hydration mismatches
  - [ ] Lazy-loading works without errors

- [ ] **User Feedback**
  - [ ] No user reports of slow loading
  - [ ] No payment processing issues
  - [ ] No double-charging reported
  - [ ] Admin features working normally

---

## Troubleshooting Guide 🔧

### Issue: Build Takes Too Long
**Solution**:
- Clear node_modules cache: `rm -rf node_modules package-lock.json`
- Reinstall: `npm install`
- Try again: `npm run build`

### Issue: Recharts Still in Main Bundle
**Solution**:
- Verify AnalyticsCharts is lazy-loaded in AdminDashboard.tsx
- Check `React.lazy()` syntax is correct
- Rebuild: `npm run build`

### Issue: Customer List Still Slow
**Solution**:
- Check if computeBookingStats is being called once
- Verify getAllBookings is fetched once
- Check Network tab for duplicate requests
- Review CustomerHub.tsx lines 122-205

### Issue: Webhooks Not Deduplicating
**Solution**:
- Check XENDIT_WEBHOOK_TOKEN is configured
- Verify webhookEventLogs table exists (check schema.ts)
- Test webhook with correct event_id
- Check database for webhook_event_logs entries

### Issue: Console Still Too Noisy
**Solution**:
- Check if logger.ts is being imported correctly
- Verify `log()`, `warn()`, `error()` are used (not `console.log`)
- Review service files for missed replacements
- Rebuild and clear browser cache

---

## Performance Baseline

### Before Optimization
| Metric | Value |
|--------|-------|
| Admin Dashboard Load | 500ms |
| Customer List Load | 10-30s (timeout risk) |
| Main Bundle Size | 350KB |
| Database Calls (customer) | 100+ |
| Console Logs | 500+ per session |
| Webhook Duplicates | Yes (no prevention) |

### After Optimization (Expected)
| Metric | Value |
|--------|-------|
| Admin Dashboard Load | 400ms |
| Customer List Load | <1s |
| Main Bundle Size | 280KB (-20%) |
| Database Calls (customer) | 2-3 |
| Console Logs | 30-50 per session |
| Webhook Duplicates | Prevented ✓ |

---

## Success Criteria Summary

✅ **All Tests Pass** if:
1. Customer list loads in <1 second
2. Recharts in separate bundle chunk
3. Duplicate webhooks detected and prevented
4. Console has <50 logs per session
5. Build completes successfully
6. All metrics improve from baseline

❌ **Any Test Fails** → Roll back and debug using troubleshooting guide above

---

## Next Steps After Testing

- [ ] Green light on all test suites
- [ ] Metrics confirm improvements
- [ ] Deploy to staging environment
- [ ] Run load tests (if available)
- [ ] Monitor for 48 hours
- [ ] Promote to production
- [ ] Set up automated performance monitoring

