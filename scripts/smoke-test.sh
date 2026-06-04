#!/usr/bin/env bash
# =====================================================================
# Community Hub - End-to-End Smoke Test
# =====================================================================
# Usage: ./scripts/smoke-test.sh [BASE_URL]
# Default: http://localhost:5000
# =====================================================================

set -e

BASE_URL="${1:-http://localhost:5000}"
API_URL="${BASE_URL}/api"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

PASS=0
FAIL=0

# =====================================================================
# Helpers
# =====================================================================
print_header() {
  echo ""
  echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
  echo -e "${CYAN}  $1${NC}"
  echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
}

test() {
  local name="$1"
  local cmd="$2"
  local expected="$3"

  result=$(eval "$cmd" 2>&1)
  status=$?

  if [ $status -eq 0 ] && [[ "$result" == *"$expected"* ]]; then
    echo -e "  ${GREEN}✓${NC} $name"
    ((PASS++))
  else
    echo -e "  ${RED}✗${NC} $name"
    echo "    Expected: $expected"
    echo "    Got: $result"
    ((FAIL++))
  fi
}

# =====================================================================
# 1. Health checks
# =====================================================================
print_header "1. Health Checks"

test "Health endpoint responds" \
  "curl -s -o /dev/null -w '%{http_code}' $API_URL/health" \
  "200"

test "Deep health endpoint" \
  "curl -s $API_URL/health/deep | grep -o '\"status\":\"[a-z]*\"' | head -1" \
  "ok"

test "API docs accessible" \
  "curl -s -o /dev/null -w '%{http_code}' $API_URL/docs" \
  "200"

# =====================================================================
# 2. Public endpoints
# =====================================================================
print_header "2. Public Endpoints"

test "List posts (no auth)" \
  "curl -s $API_URL/posts?page=1 | grep -o '\"success\":true'" \
  "true"

test "List tickets (no auth)" \
  "curl -s $API_URL/tickets | grep -o '\"success\":true'" \
  "true"

test "List votes (no auth)" \
  "curl -s $API_URL/votes?page=1 | grep -o '\"success\":true'" \
  "true"

test "Manual payment instructions (no auth)" \
  "curl -s $API_URL/manual-payments/instructions | grep -o '\"accounts\"'" \
  "accounts"

test "List memberships (no auth)" \
  "curl -s $API_URL/memberships | grep -o '\"success\":true'" \
  "true"

# =====================================================================
# 3. Authentication flow
# =====================================================================
print_header "3. Authentication"

# Generate random email for test
TEST_EMAIL="smoke-$(date +%s)@ch-test.com"
TEST_USERNAME="smoke$(date +%s)"

test "Sign up new user" \
  "curl -s -X POST $API_URL/auth/signup \
    -H 'Content-Type: application/json' \
    -d '{\"email\":\"$TEST_EMAIL\",\"username\":\"$TEST_USERNAME\",\"password\":\"SmokeTest123!\",\"fullName\":\"Smoke Test\"}' \
    | grep -o '\"accessToken\"'" \
  "accessToken"

# Save tokens
SIGNUP_RESPONSE=$(curl -s -X POST $API_URL/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL-2@ch.com\",\"username\":\"$TEST_USERNAME-2\",\"password\":\"SmokeTest123!\",\"fullName\":\"Smoke Test 2\"}")
ACCESS_TOKEN=$(echo "$SIGNUP_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
REFRESH_TOKEN=$(echo "$SIGNUP_RESPONSE" | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)

test "Sign in with credentials" \
  "curl -s -X POST $API_URL/auth/signin \
    -H 'Content-Type: application/json' \
    -d '{\"email\":\"$TEST_EMAIL\",\"password\":\"SmokeTest123!\"}' \
    | grep -o '\"accessToken\"'" \
  "accessToken"

test "Get current user (auth required)" \
  "curl -s $API_URL/auth/me -H 'Authorization: Bearer $ACCESS_TOKEN' | grep -o '\"email\":\"$TEST_EMAIL\"'" \
  "$TEST_EMAIL"

test "Reject unauthenticated /auth/me" \
  "curl -s -o /dev/null -w '%{http_code}' $API_URL/auth/me" \
  "401"

# =====================================================================
# 4. Authenticated operations
# =====================================================================
print_header "4. Authenticated Operations"

test "Get my payments" \
  "curl -s $API_URL/payments/my-payments -H 'Authorization: Bearer $ACCESS_TOKEN' | grep -o '\"success\":true'" \
  "true"

test "Get my tickets" \
  "curl -s $API_URL/tickets/my-tickets -H 'Authorization: Bearer $ACCESS_TOKEN' | grep -o '\"success\":true'" \
  "true"

test "Get my memberships" \
  "curl -s $API_URL/memberships/my -H 'Authorization: Bearer $ACCESS_TOKEN' | grep -o '\"success\":true'" \
  "true"

test "Get my notifications" \
  "curl -s $API_URL/notifications -H 'Authorization: Bearer $ACCESS_TOKEN' | grep -o '\"success\":true'" \
  "true"

test "Get unread count" \
  "curl -s $API_URL/notifications/unread-count -H 'Authorization: Bearer $ACCESS_TOKEN' | grep -o '\"count\"'" \
  "count"

# =====================================================================
# 5. Manual payment flow
# =====================================================================
print_header "5. Manual Payment Flow"

PAYMENT_RESPONSE=$(curl -s -X POST $API_URL/payments \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount":100,"currency":"ETB","method":"MANUAL"}')
PAYMENT_ID=$(echo "$PAYMENT_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

test "Create manual payment record" \
  "echo $PAYMENT_RESPONSE | grep -o '\"status\":\"PENDING\"'" \
  "PENDING"

test "Create test image for upload" \
  "echo 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' | base64 -d > /tmp/test-receipt.png && [ -f /tmp/test-receipt.png ]" \
  ""

if [ -f /tmp/test-receipt.png ]; then
  PROOF_RESPONSE=$(curl -s -X POST "$API_URL/manual-payments/$PAYMENT_ID/proof" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -F "receipt=@/tmp/test-receipt.png" \
    -F "senderName=Smoke Test" \
    -F "senderPhone=+251911223344" \
    -F "transactionRef=SMOKE123" \
    -F "paidAt=2026-06-04T10:00:00Z" \
    -F "notes=Smoke test")
  PROOF_ID=$(echo "$PROOF_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

  test "Submit proof of payment" \
    "echo $PROOF_RESPONSE | grep -o '\"status\":\"PENDING\"'" \
    "PENDING"

  test "Get my proofs" \
    "curl -s $API_URL/manual-payments/proofs/my -H 'Authorization: Bearer $ACCESS_TOKEN' | grep -o '\"id\"'" \
    "id"
fi

# =====================================================================
# 6. Rate limiting
# =====================================================================
print_header "6. Rate Limiting"

# Try 15 rapid signin attempts - should hit rate limit
test "Rate limiter blocks excessive signin attempts" \
  "for i in {1..15}; do curl -s -o /dev/null -X POST $API_URL/auth/signin -H 'Content-Type: application/json' -d '{\"email\":\"x@x.com\",\"password\":\"x\"}'; done; curl -s -X POST $API_URL/auth/signin -H 'Content-Type: application/json' -d '{\"email\":\"x@x.com\",\"password\":\"x\"}' -w '%{http_code}' | tail -c 4" \
  "429"

# =====================================================================
# 7. Security headers
# =====================================================================
print_header "7. Security"

test "Helmet sets X-Content-Type-Options" \
  "curl -sI $API_URL/health | grep -i 'x-content-type-options'" \
  "nosniff"

test "CORS headers present" \
  "curl -sI $API_URL/health -H 'Origin: http://localhost:5173' | grep -i 'access-control'" \
  "access-control"

test "Request ID header" \
  "curl -sI $API_URL/health | grep -i 'x-request-id'" \
  "x-request-id"

test "API version header" \
  "curl -sI $API_URL/health | grep -i 'x-api-version'" \
  "x-api-version"

# =====================================================================
# Summary
# =====================================================================
print_header "Smoke Test Results"
echo -e "  ${GREEN}Passed: $PASS${NC}"
echo -e "  ${RED}Failed: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}✅ All smoke tests passed — system is healthy${NC}"
  exit 0
else
  echo -e "${RED}❌ Some smoke tests failed — investigate before launch${NC}"
  exit 1
fi
