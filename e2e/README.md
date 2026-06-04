# E2E Tests with Playwright

End-to-end tests for the Community Hub web admin.

## Setup

```bash
cd e2e
npm install
npx playwright install --with-deps chromium
```

## Run Tests

```bash
# All tests
npm test

# With browser visible
npm run test:headed

# Specific test file
npx playwright test auth.spec.ts

# Specific test by name
npx playwright test --grep "should login"

# UI mode (interactive)
npm run test:ui

# Debug mode
npm run test:debug
```

## Configuration

Set env vars:

```bash
export BASE_URL=http://localhost:5173
export TEST_ADMIN_EMAIL=admin@community.com
export TEST_ADMIN_PASSWORD=admin123
```

## Test Structure

```
e2e/
├── tests/
│   ├── fixtures.ts          # Login/logout helpers
│   ├── auth.spec.ts         # Login, logout, redirects
│   ├── dashboard.spec.ts    # Dashboard, stats, navigation
│   ├── users.spec.ts        # User list, filters, actions
│   ├── payments.spec.ts     # Manual payment approval flow
│   └── responsive.spec.ts   # Mobile/tablet/desktop layouts
├── playwright.config.ts
└── package.json
```

## Pass Criteria

- ✅ Login works with valid credentials
- ✅ Logout clears auth and redirects
- ✅ Protected routes redirect to login
- ✅ Dashboard shows stat cards
- ✅ User filters work
- ✅ Manual payment approve/reject flows work
- ✅ Mobile layout adapts correctly

## CI Integration

Add to `.github/workflows/e2e.yml`:

```yaml
name: E2E
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: cd e2e && npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: e2e/playwright-report/
```

## Reports

After test run:
- HTML report: `npx playwright show-report`
- JSON results: `e2e/test-results/results.json`
- Traces: `e2e/test-results/`

## Debugging

```bash
# Run with browser + inspector
npx playwright test --debug

# Generate trace
npx playwright test --trace on

# View specific trace
npx playwright show-trace test-results/.../trace.zip
```

## Adding New Tests

1. Create a new file: `tests/<feature>.spec.ts`
2. Import `test, expect` and `login` from fixtures
3. Use `test.describe()` to group related tests
4. Use `test.beforeEach()` for shared setup
5. Use stable selectors: `getByRole`, `getByLabel`, `getByText`
6. Add `data-testid` attributes if needed
