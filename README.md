# PR Readiness Assistant

> Automated PR readiness analysis tool that generates comprehensive PR packets from git diffs.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

## 🚀 Features

- **🔍 Automatic Git Diff Analysis** - Extracts and analyzes changes between branches or uncommitted changes
- **📁 Smart File Categorization** - Groups files by purpose (frontend, backend, tests, config, docs)
- **🧪 Test Detection** - Identifies test files and warns if tests are missing
- **⚠️ Risk Assessment** - Flags high-risk changes (DB migrations, auth, dependencies)
- **📝 PR Packet Generation** - Creates markdown-formatted PR descriptions
- **📋 Clipboard Integration** - Automatically copies output for easy pasting
- **🧠 LLM Integration** - Optional AI-powered analysis (OpenAI, Anthropic, Ollama)
- **🏢 Monorepo Support** - Detects and tracks changes across multiple packages
- **✅ Test Execution** - Runs tests and includes results in PR packet
- **🎨 VSCode Extension** - Analyze changes directly from your editor
- **⚙️ Highly Configurable** - Customize via `.pr-ready.json` or `package.json`

## 📦 Installation

### Prerequisites

- Node.js >= 18.0.0
- npm, yarn, or pnpm
- Git repository

### Install from Source

```bash
# Clone the repository
git clone https://github.com/yourusername/pr-ready.git
cd pr-ready

# Install dependencies
npm install

# Build the project
npm run build

# Link for global usage (optional)
npm link -w @pr-ready/cli
```

## 🎯 Quick Start

### CLI Usage

```bash
# Analyze uncommitted changes
pr-ready

# Compare specific branches
pr-ready --base main --head feature-branch

# Run tests and include results
pr-ready --test

# Use LLM for enhanced analysis
pr-ready --llm openai
```

### VSCode Extension

1. Open the project in VSCode
2. Press `F5` to launch Extension Development Host
3. In the new window, open a git repository
4. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
5. Type "PR Ready: Analyze Changes" and press Enter

## 📖 Usage

### Command Line Options

```
pr-ready [options]

Options:
  -V, --version          Output the version number
  --base <branch>        Base branch to compare against (default: auto-detect)
  --head <branch>        Head branch with changes (default: current branch)
  --llm <provider>       LLM provider: openai|anthropic|ollama|none (default: none)
  --test                 Run tests and include results
  --no-cache             Skip cache lookup
  --config <path>        Path to custom config file
  --output <path>        Custom output file path (default: .pr-ready.md)
  --no-clipboard         Skip clipboard copy
  -h, --help             Display help
```

### Examples

```bash
# Analyze uncommitted changes
pr-ready

# Compare branches
pr-ready --base main --head feature-branch

# With tests
pr-ready --test

# With LLM
export OPENAI_API_KEY=your-key
pr-ready --llm openai

# Custom output
pr-ready --output docs/pr.md --no-clipboard
```

## ⚙️ Configuration

Create `.pr-ready.json` in project root:

```json
{
  "llm": {
    "provider": "openai",
    "apiKey": "${OPENAI_API_KEY}",
    "model": "gpt-4",
    "baseURL": "https://api.openai.com/v1"
  },
  "monorepo": {
    "enabled": true,
    "packages": ["packages/*"]
  },
  "test": {
    "command": "npm test",
    "timeout": 300000
  },
  "risks": {
    "patterns": [
      "**/migrations/**",
      "**/auth/**",
      "**/*.config.js"
    ]
  },
  "output": {
    "file": ".pr-ready.md",
    "clipboard": true
  }
}
```

### Configuration Options

#### LLM Configuration
- `provider`: `openai`, `anthropic`, `ollama`, or `none`
- `apiKey`: API key (supports env vars: `${VAR_NAME}`)
- `model`: Model name (e.g., `gpt-4`, `claude-3-opus`)
- `baseURL`: API endpoint URL

#### Monorepo Configuration
- `enabled`: Enable monorepo detection
- `packages`: Glob patterns for packages

#### Test Configuration
- `command`: Test command (default: `npm test`)
- `timeout`: Timeout in ms (default: 300000)

#### Risk Configuration
- `patterns`: Glob patterns for high-risk files

#### Output Configuration
- `file`: Output file path
- `clipboard`: Copy to clipboard

## 📄 Output Format

PR Ready generates markdown with:

1. **Summary** - High-level overview of changes
2. **Change Details** - Branches, files, lines changed
3. **Files Changed** - Categorized with emojis (🎨 Frontend, ⚙️ Backend, 🧪 Tests, etc.)
4. **Test Coverage** - Test detection and execution results
5. **Risk Assessment** - Flagged changes by risk level (🔴 High, 🟡 Medium, 🟢 Low)
6. **Monorepo Info** - Affected packages (if applicable)
7. **Reviewer Checklist** - Context-specific review items

### Example Output

```markdown
# PR Readiness Report

## Summary
This PR modifies 5 file(s) across 3 categories. Changes include: backend (3), tests (1), docs (1).

## Change Details
- **Base Branch**: `main`
- **Head Branch**: `feature-branch`
- **Files Changed**: 5
- **Total Changes**: +127 lines

## Files Changed
### ⚙️ Backend (3)
- `src/api/users.ts`
- `src/services/auth.ts`
- `src/models/user.ts`

### 🧪 Tests (1)
- `src/api/users.test.ts`

### 📚 Documentation (1)
- `README.md`

## Test Coverage
✅ **1 test file(s) modified**
- `src/api/users.test.ts`

## Risk Assessment
### 🟡 Medium Risk
- **`src/services/auth.ts`**: Authentication or security code modified

## Reviewer Checklist
- [ ] All tests pass locally
- [ ] No breaking changes (or documented in PR description)
- [ ] Security implications reviewed
- [ ] Authentication flows tested
- [ ] Changes are well-documented
- [ ] Code follows project style guidelines
```

## 🏗️ Project Structure

```
PRAssistant-IBMBOB/
├── packages/
│   ├── cli/                    # CLI tool
│   │   ├── src/
│   │   │   ├── cli.ts                    # Main CLI entry point
│   │   │   ├── git-diff-extractor.ts     # Git diff extraction
│   │   │   ├── rule-based-analyzer.ts    # File categorization & risk detection
│   │   │   ├── hybrid-analyzer.ts        # Combines rule-based + LLM analysis
│   │   │   ├── pr-packet-generator.ts    # Markdown generation
│   │   │   ├── config-manager.ts         # Configuration handling
│   │   │   ├── test-executor.ts          # Test execution
│   │   │   ├── monorepo-detector.ts      # Monorepo detection
│   │   │   ├── cache-manager.ts          # LLM response caching
│   │   │   ├── output-handler.ts         # File & clipboard output
│   │   │   └── llm/                      # LLM providers
│   │   │       ├── openai-provider.ts
│   │   │       ├── anthropic-provider.ts
│   │   │       ├── ollama-provider.ts
│   │   │       └── smart-truncator.ts
│   │   └── package.json
│   ├── extension/              # VSCode extension
│   │   ├── src/
│   │   │   └── extension.ts
│   │   └── package.json
│   └── shared/                 # Shared types
│       ├── src/types.ts
│       └── package.json
├── .vscode/
│   └── launch.json            # VSCode debug configuration
├── LICENSE
├── README.md
└── TESTING.md
```

## 🧪 Testing

See [TESTING.md](TESTING.md) for detailed testing instructions.

### Quick Test

```bash
# Build the project
npm run build

# Test CLI
cd packages/cli
npm test

# Test VSCode extension
# Open project in VSCode and press F5
```

## 🔧 Development

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test

# Watch mode for development
npm run dev
```

## 🔧 Troubleshooting

### No git repository found
```bash
cd /path/to/your/git/repo
pr-ready
```

### No changes detected
The tool now detects uncommitted changes by default. If you want to compare branches:
```bash
pr-ready --base main --head your-branch
```

### Test execution failed
```bash
npm test  # Verify test command works
pr-ready --test
```

### LLM API error
```bash
export OPENAI_API_KEY=your-key
pr-ready --llm openai
```

## 📝 License

MIT License - see [LICENSE](LICENSE) file.

## 🙏 Acknowledgments

- [Commander.js](https://github.com/tj/commander.js/) - CLI framework
- [Chalk](https://github.com/chalk/chalk) - Terminal styling
- [simple-git](https://github.com/steveukx/git-js) - Git operations
- [OpenAI Node SDK](https://github.com/openai/openai-node) - LLM integration

---

**Made with ❤️ for better code reviews**