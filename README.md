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

## 🎯 Quick Start

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
# Basic analysis
pr-ready

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
    "provider": "none",
    "apiKey": "${OPENAI_API_KEY}",
    "model": "gpt-4",
    "temperature": 0.3,
    "maxTokens": 2000
  },
  "monorepo": {
    "enabled": true,
    "type": "auto",
    "packagePaths": ["packages/*", "apps/*"]
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
  },
  "cache": {
    "enabled": true,
    "ttl": 3600
  }
}
```

### Configuration Options

#### LLM Configuration
- `provider`: `openai`, `anthropic`, `ollama`, or `none`
- `apiKey`: API key (supports env vars: `${VAR_NAME}`)
- `model`: Model name
- `temperature`: 0.0-1.0
- `maxTokens`: Max response tokens

#### Monorepo Configuration
- `enabled`: Enable monorepo detection
- `type`: `auto`, `lerna`, `nx`, `pnpm`, `yarn`
- `packagePaths`: Glob patterns for packages

#### Test Configuration
- `command`: Test command (default: `npm test`)
- `timeout`: Timeout in ms (default: 300000)

#### Risk Configuration
- `patterns`: Glob patterns for high-risk files
- `customRules`: Custom risk detection rules

#### Output Configuration
- `file`: Output file path
- `clipboard`: Copy to clipboard

#### Cache Configuration
- `enabled`: Enable caching
- `ttl`: Cache TTL in seconds

## 📄 Output Format

PR Ready generates markdown with:

1. **Summary** - High-level overview
2. **Change Details** - Branches, files, lines changed
3. **Files Changed** - Categorized with emojis
4. **Test Coverage** - Test detection and results
5. **Risk Assessment** - Flagged changes by risk level
6. **Monorepo Info** - Affected packages (if applicable)
7. **Reviewer Checklist** - Context-specific review items

## 🔧 Troubleshooting

### No git repository found
```bash
cd /path/to/your/git/repo
pr-ready
```

### No changes detected
```bash
git branch
git log --oneline -5
pr-ready --base main --head your-branch
```

### Test execution failed
```bash
npm test  # Verify test command works
pr-ready --test --config .pr-ready.json
```

### LLM API error
```bash
export OPENAI_API_KEY=your-key
echo $OPENAI_API_KEY
```

### Clipboard copy failed
```bash
pr-ready --no-clipboard
```

## 🏗️ Project Structure

```
PRAssistant-IBMBOB/
├── packages/
│   ├── cli/                    # CLI tool
│   │   ├── src/
│   │   │   ├── cli.ts
│   │   │   ├── git-diff-extractor.ts
│   │   │   ├── rule-based-analyzer.ts
│   │   │   ├── pr-packet-generator.ts
│   │   │   ├── config-manager.ts
│   │   │   ├── test-executor.ts
│   │   │   ├── monorepo-detector.ts
│   │   │   └── llm/
│   │   └── package.json
│   └── shared/                 # Shared types
│       ├── src/types.ts
│       └── package.json
├── LICENSE
└── README.md
```

## 📝 License

MIT License - see [LICENSE](LICENSE) file.

## 🙏 Acknowledgments

- [Commander.js](https://github.com/tj/commander.js/)
- [Chalk](https://github.com/chalk/chalk)
- [simple-git](https://github.com/steveukx/git-js)
- [OpenAI Node SDK](https://github.com/openai/openai-node)

---

**Made with ❤️ by the PR Ready team**