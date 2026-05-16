import { describe, it, expect, jest } from '@jest/globals';
import { TestExecutor } from '../test-executor';

describe('TestExecutor', () => {
  let executor: TestExecutor;

  beforeEach(() => {
    executor = new TestExecutor();
  });

  describe('executeTests', () => {
    it('should execute test command and parse results', async () => {
      const result = await executor.executeTests('echo "Tests: 5 passed, 5 total"', 5000);

      expect(result.passed).toBe(true);
      expect(result.totalTests).toBe(5);
      expect(result.passedTests).toBe(5);
      expect(result.failedTests).toBe(0);
      expect(result.duration).toBeGreaterThan(0);
    });

    it('should detect failed tests', async () => {
      const result = await executor.executeTests(
        'echo "Tests: 2 failed, 8 passed, 10 total" && exit 1',
        5000
      );

      expect(result.passed).toBe(false);
      expect(result.totalTests).toBe(10);
      expect(result.passedTests).toBe(8);
      expect(result.failedTests).toBe(2);
    });

    it('should handle Jest output format', async () => {
      const jestOutput = `
        Test Suites: 2 passed, 2 total
        Tests:       10 passed, 10 total
        Snapshots:   0 total
        Time:        2.5s
      `;
      const result = await executor.executeTests(`echo "${jestOutput}"`, 5000);

      expect(result.totalTests).toBeGreaterThan(0);
      expect(result.passed).toBe(true);
    });

    it('should handle timeout', async () => {
      const result = await executor.executeTests('sleep 10', 100);

      expect(result.passed).toBe(false);
      expect(result.error).toBeDefined();
    }, 10000);

    it('should handle command not found', async () => {
      const result = await executor.executeTests('nonexistentcommand', 5000);

      expect(result.passed).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should parse npm test output', async () => {
      const npmOutput = 'npm test -- --passWithNoTests';
      const result = await executor.executeTests(npmOutput, 5000);

      expect(result).toBeDefined();
      expect(result.duration).toBeGreaterThan(0);
    });
  });

  describe('parseTestOutput', () => {
    it('should parse various test output formats', () => {
      const outputs = [
        'Tests: 5 passed, 5 total',
        'Test Suites: 2 passed, 2 total\nTests: 10 passed, 10 total',
        '✓ 15 tests passed',
      ];

      outputs.forEach(output => {
        const result = executor['parseTestOutput'](output, true, 0);
        expect(result.totalTests).toBeGreaterThan(0);
      });
    });

    it('should handle empty output', () => {
      const result = executor['parseTestOutput']('', true, 0);
      expect(result.totalTests).toBe(0);
      expect(result.passed).toBe(true);
    });
  });
});

// Made with Bob
