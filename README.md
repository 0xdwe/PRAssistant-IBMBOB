# PR Readiness Assistant

> Automated PR readiness analysis tool that generates comprehensive PR packets from git diffs.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

## 🚀 Features

- **🔍 Automatic Git Diff Analysis** - Extracts and analyzes changes between branches
- **📁 Smart File Categorization** - Groups files by purpose (frontend, backend, tests, config, docs)
- **🧪 Test Detection** - Identifies test files and warns if tests are missing
- **⚠️ Risk Assessment** - Flags high-risk changes (DB migrations, auth, dependencies)
- **📝 PR Packet Generation** - Creates markdown-formatted PR descriptions
- **📋 Clipboard Integration** - Automatically copies output for easy pasting
- **🧠 LLM Integration** - Optional AI-powered analysis (OpenAI, Anthropic, Ollama)
- **🏢 Monorepo Support** - Detects and tracks changes across multiple packages
- **✅ Test Execution** - Runs tests and includes results in PR packet
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

### Install as Package (Coming Soon)

```bash
npm install -g @pr-ready/cli
```

## 🎯 Quick Start

### Basic Usage

```bash
# Analyze current branch against auto-detected base
pr-ready

# Compare specific branches
pr-ready --base main --head feature-branch

# Run tests and include results
pr-ready --test

# Use LLM for enhanced analysis
pr-ready --llm openai
```

### First Time Setup

1. **Navigate to your project:**
   ```bash
   cd /path/to/your/project
   ```

2. **Create a config file (optional):**
   ```bash
   cp node_modules/@pr-ready/cli/examples/basic-config.json .pr-ready.json
   ```

3. **Run analysis:**
   ```bash
   pr-ready
   ```

4. **Check output:**
   - File: `.pr-ready.md` (default)
   - Clipboard: Automatically copied (if enabled)

## 📖 Usage Guide

### Command Line Options

```
pr-ready [options]

Options:
  -V, --version          Output the version number
  --base <branch>        Base branch to compare against (default: auto-detect from upstream/origin)
  --head <branch>        Head branch with changes (default: current branch)
  --llm <provider>       LLM provider for enhanced analysis: openai|anthropic|ollama|none (default: none)
  --test                 Run tests before generating PR packet and include test results
  --no-cache             Skip cache lookup and force fresh analysis
  --config <path>        Path to custom config file (.pr-ready.json or package.json)
  --output <path>        Custom output file path (default: .pr-ready.md)
  --no-clipboard         Skip automatic clipboard copy of the generated PR packet
  -h, --help             Display help for command
```

### Examples

#### Analyze Feature Branch

```bash
# Auto-detect base branch
pr-ready

# Explicit branches
pr-ready --base main --head feature/new-api
```

#### With Test Execution

```bash
# Run tests and include results
pr-ready --test

# Custom test command (via config)
pr-ready --test --config .pr-ready.json
```

#### With LLM Enhancement

```bash
# Using OpenAI
export OPENAI_API_KEY=your-key-here
pr-ready --llm openai

# Using Anthropic
export ANTHROPIC_API_KEY=your-key-here
pr-ready --llm anthropic

# Using local Ollama
pr-ready --llm ollama
```

#### Custom Output

```bash
# Custom file location
pr-ready --output docs/pr-description.md

# Skip clipboard
pr-ready --no-clipboard

# Both
pr-ready --output pr.md --no-clipboard
```

#### Monorepo Projects

```bash
# Auto-detect monorepo structure
pr-ready --config examples/monorepo-config.json

# With workspace tests
pr-ready --test --config examples/monorepo-config.json
```

## ⚙️ Configuration

### Configuration Methods

PR Ready supports three configuration methods (in order of precedence):

1. **CLI flags** (highest priority)
2. **`.pr-ready.json`** file in project root
3. **`prReady`** section in `package.json`

### Configuration Schema

Create a `.pr-ready.json` file:

```json
{
  "llm": {
    "provider": "none",
    "apiKey": "${OPENAI_API_KEY}",
    "model": "gpt-4",
    "temperature": 0.3,
    "maxTokens": 2000
  },
  "monorepo": {
    "enabled": true,
    "type": "auto",
    "packagePaths": ["packages/*", "apps/*"],
    "rootFiles": ["package.json", "lerna.json", "pnpm-workspace.yaml"]
  },
  "test": {
    "command": "npm test",
    "timeout": 300000,
    "patterns": ["**/*.test.ts", "**/*.spec.ts"],
    "excludePatterns": ["**/node_modules/**", "**/dist/**"]
  },
  "risks": {
    "patterns": [
      "**/migrations/**",
      "**/auth/**",
      "**/*.config.js",
      "**/package.json"
    ],
    "customRules": [
      {
        "pattern": "**/api/**",
        "level": "medium",
        "message": "API changes require careful review"
      }
    ]
  },
  "output": {
    "file": ".pr-ready.md",
    "clipboard": true
  },
  "cache": {
    "enabled": true,
    "ttl": 3600
  }
}
```

### Configuration Options

#### LLM Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `provider` | string | `"none"` | LLM provider: `openai`, `anthropic`, `ollama`, or `none` |
| `apiKey` | string | - | API key (supports env vars: `${VAR_NAME}`) |
| `model` | string | - | Model name (e.g., `gpt-4`, `claude-3-opus`) |
| `temperature` | number | `0.3` | Creativity level (0.0-1.0) |
| `maxTokens` | number | `2000` | Maximum response tokens |

#### Monorepo Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | `false` | Enable monorepo detection |
| `type` | string | `"auto"` | Monorepo type: `auto`, `lerna`, `nx`, `pnpm`, `yarn` |
| `packagePaths` | string[] | `["packages/*"]` | Glob patterns for package directories |
| `rootFiles` | string[] | - | Files that indicate monorepo root |

#### Test Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `command` | string | `"npm test"` | Test command to execute |
| `timeout` | number | `300000` | Test timeout in milliseconds (5 min) |
| `patterns` | string[] | - | Glob patterns for test files |
| `excludePatterns` | string[] | - | Patterns to exclude from test detection |

#### Risk Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `patterns` | string[] | - | Glob patterns for high-risk files |
| `customRules` | object[] | - | Custom risk detection rules |

#### Output Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `file` | string | `".pr-ready.md"` | Output file path |
| `clipboard` | boolean | `true` | Copy to clipboard |

#### Cache Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | `false` | Enable caching |
| `ttl` | number | `3600` | Cache TTL in seconds (1 hour) |

### Example Configurations

See the [`examples/`](examples/) directory for complete configuration examples:

- **[basic-config.json](examples/basic-config.json)** - Minimal setup for most projects
- **[with-llm-config.json](examples/with-llm-config.json)** - OpenAI integration
- **[monorepo-config.json](examples/monorepo-config.json)** - Monorepo projects
- **[custom-test-config.json](examples/custom-test-config.json)** - Advanced test configuration

## 📄 Output Format

PR Ready generates a comprehensive markdown document with:

### 1. Summary
High-level overview of changes with file counts and categories.

### 2. Change Details
- Base and head branches
- Total files changed
- Lines added/removed
- Commit information

### 3. Files Changed
Categorized file list with emojis:
- 🎨 Frontend
- ⚙️ Backend
- 🧪 Tests
- ⚙️ Configuration
- 📚 Documentation
- 🏗️ Infrastructure

### 4. Test Coverage
- Test files detected
- Missing test warnings
- Test execution results (if `--test` flag used)

### 5. Risk Assessment
Flagged changes by risk level:
- 🔴 High Risk (migrations, auth, security)
- 🟡 Medium Risk (config, dependencies)
- 🟢 Low Risk (docs, tests)

### 6. Monorepo Information (if applicable)
- Affected packages
- Cross-package dependencies
- Package-specific changes

### 7. Reviewer Checklist
Context-specific review items based on detected changes.

### Example Output

```markdown
# PR Readiness Report

## Summary

This PR modifies **12 file(s)** across **4 categories**. Changes include: backend (5), tests (3), config (2), docs (2).

## Change Details

- **Base Branch:** main
- **Head Branch:** feature/user-auth
- **Files Changed:** 12
- **Lines Added:** +456
- **Lines Removed:** -123

## Files Changed

### ⚙️ Backend (5)
- `src/auth/login.ts` (+89, -12)
- `src/auth/register.ts` (+67, -8)
- `src/middleware/auth.ts` (+45, -15)

### 🧪 Tests (3)
- `src/auth/login.test.ts` (+123, -0)
- `src/auth/register.test.ts` (+98, -0)

## Test Coverage

✅ **Test files detected:** 3
✅ **All modified source files have corresponding tests**

### Test Results
- **Status:** ✅ Passed
- **Total Tests:** 45
- **Passed:** 45
- **Failed:** 0
- **Duration:** 12.3s

## Risk Assessment

### 🔴 High Risk (2)
- **`src/auth/login.ts`**: Authentication logic changes
- **`src/middleware/auth.ts`**: Security middleware modified

### 🟡 Medium Risk (1)
- **`package.json`**: Dependencies updated

## Reviewer Checklist

- [ ] Authentication logic reviewed for security vulnerabilities
- [ ] Test coverage is adequate for auth changes
- [ ] Error handling is comprehensive
- [ ] Dependencies are up to date and secure
- [ ] Documentation updated
```

## 🔧 Troubleshooting

### Common Issues

#### "No git repository found"

**Problem:** Running outside a git repository.

**Solution:**
```bash
cd /path/to/your/git/repo
pr-ready
```

#### "No changes detected"

**Problem:** No differences between branches.

**Solution:**
```bash
# Check current branch
git branch

# Ensure you have commits
git log --oneline -5

# Try explicit branches
pr-ready --base main --head your-branch
```

#### "Test execution failed"

**Problem:** Test command not found or tests failing.

**Solution:**
```bash
# Verify test command works
npm test

# Use custom test command
pr-ready --test --config .pr-ready.json

# Skip tests
pr-ready  # Don't use --test flag
```

#### "LLM API error"

**Problem:** API key not set or invalid.

**Solution:**
```bash
# Set API key
export OPENAI_API_KEY=your-key-here

# Verify it's set
echo $OPENAI_API_KEY

# Or use config file
# In .pr-ready.json: "apiKey": "${OPENAI_API_KEY}"
```

#### "Clipboard copy failed"

**Problem:** Clipboard access not available.

**Solution:**
```bash
# Disable clipboard
pr-ready --no-clipboard

# Or in config
# "output": { "clipboard": false }
```

### Debug Mode

Enable verbose logging:

```bash
# Set debug environment variable
DEBUG=pr-ready:* pr-ready

# Or use Node.js debug
NODE_DEBUG=* pr-ready
```

### Getting Help

1. Check the [examples/](examples/) directory
2. Review [CONTRIBUTING.md](CONTRIBUTING.md)
3. Search [existing issues](https://github.com/yourusername/pr-ready/issues)
4. Open a [new issue](https://github.com/yourusername/pr-ready/issues/new)

## 🏗️ Project Structure

```
PRAssistant-IBMBOB/
├── packages/
│   ├── cli/                          # CLI tool
│   │   ├── src/
│   │   │   ├── cli.ts                # CLI entry point
│   │   │   ├── git-diff-extractor.ts # Git diff extraction
│   │   │   ├── rule-based-analyzer.ts # File categorization
│   │   │   ├── pr-packet-generator.ts # Markdown generation
│   │   │   ├── output-handler.ts     # File & clipboard output
│   │   │   ├── config-manager.ts     # Configuration loading
│   │   │   ├── test-executor.ts      # Test execution
│   │   │   ├── monorepo-detector.ts  # Monorepo detection
│   │   │   └── llm/
│   │   │       └── openai-provider.ts # OpenAI integration
│   │   └── package.json
│   └── shared/                       # Shared types
│       ├── src/
│       │   └── types.ts              # TypeScript interfaces
│       └── package.json
├── examples/                         # Configuration examples
│   ├── basic-config.json
│   ├── with-llm-config.json
│   ├── monorepo-config.json
│   ├── custom-test-config.json
│   └── README.md
├── issues/                           # Issue specifications
├── CONTRIBUTING.md                   # Contribution guidelines
├── LICENSE                           # MIT License
├── PRD.md                           # Product requirements
└── README.md                        # This file
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:

- Development setup
- Code style guidelines
- Testing requirements
- Pull request process
- Issue reporting

### Quick Start for Contributors

```bash
# Clone and setup
git clone https://github.com/yourusername/pr-ready.git
cd pr-ready
npm install
npm run build

# Run in development
npm run dev

# Run tests
npm test

# Create a feature branch
git checkout -b feature/your-feature

# Make changes and test
npm run build
pr-ready --test

# Submit PR
git push origin feature/your-feature
```

## 📋 Roadmap

### ✅ Completed (v0.1.0)
- Core CLI with git diff extraction
- Rule-based file categorization
- Test detection and execution
- Risk assessment
- PR packet generation
- Clipboard integration
- Configuration system
- Monorepo support
- OpenAI LLM integration

### 🚧 In Progress
- Anthropic Claude integration
- Ollama local LLM support
- VS Code extension
- Comprehensive test suite

### 🔮 Planned
- GitHub Actions integration
- GitLab CI integration
- Bitbucket Pipelines support
- Web dashboard
- Team analytics
- Custom templates
- Plugin system

## 📊 Implementation Status

| Feature | Status | Issue |
|---------|--------|-------|
| CLI Scaffold | ✅ Complete | #001 |
| File Categorization | ✅ Complete | #002 |
| Test Detection | ✅ Complete | #003 |
| Risk Detection | ✅ Complete | #004 |
| PR Packet Generation | ✅ Complete | #005 |
| Clipboard Output | ✅ Complete | #006 |
| Config System | ✅ Complete | #007 |
| OpenAI Provider | ✅ Complete | #008 |
| Hybrid Analyzer | 🚧 Planned | #009 |
| Smart Truncation | 🚧 Planned | #010 |
| Cache Layer | 🚧 Planned | #011 |
| Test Execution | ✅ Complete | #012 |
| Reviewer Checklist | ✅ Complete | #013 |
| Monorepo Detection | ✅ Complete | #014 |
| Anthropic Provider | 🚧 Planned | #015 |
| Ollama Provider | 🚧 Planned | #016 |
| VS Code Extension | 🚧 Planned | #017-018 |
| Documentation | ✅ Complete | #019 |
| Testing Infrastructure | 🚧 Planned | #020 |

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Commander.js](https://github.com/tj/commander.js/)
- Styled with [Chalk](https://github.com/chalk/chalk)
- Git integration via [simple-git](https://github.com/steveukx/git-js)
- LLM integration via [OpenAI Node SDK](https://github.com/openai/openai-node)

## 📞 Support

- **Documentation:** [README.md](README.md) and [examples/](examples/)
- **Issues:** [GitHub Issues](https://github.com/yourusername/pr-ready/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/pr-ready/discussions)
- **Email:** support@pr-ready.dev

---

**Made with ❤️ by Bob**