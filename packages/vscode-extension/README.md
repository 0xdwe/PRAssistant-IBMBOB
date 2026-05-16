# PR Ready VSCode Extension

VSCode extension for automated PR readiness analysis with LLM support.

## Quick Start - How to Run

### 1. Open the Extension in VSCode

```bash
cd packages/vscode-extension
code .
```

### 2. Press F5 to Launch

- Press `F5` in VSCode
- This will:
  - Compile the extension
  - Open a new "Extension Development Host" window
  - Load the extension in that window

### 3. Test the Extension

In the Extension Development Host window:

1. Open your project (the PRAssistant-IBMBOB folder)
2. Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
3. Type "PR Ready: Analyze Current Branch"
4. Press Enter

### 4. View Results

- The PR analysis will appear in a new markdown document
- Check the "PR Ready" output channel for detailed logs
- Results are automatically copied to clipboard

## Configuration

The extension uses the same LLM configuration as the CLI.

### Option 1: Use VSCode Settings (Recommended)

1. Open Settings: `Ctrl+,` (Windows) or `Cmd+,` (Mac)
2. Search for "PR Ready"
3. Configure:
   - **PR Ready: LLM Provider**: `openai`
   - **PR Ready: LLM Base URL**: `http://172.16.6.27:20128/v1`
   - **PR Ready: LLM Model**: `kr/claude-sonnet-4.5`
   - **PR Ready: LLM API Key**: `sk-19d8880ef9d5cdc5-9r6vgy-a9b2b4cd`

### Option 2: Use settings.json

Add to your `.vscode/settings.json`:

```json
{
  "prReady.llm.provider": "openai",
  "prReady.llm.baseURL": "http://172.16.6.27:20128/v1",
  "prReady.llm.model": "kr/claude-sonnet-4.5",
  "prReady.llm.apiKey": "sk-19d8880ef9d5cdc5-9r6vgy-a9b2b4cd"
}
```

## How LLM Integration Works

The extension uses the **exact same code** as the CLI:

```typescript
// Same OpenAI provider
import { OpenAIProvider } from '@pr-ready/cli/dist/openai-provider';

// Same configuration
const llmConfig = {
  provider: 'openai',
  baseURL: 'http://172.16.6.27:20128/v1',
  model: 'kr/claude-sonnet-4.5',
  apiKey: 'your-api-key'
};

// Same analysis
const provider = new OpenAIProvider(llmConfig);
const llmAnalysis = await provider.analyze(diff);
```

## Debugging

### View Logs

1. In the Extension Development Host window
2. Open Output panel: `View` → `Output`
3. Select "PR Ready" from the dropdown

### Common Issues

**Issue: "Cannot find module '@pr-ready/cli'"**
- Solution: Build the CLI package first:
  ```bash
  cd packages/cli
  npm run build
  ```

**Issue: "LLM not responding"**
- Check the Output panel for error details
- Verify the local endpoint is running
- Check API key is correct

**Issue: "No workspace folder open"**
- Open a folder in VSCode before running the command

## Development

### Build

```bash
npm run compile
```

### Watch Mode

```bash
npm run watch
```

### Package Extension

```bash
npm install -g vsce
vsce package
```

This creates a `.vsix` file that can be installed in VSCode.

## Features

- ✅ Analyze current branch against origin/main
- ✅ LLM-powered semantic analysis
- ✅ Rule-based categorization
- ✅ Test detection
- ✅ Risk assessment
- ✅ Automatic clipboard copy
- ✅ Detailed logging

## Architecture

```
Extension (VSCode UI)
    ↓
CLI Package (Core Logic)
    ↓
OpenAI Provider (LLM Integration)
    ↓
Local Endpoint (http://172.16.6.27:20128/v1)
```

The extension is a thin wrapper around the CLI package, ensuring consistency between CLI and VSCode usage.