
import { spawn } from 'child_process';
import { TestResult } from '@pr-ready/shared';

export class TestExecutor {
  private readonly DEFAULT_TIMEOUT = 300000; // 5 minutes

  /**
   * Execute test command and capture results
   */
  async executeTests(
    command: string = 'npm test',
    timeout: number = this.DEFAULT_TIMEOUT,
    cwd: string = process.cwd()
  ): Promise<TestResult> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      let stdout = '';
      let stderr = '';

      // Parse command into executable and args
      const [cmd, ...args] = command.split(' ');

      const child = spawn(cmd, args, {
        cwd,
        shell: true,
        env: { ...process.env, CI: 'true' }, // Set CI mode for cleaner output
      });

      // Capture stdout
      child.stdout?.on('data', (data) => {
        const output = data.toString();
        stdout += output;
      });

      // Capture stderr
      child.stderr?.on('data', (data) => {
        const output = data.toString();
        stderr += output;
      });

      // Set timeout
      const timeoutId = setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error(`Test execution timed out after ${timeout}ms`));
      }, timeout);

      // Handle process completion
      child.on('close', (code) => {
        clearTimeout(timeoutId);
        const duration = Date.now() - startTime;
        const output = stdout + stderr;

        try {
          const result = this.parseTestOutput(output, code === 0, duration);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      // Handle process errors
      child.on('error', (error) => {
        clearTimeout(timeoutId);
        reject(new Error(`Failed to execute test command: ${error.message}`));
      });
    });
  }

  /**
   * Parse test output from various test runners (Jest, Mocha, Vitest)
   */
  private parseTestOutput(output: string, passed: boolean, duration: number): TestResult {
    // Try Jest format first
    const jestResult = this.parseJestOutput(output);
    if (jestResult) {
      return { ...jestResult, passed, duration, output };
    }

    // Try Mocha format
    const mochaResult = this.parseMochaOutput(output);
    if (mochaResult) {
      return { ...mochaResult, passed, duration, output };
    }

    // Try Vitest format
    const vitestResult = this.parseVitestOutput(output);
    if (vitestResult) {
      return { ...vitestResult, passed, duration, output };
    }

    // Fallback: basic parsing
    return this.parseFallbackOutput(output, passed, duration);
  }

  /**
   * Parse Jest output format
   * Example: "Tests: 2 failed, 3 passed, 5 total"
   */
  private parseJestOutput(output: string): Omit<TestResult, 'passed' | 'duration' | 'output'> | null {
    const jestPattern = /Tests:\s+(?:(\d+)\s+failed,?\s*)?(?:(\d+)\s+passed,?\s*)?(?:(\d+)\s+skipped,?\s*)?(\d+)\s+total/i;
    const match = output.match(jestPattern);

    if (match) {
      const failed = parseInt(match[1] || '0', 10);
      const passed = parseInt(match[2] || '0', 10);
      const skipped = parseInt(match[3] || '0', 10);
      const total = parseInt(match[4], 10);

      return {
        totalTests: total,
        passedTests: passed,
        failedTests: failed,
        skippedTests: skipped > 0 ? skipped : undefined,
        error: failed > 0 ? `${failed} test(s) failed` : undefined,
      };
    }

    return null;
  }

  /**
   * Parse Mocha output format
   * Example: "5 passing (123ms)" or "3 passing, 2 failing"
   */
  private parseMochaOutput(output: string): Omit<TestResult, 'passed' | 'duration' | 'output'> | null {
    const passingPattern = /(\d+)\s+passing/i;
    const failingPattern = /(\d+)\s+failing/i;
    const pendingPattern = /(\d+)\s+pending/i;

    const passingMatch = output.match(passingPattern);
    const failingMatch = output.match(failingPattern);
    const pendingMatch = output.match(pendingPattern);

    if (passingMatch || failingMatch) {
      const passed = passingMatch ? parseInt(passingMatch[1], 10) : 0;
      const failed = failingMatch ? parseInt(failingMatch[1], 10) : 0;
      const skipped = pendingMatch ? parseInt(pendingMatch[1], 10) : 0;
      const total = passed + failed + skipped;

      return {
        totalTests: total,
        passedTests: passed,
        failedTests: failed,
        skippedTests: skipped > 0 ? skipped : undefined,
        error: failed > 0 ? `${failed} test(s) failed` : undefined,
      };
    }

    return null;
  }

  /**
   * Parse Vitest output format
   * Example: "Test Files  2 passed (2)" or "Tests  5 passed | 2 failed (7)"
   */
  private parseVitestOutput(output: string): Omit<TestResult, 'passed' | 'duration' | 'output'> | null {
    const vitestPattern = /Tests\s+(?:(\d+)\s+passed)?(?:\s*\|\s*(\d+)\s+failed)?(?:\s*\|\s*(\d+)\s+skipped)?(?:\s*\((\d+)\))?/i;
    const match = output.match(vitestPattern);

    if (match) {
      const passed = parseInt(match[1] || '0', 10);
      const failed = parseInt(match[2] || '0', 10);
      const skipped = parseInt(match[3] || '0', 10);
      const total = parseInt(match[4] || (passed + failed + skipped).toString(), 10);

      return {
        totalTests: total,
        passedTests: passed,
        failedTests: failed,
        skippedTests: skipped > 0 ? skipped : undefined,
        error: failed > 0 ? `${failed} test(s) failed` : undefined,
      };
    }

    return null;
  }

  /**
   * Fallback parser when specific format not detected
   */
  private parseFallbackOutput(output: string, passed: boolean, duration: number): TestResult {
    // Try to extract any numbers that might indicate test counts
    const numberPattern = /(\d+)\s+test/gi;
    const matches = Array.from(output.matchAll(numberPattern));
    
    let totalTests = 0;
    if (matches.length > 0) {
      // Use the last number found as it's often the total
      totalTests = parseInt(matches[matches.length - 1][1], 10);
    }

    return {
      passed,
      totalTests,
      passedTests: passed ? totalTests : 0,
      failedTests: passed ? 0 : totalTests,
      duration,
      output,
      error: passed ? undefined : 'Tests failed (unable to parse detailed results)',
    };
  }
}
