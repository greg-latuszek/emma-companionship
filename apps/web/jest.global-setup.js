// Global setup for integration tests
// This runs once before all test suites

module.exports = async () => {
  console.log('🧪 Setting up integration test environment...');
  
  // Set environment variables for testing
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = process.env.DATABASE_URL_TEST || 'postgresql://emma_user_test:emma_password_test@localhost:5433/emma_companionship_test';
  process.env.NEXTAUTH_SECRET = 'test-secret-for-integration-tests';
  process.env.NEXTAUTH_URL = 'http://localhost:3000';
  
  console.log('✅ Integration test environment configured');
};
