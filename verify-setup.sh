#!/bin/bash

# Verification script to test the setup
# Usage: bash verify-setup.sh [local|netlify]

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ENVIRONMENT="${1:-local}"
if [ "$ENVIRONMENT" = "local" ]; then
  BASE_URL="http://localhost:8080"
elif [ "$ENVIRONMENT" = "netlify" ]; then
  BASE_URL="https://facapptest.netlify.app"
else
  echo -e "${RED}Usage: bash verify-setup.sh [local|netlify]${NC}"
  exit 1
fi

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  FAC App - Setup Verification${NC}"
echo -e "${BLUE}  Environment: $ENVIRONMENT${NC}"
echo -e "${BLUE}  Base URL: $BASE_URL${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

# Function to test endpoint
test_endpoint() {
  local name=$1
  local method=$2
  local endpoint=$3
  local expected_status=$4
  local data=$5

  echo -n "Testing $name... "
  
  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" \
      -H "Content-Type: application/json" \
      -d "$data" \
      "$BASE_URL$endpoint")
  fi

  status=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [ "$status" = "$expected_status" ]; then
    echo -e "${GREEN}✓ (HTTP $status)${NC}"
    return 0
  else
    echo -e "${RED}✗ (Expected $expected_status, got $status)${NC}"
    echo "  Response: $body" | head -c 100
    echo ""
    return 1
  fi
}

# Test connectivity
echo -e "${YELLOW}1. Basic Connectivity${NC}"
echo -n "  Checking if server is reachable... "
if curl -s "$BASE_URL" > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC}"
else
  echo -e "${RED}✗ Server not reachable at $BASE_URL${NC}"
  echo -e "${YELLOW}  Make sure: npm run dev${NC}"
  exit 1
fi
echo ""

# Test API endpoints
echo -e "${YELLOW}2. API Endpoints${NC}"
test_endpoint "Health check" "GET" "/api/health" "200"
test_endpoint "Database test" "GET" "/api/neon/test" "200"
test_endpoint "Database diagnostics" "GET" "/api/neon/diagnose" "200"
test_endpoint "Initialize DB" "POST" "/api/neon/init" "200" "{}"
echo ""

# Test authentication endpoints
echo -e "${YELLOW}3. Authentication Endpoints${NC}"
test_endpoint "Login (invalid)" "POST" "/api/neon/auth/login" "400" \
  '{"email":"test@example.com","password":""}'
test_endpoint "Register endpoint" "POST" "/api/neon/auth/register" "400" \
  '{"email":"","password":""}'
echo ""

# Test booking endpoints
echo -e "${YELLOW}4. Booking Endpoints${NC}"
test_endpoint "Get bookings" "GET" "/api/neon/bookings" "200"
test_endpoint "Get garage settings" "GET" "/api/neon/bookings/garage-settings" "200"
test_endpoint "Check availability" "GET" "/api/neon/bookings/availability?date=2024-01-25&timeSlot=09:00&branch=tumaga" "200"
echo ""

# Test other critical endpoints
echo -e "${YELLOW}5. Other Critical Endpoints${NC}"
test_endpoint "Get branches" "GET" "/api/neon/branches" "200"
test_endpoint "Get customers" "GET" "/api/neon/customers" "200"
test_endpoint "Get notifications" "GET" "/api/neon/notifications?userId=test&userRole=user" "200"
echo ""

# Summary
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Verification Complete!${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Key Information:${NC}"
echo "  Base URL: $BASE_URL"
echo "  API Prefix: /api/neon/"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Test login: POST /api/neon/auth/login with valid credentials"
echo "  2. Check database: GET /api/neon/diagnose"
echo "  3. Create booking: POST /api/neon/bookings"
echo ""
echo -e "${YELLOW}Troubleshooting:${NC}"
if [ "$ENVIRONMENT" = "local" ]; then
  echo "  - Ensure 'npm run dev' is running"
  echo "  - Check NEON_DATABASE_URL is set in environment"
  echo "  - View server logs in terminal"
else
  echo "  - Check Netlify Functions logs in dashboard"
  echo "  - Verify environment variables in Netlify settings"
  echo "  - Check Neon database connection"
fi
echo ""
