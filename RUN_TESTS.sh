#!/bin/bash
# FAC App - Optimization Testing Script
# This script guides you through all test suites

set -e

echo "=========================================="
echo "FAC App Optimization Testing Suite"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function for test results
test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $2"
        ((TESTS_FAILED++))
    fi
}

# Check if build exists
if [ ! -f "dist/stats.html" ]; then
    echo -e "${YELLOW}⚠️  Warning: dist/stats.html not found${NC}"
    echo "Run 'npm run build' first to generate bundle statistics"
    echo ""
fi

echo -e "${BLUE}═══ Test Suite 1: Build Verification ═══${NC}"
echo ""

# Test 1.1: Check if build completed
if [ -f "dist/spa/index.html" ]; then
    echo -e "${GREEN}✅ Build output exists${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ Build output missing${NC}"
    ((TESTS_FAILED++))
fi

# Test 1.2: Check bundle size
if [ -f "dist/spa/assets/"main*.js ]; then
    SIZE=$(du -sh dist/spa/assets/ | awk '{print $1}')
    echo -e "${GREEN}✅ Bundle size: $SIZE${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ Bundle files not found${NC}"
    ((TESTS_FAILED++))
fi

echo ""
echo -e "${BLUE}═══ Test Suite 2: Browser Testing ═══${NC}"
echo ""
echo "Manual Tests Required (use TESTING_AND_MONITORING_GUIDE.md):"
echo ""
echo "1. Customer List Performance Test"
echo "   - Open Admin Dashboard → Customer Hub"
echo "   - Measure load time (should be <1 second)"
echo "   - Check Network tab (should have 2-3 requests, not 100+)"
echo ""
echo "2. Analytics Bundle Test"
echo "   - Open Admin Dashboard → Analytics tab"
echo "   - Verify charts load after 1-2 seconds"
echo "   - Check console for no errors"
echo ""
echo "3. Webhook Idempotency Test"
echo "   - Send duplicate webhook requests"
echo "   - Verify booking updated only once"
echo "   - Check webhookEventLogs table"
echo ""
echo "4. Console Log Reduction"
echo "   - Open DevTools console"
echo "   - Perform user actions for 1 minute"
echo "   - Count logs (should be <50, previously 500+)"
echo ""

echo -e "${BLUE}═══ Database Checks ═══${NC}"
echo ""

# Check if webhookEventLogs table exists (if we have database access)
if command -v psql &> /dev/null; then
    echo "Checking webhook event logs table..."
    # This would require DB credentials, so we'll just show the query
    echo "Run this SQL query to verify webhook logging:"
    echo "  SELECT COUNT(*) FROM webhook_event_logs;"
    echo "  SELECT event_id, event_status FROM webhook_event_logs LIMIT 5;"
else
    echo "⚠️  PostgreSQL client not available for database checks"
fi

echo ""
echo -e "${BLUE}═══ Test Results Summary ═══${NC}"
echo ""
echo -e "✅ Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "❌ Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}All automated tests passed! ✨${NC}"
    echo "Complete manual testing using TESTING_AND_MONITORING_GUIDE.md"
    exit 0
else
    echo -e "${RED}Some tests failed. Review output above.${NC}"
    exit 1
fi
