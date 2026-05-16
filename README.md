# PR Readiness Assistant

Automated PR readiness analysis tool that generates comprehensive PR packets from git diffs.

## Features

✅ **Automatic Git Diff Analysis** - Extracts and analyzes changes between branches  
✅ **Smart File Categorization** - Groups files by purpose (frontend, backend, tests, config, docs)  
✅ **Test Detection** - Identifies test files and warns if tests are missing  
✅ **Risk Assessment** - Flags high-risk changes (DB migrations, auth, dependencies)  
✅ **PR Packet Generation** - Creates markdown-formatted PR descriptions  
✅ **Clipboard Integration** - Automatically copies output for easy pasting  
✅ **Configurable** - Customize via package.json or .pr-ready.json  

## Installation

```bash
npm install
npm run build
```

## Usage

### Basic Usage

```bash
# Analyze current branch against auto-detected upstream
node packages/cli/dist/cli.js

# Compare specific branches
node packages/cli/dist/cli.js --base main --head feature-branch

# Skip clipboard copy
node packages/cli/dist/cli.js --no-clipboard

# Custom output file
node packages/cli/dist/cli.js --output my-pr.md
```

### CLI Options

```
Options:
  -V, --version     output the version number
  --base <branch>   Base branch to compare against (default: auto-detect)
  --head <branch>   Head branch with changes (default: current)
  --llm <provider>  LLM provider: openai|anthropic|ollama|none (default: none)
  --test            Run tests and include results
  --no-cache        Skip cache lookup
  --config <path>   Custom config file path
  --output <path>   Custom output file path
  --no-clipboard    Skip clipboard copy
  -h, --help        display help for command
```

## Configuration

Add configuration to your `package.json`:

```json
{
  "prReady": {
    "llm": {
      "provider": "none"
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
    }
  }
}
```

Or create a `.pr-ready.json` file:

```json
{
  "llm": {
    "provider": "none"
  },
  "output": {
    "file": ".pr-ready.md",
    "clipboard": true
  }
}
```

## Output Example

The tool generates a comprehensive PR packet with:

- **Summary** - High-level overview of changes
- **Change Details** - Branch info, file count, line changes
- **Files Changed** - Categorized file list with emojis
- **Test Coverage** - Test file detection and warnings
- **Risk Assessment** - High/medium/low risk flags
- **Reviewer Checklist** - Context-specific review items

Example output:

```markdown
# PR Readiness Report

## Summary

This PR modifies **16 file(s)** across **4 categories**. Changes include: config (5), docs (1), packages (9), root (1).

## Files Changed

### ⚙️ Configuration (5)
- `package.json`
- `packages/cli/tsconfig.json`

### 🧪 Tests (3)
- `tests/analyzer.test.ts`

## Risk Assessment

### 🔴 High Risk
- **`package.json`**: Package dependencies changed

### 🟡 Medium Risk
- **`migrations/001_add_users.sql`**: Database schema change
```

## Project Structure

```
PRAssistant-IBMBOB/
├── packages/
│   ├── cli/              # CLI tool
│   │   ├── src/
│   │   │   ├── cli.ts                    # CLI entry point
│   │   │   ├── git-diff-extractor.ts     # Git diff extraction
│   │   │   ├── rule-based-analyzer.ts    # File categorization & analysis
│   │   │   ├── pr-packet-generator.ts    # Markdown generation
│   │   │   ├── output-handler.ts         # File & clipboard output
│   │   │   └── config-manager.ts         # Configuration loading
│   │   └── package.json
│   └── shared/           # Shared types
│       ├── src/
│       │   └── types.ts  # TypeScript interfaces
│       └── package.json
├── issues/               # Issue specifications
├── PRD.md               # Product requirements
└── README.md            # This file
```

## Development

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Build specific package
npm run build -w @pr-ready/cli

# Watch mode for development
npm run dev -w @pr-ready/cli
```

## Implementation Status

✅ **Core CLI (Issues 001-007)** - Complete
- CLI scaffold with git diff extraction
- Rule-based file categorization
- Test detection
- Risk detection
- PR packet markdown generation
- Clipboard output
- Config system

🚧 **Future Enhancements (Issues 008-020)**
- LLM integration (OpenAI, Anthropic, Ollama)
- Hybrid analyzer (rule-based + LLM)
- Smart truncation for large diffs
- Cache layer
- Test execution
- Reviewer checklist generation
- Monorepo detection
- VS Code extension
- Comprehensive documentation

## License

MIT