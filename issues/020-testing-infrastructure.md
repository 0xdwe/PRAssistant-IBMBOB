# Testing Infrastructure + Core Tests

## Parent

[PRD.md](../PRD.md)

## What to build

Complete test suite: unit tests for all modules, integration tests for CLI flows, E2E tests for extension. Jest setup, mocking strategies, test fixtures.

End-to-end: Developer runs `npm test` → all tests pass → CI runs tests on PR → quality assured.

## Acceptance criteria

- [ ] Jest configured for monorepo
- [ ] Unit tests for: GitDiffExtractor, RuleBasedAnalyzer, LLMProviders, HybridAnalyzer, PRPacketGenerator, ConfigManager, CacheManager, MonorepoDetector, SmartTruncator
- [ ] Mock simple-git for git operations
- [ ] Mock LLM API calls with nock
- [ ] Mock filesystem with memfs
- [ ] Integration tests: full CLI flow with real git repos (fixtures)
- [ ] E2E tests: extension activation, commands
- [ ] Test coverage >80%
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Pre-commit hooks with lint + test

## Blocked by

- [001-cli-scaffold-git-diff.md](001-cli-scaffold-git-diff.md)
- [002-rule-based-file-categorization.md](002-rule-based-file-categorization.md)
- [003-rule-based-test-detection.md](003-rule-based-test-detection.md)
- [004-rule-based-risk-detection.md](004-rule-based-risk-detection.md)
- [005-basic-pr-packet-markdown.md](005-basic-pr-packet-markdown.md)
- [006-clipboard-output.md](006-clipboard-output.md)
- [007-config-system.md](007-config-system.md)
- [008-openai-llm-provider.md](008-openai-llm-provider.md)
- [009-hybrid-analyzer.md](009-hybrid-analyzer.md)
- [010-smart-truncation.md](010-smart-truncation.md)
- [011-cache-layer.md](011-cache-layer.md)
- [012-test-execution.md](012-test-execution.md)
- [013-reviewer-checklist.md](013-reviewer-checklist.md)
- [014-monorepo-detection.md](014-monorepo-detection.md)
- [015-anthropic-provider.md](015-anthropic-provider.md)
- [016-ollama-provider.md](016-ollama-provider.md)

## User stories covered

- Quality assurance for all features