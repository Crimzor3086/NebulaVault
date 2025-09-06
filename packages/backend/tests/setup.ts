import { initializeDatabase, closeDatabase } from '../src/config/database';

// Setup test environment
beforeAll(async () => {
  // Initialize test database
  await initializeDatabase();
});

// Cleanup after tests
afterAll(async () => {
  await closeDatabase();
});

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.DATABASE_URL = ':memory:';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.ZERO_G_ENDPOINT = 'https://test-api.0g.ai';
process.env.ZERO_G_API_KEY = 'test-api-key';
