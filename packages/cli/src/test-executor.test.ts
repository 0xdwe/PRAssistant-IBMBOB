import { TestExecutor } from './test-executor';

async function testExecutor() {
  const executor = new TestExecutor();
  
  console.log('Testing TestExecutor...\n');
  
  // Test 1: Simple echo command (should pass)
  console.log('Test 1: Running simple command...');
  try {
    const result = await executor.executeTests('echo "Tests: 5 passed, 5 total"', 5000);
    console.log('✓ Command executed successfully');
    console.log(`  Passed: ${result.passed}`);
    console.log(`  Total: ${result.totalTests}`);
    console.log(`  Duration: ${result.duration}ms\n`);
  } catch (error) {
    console.error('✗ Test 1 failed:', error);
  }
  
  // Test 2: Jest-like output
  console.log('Test 2: Testing Jest output parsing...');
  try {
    const result = await executor.executeTests(
      'echo "Tests: 2 failed, 8 passed, 10 total"',
      5000
    );
    console.log('✓ Jest output parsed');
    console.log(`  Total: ${result.totalTests}`);
    console.log(`  Passed: ${result.passedTests}`);
    console.log(`  Failed: ${result.failedTests}\n`);
  } catch (error) {
    console.error('✗ Test 2 failed:', error);
  }
  
  // Test 3: Mocha-like output
  console.log('Test 3: Testing Mocha output parsing...');
  try {
    const result = await executor.executeTests(
      'echo "15 passing (234ms)"',
      5000
    );
    console.log('✓ Mocha output parsed');
    console.log(`  Total: ${result.totalTests}`);
    console.log(`  Passed: ${result.passedTests}\n`);
  } catch (error) {
    console.error('✗ Test 3 failed:', error);
  }
  
  console.log('All tests completed!');
}

testExecutor().catch(console.error);

// Made with Bob