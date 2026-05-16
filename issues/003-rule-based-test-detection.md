# Rule-Based Test Detection

## Parent

[PRD.md](../PRD.md)

## What to build

Scan diff for test files using pattern matching (*.test.*, *.spec.*, __tests__/). Flag if code changes exist but no test changes found. Output test detection results.

End-to-end: Developer runs `pr-ready` → sees "Tests found: 3 files" or "⚠️ No tests detected" → knows if tests are missing.

## Acceptance criteria

- [ ] Test file detection patterns implemented
- [ ] Patterns: *.test.ts, *.spec.ts, *.test.js, *.spec.js, __tests__/ directory
- [ ] Detect if source code changed but no tests changed
- [ ] Output shows test file count
- [ ] Warning flag if no tests and source code changed
- [ ] Ignore test-only changes (no warning)

## Blocked by

- [001-cli-scaffold-git-diff.md](001-cli-scaffold-git-diff.md)

## User stories covered

- US#4: Automatic test detection to know if tests forgotten