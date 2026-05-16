# Test Execution

## Parent

[PRD.md](../PRD.md)

## What to build

Run test command from config when --test flag provided. Capture test results (pass/fail, count). Include in PR packet. Verify tests pass before PR.

End-to-end: Developer runs `pr-ready --test` → tool runs `npm test` → captures results → PR packet shows "✓ All tests passed (42 tests)" or "✗ 3 tests failed".

## Acceptance criteria

- [ ] Test execution module created
- [ ] Read test command from config (default: "npm test")
- [ ] Execute test command using child_process
- [ ] Capture stdout/stderr
- [ ] Parse test results (pass/fail count)
- [ ] Timeout handling (5min default, configurable)
- [ ] Include results in PR packet
- [ ] --test flag to enable
- [ ] Error if tests fail (exit code 1)
- [ ] Support common test runners: Jest, Mocha, Vitest

## Blocked by

- [003-rule-based-test-detection.md](003-rule-based-test-detection.md)
- [007-config-system.md](007-config-system.md)

## User stories covered

- US#5: Optional test execution to verify tests pass