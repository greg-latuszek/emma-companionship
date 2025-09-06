// Global teardown for integration tests
// This runs once after all test suites complete

module.exports = async () => {
  console.log('🧹 Cleaning up integration test environment...');
  
  // Any cleanup tasks can be added here
  // For example: close database connections, clean up test data, etc.
  
  console.log('✅ Integration test cleanup completed');
};
