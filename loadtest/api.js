// k6 Load Test: Community Hub API
// Usage:
//   k6 run loadtest/api.js
//   k6 run --vus 100 --duration 5m loadtest/api.js
//   k6 run --out json=results.json loadtest/api.js
//
// Install k6: https://k6.io/docs/getting-started/installation

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

// =====================================================================
// Custom metrics
// =====================================================================
const errorRate = new Rate('errors');
const signupDuration = new Trend('signup_duration');
const signinDuration = new Trend('signin_duration');
const postsFetchDuration = new Trend('posts_fetch_duration');
const votesFetchDuration = new Trend('votes_fetch_duration');
const ticketsFetchDuration = new Trend('tickets_fetch_duration');
const totalRequests = new Counter('total_requests');

// =====================================================================
// Test configuration
// =====================================================================
export const options = {
  // Stages simulate ramping load
  stages: [
    { duration: '30s', target: 20 },   // Ramp up to 20 users
    { duration: '1m', target: 50 },    // Ramp up to 50
    { duration: '2m', target: 100 },   // Ramp up to 100
    { duration: '3m', target: 100 },   // Stay at 100
    { duration: '1m', target: 200 },   // Stress: spike to 200
    { duration: '2m', target: 200 },   // Hold at 200
    { duration: '30s', target: 0 },    // Ramp down
  ],

  // Thresholds (pass criteria)
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1500'],  // 95% under 500ms
    http_req_failed: ['rate<0.05'],                    // < 5% errors
    errors: ['rate<0.05'],
    signup_duration: ['p(95)<1000'],
    signin_duration: ['p(95)<500'],
  },
};

// =====================================================================
// Test data
// =====================================================================
const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';
const TEST_PASSWORD = 'LoadTest123!';

const TEST_USERS = [
  { email: 'loadtest1@ch.com', username: 'loadtest1' },
  { email: 'loadtest2@ch.com', username: 'loadtest2' },
  { email: 'loadtest3@ch.com', username: 'loadtest3' },
];

// Pre-created test users in the database
let authToken = '';

// =====================================================================
// Setup: Create test users (runs once)
// =====================================================================
export function setup() {
  console.log(`Running load test against ${BASE_URL}`);

  // Sign in as one of the pre-seeded test users
  const res = http.post(
    `${BASE_URL}/api/auth/signin`,
    JSON.stringify({ email: TEST_USERS[0].email, password: TEST_PASSWORD }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  if (res.status !== 200) {
    console.warn(`Setup: failed to sign in test user: ${res.status}. Tests may fail.`);
    return { token: '' };
  }

  const token = res.json('data.accessToken') || '';
  console.log(`Setup: obtained auth token (${token.substring(0, 20)}...)`);
  return { token };
}

// =====================================================================
// Main test scenario
// =====================================================================
export default function (data) {
  const token = data.token || authToken;

  // ==================================================================
  // Health check (no auth)
  // ==================================================================
  group('Health Check', () => {
    const res = http.get(`${BASE_URL}/api/health`);
    totalRequests.add(1);
    check(res, {
      'health 200': (r) => r.status === 200,
      'health has status': (r) => r.json('status') === 'ok',
    });
  });

  sleep(0.5);

  // ==================================================================
  // Public reads (no auth)
  // ==================================================================
  group('Public Reads', () => {
    // Fetch posts
    const startPosts = Date.now();
    const postsRes = http.get(`${BASE_URL}/api/posts?page=1&limit=20`);
    postsFetchDuration.add(Date.now() - startPosts);
    totalRequests.add(1);
    check(postsRes, {
      'posts 200': (r) => r.status === 200,
      'posts has data': (r) => Array.isArray(r.json('data')),
    });
    errorRate.add(postsRes.status !== 200);

    // Fetch votes
    const startVotes = Date.now();
    const votesRes = http.get(`${BASE_URL}/api/votes?page=1&limit=20`);
    votesFetchDuration.add(Date.now() - startVotes);
    totalRequests.add(1);
    check(votesRes, {
      'votes 200': (r) => r.status === 200,
    });
    errorRate.add(votesRes.status !== 200);

    // Fetch tickets
    const startTickets = Date.now();
    const ticketsRes = http.get(`${BASE_URL}/api/tickets`);
    ticketsFetchDuration.add(Date.now() - startTickets);
    totalRequests.add(1);
    check(ticketsRes, {
      'tickets 200': (r) => r.status === 200,
    });
    errorRate.add(ticketsRes.status !== 200);
  });

  sleep(1);

  // ==================================================================
  // Authenticated reads
  // ==================================================================
  if (token) {
    group('Authenticated Reads', () => {
      const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

      // Get my payments
      const myRes = http.get(`${BASE_URL}/api/payments/my-payments`, authHeaders);
      totalRequests.add(1);
      check(myRes, {
        'my payments 200': (r) => r.status === 200,
      });

      // Get my tickets
      const myTicketsRes = http.get(`${BASE_URL}/api/tickets/my-tickets`, authHeaders);
      totalRequests.add(1);
      check(myTicketsRes, {
        'my tickets 200': (r) => r.status === 200,
      });

      // Get my memberships
      const myMembershipsRes = http.get(`${BASE_URL}/api/memberships/my`, authHeaders);
      totalRequests.add(1);
      check(myMembershipsRes, {
        'my memberships 200': (r) => r.status === 200,
      });

      // Get my notifications
      const notifRes = http.get(`${BASE_URL}/api/notifications`, authHeaders);
      totalRequests.add(1);
      check(notifRes, {
        'notifications 200': (r) => r.status === 200,
      });
    });
  }

  sleep(1);

  // ==================================================================
  // Write operations (lower frequency)
  // ==================================================================
  if (token && Math.random() < 0.3) {  // Only 30% of iterations
    group('Write Operations', () => {
      const authHeaders = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      // Create a post
      const postRes = http.post(
        `${BASE_URL}/api/posts`,
        JSON.stringify({
          type: 'TEXT',
          content: `Load test post at ${new Date().toISOString()}`,
          hashtags: 'loadtest',
        }),
        authHeaders
      );
      totalRequests.add(1);
      check(postRes, {
        'post create 201': (r) => r.status === 201,
      });
      errorRate.add(postRes.status !== 201);

      // Like a random post
      if (Math.random() < 0.5) {
        const likeRes = http.post(
          `${BASE_URL}/api/posts/cl-test-post-id/like`,
          null,
          authHeaders
        );
        totalRequests.add(1);
        // Expect 404 (test post doesn't exist) - just testing endpoint reachability
        check(likeRes, {
          'like endpoint reachable': (r) => r.status !== 500,
        });
      }
    });

    sleep(2);
  }

  // ==================================================================
  // Manual payment instructions (cached, low cost)
  // ==================================================================
  group('Manual Payment Public', () => {
    const res = http.get(`${BASE_URL}/api/manual-payments/instructions`);
    totalRequests.add(1);
    check(res, {
      'instructions 200': (r) => r.status === 200,
      'has accounts': (r) => r.json('data.accounts') !== undefined,
    });
  });

  sleep(0.5);
}

// =====================================================================
// Stress test: Spike test (200 users for 1 minute)
// =====================================================================
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: '  ', enableColors: true }),
    'loadtest/results/summary.json': JSON.stringify(data, null, 2),
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';
  const colors = options.enableColors;

  const c = (code, text) => colors ? `\x1b[${code}m${text}\x1b[0m` : text;
  const green = (t) => c('32', t);
  const red = (t) => c('31', t);
  const yellow = (t) => c('33', t);
  const cyan = (t) => c('36', t);
  const bold = (t) => c('1', t);

  const lines = [];
  lines.push(bold(cyan('╔════════════════════════════════════════════════════════════╗')));
  lines.push(bold(cyan('║          Community Hub - Load Test Results                  ║')));
  lines.push(bold(cyan('╚════════════════════════════════════════════════════════════╝')));
  lines.push('');

  const m = data.metrics;
  lines.push(`${indent}${bold('Test Duration:')}    ${data.state.testRunDurationMs}ms`);
  lines.push(`${indent}${bold('Virtual Users:')}    ${m.vus?.values?.value || 0}`);
  lines.push(`${indent}${bold('Total Requests:')}   ${m.total_requests?.values?.count || 0}`);
  lines.push('');

  lines.push(bold(cyan('HTTP Metrics:')));
  lines.push(`${indent}  Duration p95:    ${(m.http_req_duration?.values?.['p(95)'] || 0).toFixed(2)}ms`);
  lines.push(`${indent}  Duration p99:    ${(m.http_req_duration?.values?.['p(99)'] || 0).toFixed(2)}ms`);
  lines.push(`${indent}  Failed:          ${((m.http_req_failed?.values?.rate || 0) * 100).toFixed(2)}%`);
  lines.push(`${indent}  Waiting p95:     ${(m.http_req_waiting?.values?.['p(95)'] || 0).toFixed(2)}ms`);
  lines.push('');

  lines.push(bold(cyan('Endpoint Latencies (p95):')));
  lines.push(`${indent}  Signup:          ${(m.signup_duration?.values?.['p(95)'] || 0).toFixed(2)}ms`);
  lines.push(`${indent}  Signin:          ${(m.signin_duration?.values?.['p(95)'] || 0).toFixed(2)}ms`);
  lines.push(`${indent}  Posts fetch:     ${(m.posts_fetch_duration?.values?.['p(95)'] || 0).toFixed(2)}ms`);
  lines.push(`${indent}  Votes fetch:     ${(m.votes_fetch_duration?.values?.['p(95)'] || 0).toFixed(2)}ms`);
  lines.push(`${indent}  Tickets fetch:   ${(m.tickets_fetch_duration?.values?.['p(95)'] || 0).toFixed(2)}ms`);
  lines.push('');

  // Thresholds
  const thresholds = data.root_group?.checks || [];
  let allPassed = true;
  for (const [name, threshold] of Object.entries(m)) {
    if (threshold.thresholds) {
      for (const [tName, tResult] of Object.entries(threshold.thresholds)) {
        const status = tResult.ok ? green('✓ PASS') : red('✗ FAIL');
        lines.push(`${indent}${status}  ${name}: ${tName}`);
        if (!tResult.ok) allPassed = false;
      }
    }
  }

  lines.push('');
  if (allPassed) {
    lines.push(green(bold('✅ All thresholds PASSED — system is production-ready')));
  } else {
    lines.push(red(bold('❌ Some thresholds FAILED — investigate before launch')));
  }

  return lines.join('\n');
}
