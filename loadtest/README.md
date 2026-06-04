# Load Testing with k6

Stress test the Community Hub API to verify it can handle production traffic.

## Prerequisites

Install k6: https://k6.io/docs/getting-started/installation

```bash
# macOS
brew install k6

# Windows
choco install k6

# Linux (Debian/Ubuntu)
sudo apt-key adv --keyserver h.keyserver.ubuntu.com --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update && sudo apt-get install k6
```

## Test Scenarios

### 1. Smoke test (30 seconds, 5 users)
```bash
k6 run --vus 5 --duration 30s loadtest/api.js
```

### 2. Load test (ramp to 200 users)
```bash
k6 run loadtest/api.js
```

### 3. Stress test (spike to 500 users)
```bash
k6 run --vus 500 --duration 2m loadtest/api.js
```

### 4. Soak test (sustained 50 users for 1 hour)
```bash
k6 run --vus 50 --duration 1h loadtest/api.js
```

### 5. Custom load profile
```bash
# Set custom stages via env vars
k6 run \
  -e BASE_URL=https://api.communityhub.com \
  --out json=loadtest/results/run1.json \
  loadtest/api.js
```

## Pass Criteria (Thresholds)

The test will **PASS** if:
- ✅ HTTP request duration p95 < **500ms**
- ✅ HTTP request duration p99 < **1500ms**
- ✅ HTTP request error rate < **5%**
- ✅ Signup p95 < **1000ms**
- ✅ Signin p95 < **500ms**

## Setup Test Data

Before running load tests, create test users in your database:

```bash
# Via API
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "loadtest1@ch.com",
    "username": "loadtest1",
    "password": "LoadTest123!",
    "fullName": "Load Test 1"
  }'

# Repeat for loadtest2, loadtest3
```

## What the Test Does

### Stages
1. **Ramp up to 20** users (30s)
2. **Ramp to 50** (1m)
3. **Ramp to 100** (2m)
4. **Hold at 100** (3m) — typical production load
5. **Spike to 200** (1m) — stress
6. **Hold at 200** (2m) — sustained high
7. **Ramp down** (30s)

### Endpoints Tested
- `GET /api/health` — liveness check
- `GET /api/posts` — public read
- `GET /api/votes` — public read
- `GET /api/tickets` — public read
- `GET /api/manual-payments/instructions` — public read
- `GET /api/payments/my-payments` — authed
- `GET /api/tickets/my-tickets` — authed
- `GET /api/memberships/my` — authed
- `GET /api/notifications` — authed
- `POST /api/posts` — authed write (30% of iterations)

## Reading the Output

The output includes:
- **HTTP duration percentiles** (p50, p95, p99, max)
- **Request rate** (req/s)
- **Error rate**
- **Per-endpoint latencies**
- **Threshold pass/fail**

JSON results saved to `loadtest/results/summary.json` for trend analysis.

## Optimization Targets

If thresholds fail:

| Bottleneck | Action |
|------------|--------|
| DB CPU > 80% | Add connection pooling (PgBouncer) |
| API p95 > 500ms | Add Redis caching for public reads |
| Error rate > 5% | Check rate limits, increase timeouts |
| Memory leak | Profile with clinic.js or Node Clinic |
| Background jobs slow | Increase BullMQ workers, check Redis |

## CI Integration

Add to `.github/workflows/loadtest.yml`:

```yaml
name: Load Test
on: [workflow_dispatch]  # Manual trigger

jobs:
  loadtest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run k6
        run: |
          curl https://github.com/grafana/k6/releases/download/v0.49.0/k6-v0.49.0-linux-amd64.tar.gz -L | tar xvz --strip-components=1
          ./k6 run --vus 100 --duration 2m loadtest/api.js
```

## Cleanup

After tests:
```bash
# Delete test users
docker compose exec postgres psql -U postgres -d community_db -c \
  "DELETE FROM \"User\" WHERE email LIKE 'loadtest%';"
```

## Related

- Backend metrics: `/api/health/deep`
- Monitoring: Sentry, UptimeRobot
- Profiling: `clinic.js`, `0x` (Node)
