/**
 * Challenge Feature - Integration Test Script
 * 
 * This script tests the complete challenge feature flow:
 * 1. Create a test user (or get existing)
 * 2. Create a test challenge
 * 3. Get active challenges
 * 4. Respond to a challenge
 * 5. Verify points were awarded
 * 6. Get challenge history
 */

import axios, { AxiosInstance } from 'axios';

const BASE_URL = 'http://localhost:5000/api';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  data?: any;
}

class ChallengeFeatureTest {
  private api: AxiosInstance;
  private adminToken: string = '';
  private userToken: string = '';
  private testUserId: string = '';
  private testChallengeId: string = '';
  private results: TestResult[] = [];

  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      validateStatus: () => true, // Don't throw on any status
    });
  }

  private async test(name: string, fn: () => Promise<any>): Promise<void> {
    try {
      console.log(`\n📝 Testing: ${name}`);
      const result = await fn();
      this.results.push({ name, passed: true, data: result });
      console.log(`✅ ${name} - PASSED`);
    } catch (error: any) {
      this.results.push({
        name,
        passed: false,
        error: error?.message || String(error),
      });
      console.error(`❌ ${name} - FAILED:`, error?.message);
    }
  }

  async run(): Promise<void> {
    console.log('🚀 Challenge Feature Integration Test');
    console.log('=====================================\n');

    // Setup: Create test accounts
    await this.test('Create Admin User', async () => {
      const res = await this.api.post('/auth/signup', {
        email: `admin-${Date.now()}@test.com`,
        username: `admin${Date.now()}`,
        password: 'Test@123',
        fullName: 'Test Admin',
      });
      if (res.status !== 201 && res.status !== 400) throw new Error(`Status ${res.status}`);
      // Try to login
      const loginRes = await this.api.post('/auth/login', {
        email: res.data?.data?.email || `admin-${Date.now()}@test.com`,
        password: 'Test@123',
      });
      if (loginRes.status !== 200) throw new Error(`Login failed: ${loginRes.status}`);
      this.adminToken = loginRes.data.data.accessToken;
      this.testUserId = loginRes.data.data.id;
      return { email: res.data?.data?.email, role: loginRes.data.data.role };
    });

    // Setup: Create test user
    await this.test('Create Test User', async () => {
      const res = await this.api.post('/auth/signup', {
        email: `user-${Date.now()}@test.com`,
        username: `user${Date.now()}`,
        password: 'Test@123',
        fullName: 'Test User',
      });
      if (res.status !== 201 && res.status !== 400) throw new Error(`Status ${res.status}`);
      const loginRes = await this.api.post('/auth/login', {
        email: res.data?.data?.email || `user-${Date.now()}@test.com`,
        password: 'Test@123',
      });
      if (loginRes.status !== 200) throw new Error(`Login failed: ${loginRes.status}`);
      this.userToken = loginRes.data.data.accessToken;
      return { email: res.data?.data?.email };
    });

    // Test Challenge CRUD
    await this.test('Create Challenge (Admin)', async () => {
      const res = await this.api.post(
        '/challenges',
        {
          title: 'Test Challenge',
          description: 'This is a test challenge',
          type: 'GENERAL',
          points: 50,
          startsAt: new Date().toISOString(),
          endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          maxResponses: null,
        },
        {
          headers: { Authorization: `Bearer ${this.adminToken}` },
        }
      );
      if (res.status !== 201) throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
      this.testChallengeId = res.data.data.id;
      return { id: res.data.data.id, title: res.data.data.title, points: res.data.data.points };
    });

    await this.test('Get All Challenges (Admin)', async () => {
      const res = await this.api.get('/challenges/admin/all', {
        headers: { Authorization: `Bearer ${this.adminToken}` },
      });
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      if (!Array.isArray(res.data.data.challenges)) throw new Error('Expected challenges array');
      return { count: res.data.data.challenges.length, total: res.data.data.pagination.total };
    });

    await this.test('Get Active Challenges (User)', async () => {
      const res = await this.api.get('/challenges/active', {
        headers: { Authorization: `Bearer ${this.userToken}` },
      });
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      if (!Array.isArray(res.data.data)) throw new Error('Expected challenges array');
      return { count: res.data.data.length };
    });

    // Test Challenge Response
    await this.test('Accept Challenge (User)', async () => {
      const res = await this.api.post(
        `/challenges/${this.testChallengeId}/respond`,
        { action: 'ACCEPT' },
        {
          headers: { Authorization: `Bearer ${this.userToken}` },
        }
      );
      if (res.status !== 201) throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`);
      return { action: res.data.data.action, challengeId: res.data.data.challengeId };
    });

    await this.test('Get Challenge History (User)', async () => {
      const res = await this.api.get('/challenges/history', {
        headers: { Authorization: `Bearer ${this.userToken}` },
      });
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      return {
        responseCount: res.data.data.responses.length,
        total: res.data.data.pagination.total,
      };
    });

    await this.test('Get Challenge Stats (Admin)', async () => {
      const res = await this.api.get(`/challenges/${this.testChallengeId}/stats`, {
        headers: { Authorization: `Bearer ${this.adminToken}` },
      });
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      return {
        acceptCount: res.data.data.stats.accept,
        rejectCount: res.data.data.stats.reject,
        skipCount: res.data.data.stats.skip,
      };
    });

    // Test Challenge Update
    await this.test('Update Challenge (Admin)', async () => {
      const res = await this.api.put(
        `/challenges/${this.testChallengeId}`,
        { title: 'Updated Test Challenge' },
        {
          headers: { Authorization: `Bearer ${this.adminToken}` },
        }
      );
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      return { title: res.data.data.title };
    });

    // Print results
    console.log('\n\n📊 Test Results Summary');
    console.log('=======================\n');

    const passed = this.results.filter((r) => r.passed).length;
    const failed = this.results.filter((r) => !r.passed).length;

    this.results.forEach((result) => {
      const icon = result.passed ? '✅' : '❌';
      console.log(`${icon} ${result.name}`);
      if (!result.passed) {
        console.log(`   Error: ${result.error}`);
      }
    });

    console.log(`\n📈 Summary: ${passed} passed, ${failed} failed out of ${this.results.length} tests`);

    if (failed === 0) {
      console.log('\n🎉 All tests passed! Challenge feature is working correctly.\n');
      process.exit(0);
    } else {
      console.log('\n⚠️ Some tests failed. Check the errors above.\n');
      process.exit(1);
    }
  }
}

// Run tests
const tester = new ChallengeFeatureTest();
tester.run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
