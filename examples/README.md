# Configuration Examples

This directory contains sample configuration files for different use cases.

## Available Examples

### 1. basic-config.json
Basic configuration with minimal setup. Good starting point for most projects.

**Features:**
- No LLM integration
- Standard test patterns
- Common risk patterns
- Clipboard output enabled

**Usage:**
```bash
pr-ready --config examples/basic-config.json
```

### 2. with-llm-config.json
Configuration with OpenAI LLM integration for enhanced analysis.

**Features:**
- OpenAI GPT-4 integration
- Caching enabled
- Enhanced PR descriptions
- Smart code analysis

**Setup:**
1. Set environment variable: `export OPENAI_API_KEY=your-key-here`
2. Run: `pr-ready --config examples/with-llm-config.json`

### 3. monorepo-config.json
Optimized for monorepo projects (Lerna, Nx, pnpm workspaces, etc.).

**Features:**
- Monorepo detection enabled
- Workspace-aware testing
- Package-level change tracking
- Extended timeout for larger test suites

**Usage:**
```bash
pr-ready --config examples/monorepo-config.json
```

### 4. custom-test-config.json
Advanced configuration with custom test patterns and risk rules.

**Features:**
- Custom test command (pnpm test:ci)
- Extended test patterns
- Coverage thresholds
- Custom risk rules
- Additional risk patterns for infrastructure

**Usage:**
```bash
pr-ready --config examples/custom-test-config.json
```

## Using Configurations

### Method 1: CLI Flag
```bash
pr-ready --config examples/basic-config.json
```

### Method 2: Copy to Project Root
```bash
cp examples/basic-config.json .pr-ready.json
pr-ready
```

### Method 3: Add to package.json
```json
{
  "prReady": {
    "llm": {
      "provider": "none"
    },
    "output": {
      "file": ".pr-ready.md",
      "clipboard": true
    }
  }
}
```

## Configuration Schema

All configuration files support the following structure:

```json
{
  "llm": {
    "provider": "none|openai|anthropic|ollama",
    "apiKey": "string",
    "model": "string",
    "temperature": 0.0-1.0,
    "maxTokens": number
  },
  "monorepo": {
    "enabled": boolean,
    "type": "auto|lerna|nx|pnpm|yarn",
    "packagePaths": ["string"],
    "rootFiles": ["string"]
  },
  "test": {
    "command": "string",
    "timeout": number,
    "patterns": ["string"],
    "excludePatterns": ["string"]
  },
  "risks": {
    "patterns": ["string"],
    "customRules": [
      {
        "pattern": "string",
        "level": "high|medium|low",
        "message": "string"
      }
    ]
  },
  "output": {
    "file": "string",
    "clipboard": boolean
  },
  "cache": {
    "enabled": boolean,
    "ttl": number
  }
}
```

## Tips

1. **Start Simple**: Begin with `basic-config.json` and customize as needed
2. **Environment Variables**: Use `${VAR_NAME}` syntax for sensitive data
3. **Test Patterns**: Adjust patterns to match your project's test structure
4. **Risk Patterns**: Add project-specific high-risk paths
5. **Monorepo**: Enable monorepo detection if using workspaces

## Need Help?

- See main [README.md](../README.md) for full documentation
- Check [CONTRIBUTING.md](../CONTRIBUTING.md) for development guidelines
- Open an issue for questions or problems