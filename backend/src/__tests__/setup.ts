// Jest test setup - runs before every test file
// Set test environment variables

process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/community_test_db';
process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
process.env.LOG_LEVEL = 'error';
process.env.SENTRY_DSN = ''; // Disable Sentry in tests

// Silence console output during tests
const originalLog = console.log;
const originalInfo = console.info;
const originalDebug = console.debug;

if (process.env.VERBOSE_TEST_LOGS !== 'true') {
  console.log = () => {};
  console.info = () => {};
  console.debug = () => {};
}

export function restoreConsole() {
  console.log = originalLog;
  console.info = originalInfo;
  console.debug = originalDebug;
}
