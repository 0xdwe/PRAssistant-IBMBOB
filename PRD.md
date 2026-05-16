# PR Readiness Assistant - Product Requirements Document

## Problem Statement

Developers waste time on repetitive pre-PR tasks: summarizing changes, verifying tests exist, writing PR descriptions, identifying risks, and creating reviewer checklists. This manual work is error-prone and slows down the development workflow.

## Solution

PR Readiness Assistant analyzes git branch diffs and automatically generates a comprehensive "PR packet" containing:
- Human-readable change summary
- Files grouped by purpose
- Test evidence verification
- Risk flags
- Reviewer checklist

Delivered as both CLI tool and VS Code extension for maximum flexibility.

## User Stories

1. As a developer, I want to run a single command to analyze my branch changes, so that I don't waste time manually reviewing diffs
2. As a developer, I want automatic change summaries, so that I can quickly understand what I modified
3. As a developer, I want files grouped by purpose (feature/refactor/fix), so that reviewers understand the change structure
4. As a developer, I want automatic test detection, so that I know if I forgot to add tests
5. As a developer, I want optional test execution, so that I can verify tests pass before opening PR
6. As a developer, I want risk flags for dangerous changes (DB schema, auth, config), so that I can highlight them to reviewers
7. As a developer, I want LLM-enhanced analysis, so that I get semantic understanding of my changes
8. As a developer, I want rule-based fallback, so that the tool works even without LLM API access
9. As a developer, I want output saved to markdown file, so that I can review and edit before posting
10. As a developer, I want output copied to clipboard, so that I can paste directly into GitHub PR
11. As a developer, I want to compare any two branches, so that I can analyze different scenarios
12. As a developer, I want auto-detection of upstream branch, so that I don't need to specify it every time
13. As a developer, I want project-specific configuration, so that I can customize behavior per repo
14. As a developer, I want monorepo support, so that I can see which packages are affected
15. As a developer, I want to use OpenAI, Anthropic, or local LLM, so that I have flexibility in AI provider
16. As a developer, I want cached analysis results, so that I don't pay for duplicate LLM calls
17. As a developer, I want smart truncation for large diffs, so that the tool works even with massive changes
18. As a developer, I want clear error messages, so that I know exactly what went wrong
19. As a VS Code user, I want a sidebar panel, so that I can view PR packet without leaving editor
20. As a VS Code user, I want command palette integration, so that I can trigger analysis with keyboard shortcuts
21. As a VS Code user, I want status bar indicator, so that I can see analysis progress at a glance
22. As a VS Code user, I want click-to-copy sections, so that I can selectively copy parts of the PR packet
23. As a reviewer, I want a generated checklist, so that I know what to verify
24. As a reviewer, I want context-specific checklist items, so that the checklist matches the actual changes
25. As a team lead, I want consistent PR descriptions, so that all PRs follow the same format
26. As a team lead, I want risk visibility, so that I can prioritize review of dangerous changes
27. As a CI/CD engineer, I want CLI tool, so that I can integrate into automated workflows
28. As an open source maintainer, I want free local LLM option, so that I don't pay API costs
29. As a developer, I want npm global install, so that I can use the tool in any project
30. As a developer, I want comprehensive help text, so that I can learn all available options

## Implementation Decisions

### Architecture
- **Monorepo structure**: `packages/cli`, `packages/extension`, `packages/shared`
- **CLI first approach**: Build core logic in CLI, extension wraps it
- **TypeScript**: Type safety for complex analysis logic
- **Shared types package**: Common interfaces between CLI and extension

### Core Modules

**GitDiffExtractor**
- Interface: `extractDiff(options: DiffOptions): Promise<GitDiff>`
- Uses `simple-git` library
- Supports current vs base, auto-detect upstream, custom branch pairs
- Returns structured diff with file paths, changes, metadata

**RuleBasedAnalyzer**
- Interface: `analyze(diff: GitDiff): RuleAnalysis`
- File categorization by directory structure
- Risk detection patterns (schema, auth, config, large refactor)
- Test file detection (*.test.*, *.spec.*, __tests__/)
- No external dependencies, fast execution

**LLMProvider** (adapter pattern)
- Interface: `analyze(diff: GitDiff, prompt: string): Promise<LLMAnalysis>`
- Implementations: OpenAIProvider, AnthropicProvider, OllamaProvider
- Handles API calls, retries, error handling
- Smart truncation when diff exceeds context limits

**HybridAnalyzer**
- Interface: `analyze(diff: GitDiff, options: AnalysisOptions): Promise<Analysis>`
- Combines rule-based + optional LLM
- Merges results intelligently
- Falls back gracefully if LLM fails

**PRPacketGenerator**
- Interface: `generate(analysis: Analysis): PRPacket`
- Formats markdown sections: summary, files, tests, risks, checklist
- Template-based with dynamic LLM enhancements
- Customizable via config

**OutputHandler**
- Interface: `output(packet: PRPacket, options: OutputOptions): Promise<void>`
- Writes to `.pr-ready.md` file
- Copies to system clipboard
- Both operations by default

**ConfigManager**
- Interface: `loadConfig(cwd: string): Config`
- Checks `package.json` "prReady" field first
- Falls back to `.pr-ready.json`
- Merges with CLI flags (flags override config)

**CacheManager**
- Interface: `get(key: string): CachedAnalysis | null`, `set(key: string, value: CachedAnalysis): void`
- Key = hash of diff content
- Stores in `.pr-ready-cache/` directory
- No TTL (invalidate manually or on config change)

**MonorepoDetector**
- Interface: `detectPackages(diff: GitDiff): string[]`
- Finds affected packages from changed file paths
- Supports common monorepo structures (Lerna, Nx, Turborepo, pnpm workspaces)

**SmartTruncator**
- Interface: `truncate(diff: GitDiff, maxTokens: number): GitDiff`
- Skips generated files (package-lock.json, dist/, build/)
- Prioritizes source code over config
- Preserves file structure context

### CLI Interface
```bash
pr-ready [options]

Options:
  --base <branch>       Base branch to compare against (default: auto-detect)
  --head <branch>       Head branch with changes (default: current)
  --llm <provider>      LLM provider: openai|anthropic|ollama|none (default: none)
  --test                Run tests and include results
  --no-cache            Skip cache lookup
  --config <path>       Custom config file path
  --output <path>       Custom output file path
  --no-clipboard        Skip clipboard copy
  --help                Show help
  --version             Show version
```

### VS Code Extension
- **Activation**: On workspace open if git repo detected
- **Commands**: 
  - `prReady.analyze` - Run analysis
  - `prReady.configure` - Open config
  - `prReady.copySection` - Copy specific section
- **Sidebar panel**: Webview showing PR packet with copy buttons
- **Status bar**: Shows "PR Ready: Analyzing..." / "PR Ready: ✓" / "PR Ready: ✗"
- **Extension imports CLI**: Direct code sharing via monorepo

### Configuration Schema
```json
{
  "prReady": {
    "llm": {
      "provider": "openai",
      "apiKey": "${OPENAI_API_KEY}",
      "model": "gpt-4"
    },
    "test": {
      "command": "npm test",
      "patterns": ["*.test.ts", "*.spec.ts"]
    },
    "risks": {
      "patterns": ["migrations/", "auth/", "*.config.js"]
    },
    "output": {
      "file": ".pr-ready.md",
      "clipboard": true
    },
    "monorepo": {
      "enabled": true,
      "packages": ["packages/*"]
    }
  }
}
```

### Technical Decisions
- **npm only**: Simplest package manager support for MVP
- **Strict error handling**: Fail fast with clear messages, no silent failures
- **Cache by diff hash**: SHA-256 of diff content as cache key
- **Smart truncation over chunking**: Prioritize important files vs splitting
- **Monorepo detection**: Parse workspace config files automatically

## Testing Decisions

### What Makes a Good Test
- Test external behavior, not implementation details
- Mock external dependencies (git, LLM APIs, filesystem)
- Use real git repos for integration tests (fixtures in `test/fixtures/`)
- Test error paths explicitly
- Avoid testing private methods

### Modules to Test

**Unit Tests** (all modules):
- GitDiffExtractor: Mock `simple-git`, test branch detection, diff parsing
- RuleBasedAnalyzer: Test categorization logic, risk patterns, test detection
- LLMProvider: Mock API calls, test error handling, truncation
- HybridAnalyzer: Mock both analyzers, test merging logic
- PRPacketGenerator: Test markdown formatting, section generation
- ConfigManager: Test config loading, merging, validation
- CacheManager: Mock filesystem, test cache hit/miss
- MonorepoDetector: Test package detection from file paths
- SmartTruncator: Test file prioritization, token counting

**Integration Tests**:
- End-to-end CLI flow with real git repos (no LLM)
- Config loading from different sources
- Output file + clipboard writing
- Monorepo package detection

**E2E Tests**:
- Full CLI execution with mocked LLM
- Extension activation and command execution
- Sidebar panel rendering

### Prior Art
- Look at existing test patterns in TypeScript CLI tools
- Use Jest for test runner
- Use `memfs` for filesystem mocking
- Use `nock` for HTTP mocking (LLM APIs)

## Out of Scope

- GitHub API integration (auto-create PR) - future enhancement
- Multiple package manager support (yarn, pnpm) - future enhancement
- Graceful degradation on LLM failure - strict mode only for MVP
- Custom LLM prompt templates - fixed prompts for MVP
- Diff visualization UI - text output only
- Real-time analysis as you code - manual trigger only
- Integration with other git platforms (GitLab, Bitbucket) - GitHub focus
- Advanced monorepo features (dependency graphs) - basic detection only
- Internationalization - English only
- Telemetry/analytics - privacy-first, no tracking

## Further Notes

### Development Workflow
1. Build CLI core first (weeks 1-3)
2. Add LLM integration (week 4)
3. Build VS Code extension (week 5)
4. Testing and polish (week 6)
5. Documentation and examples (week 7)

### Success Metrics
- Time saved per PR (target: 5-10 minutes)
- Adoption rate in team
- PR description quality improvement
- Reduction in "forgot to add tests" comments

### Future Enhancements
- GitHub Action for automated PR comments
- Slack/Discord integration for team notifications
- Custom risk pattern DSL
- PR template auto-population
- Diff visualization with syntax highlighting
- Multi-language support for summaries
- Integration with issue trackers (Jira, Linear)