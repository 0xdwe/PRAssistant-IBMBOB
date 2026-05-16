# VSCode Extension Setup Guide - LLM Integration

## Overview
This guide explains how to ensure the LLM integration works in the VSCode extension.

## Current Status
✅ CLI with LLM integration is working
✅ OpenAI provider successfully calling local endpoint
✅ Configuration system in place
⚠️ VSCode extension directory exists but is empty

## How to Ensure LLM Runs in VSCode

### 1. **Extension Architecture**

The VSCode extension will use the same CLI packages:

```
packages/
├── shared/          # Types and interfaces (already has LLM types)
├── cli/             # Core logic (already has OpenAI provider)
└── vscode-extension/  # VSCode-specific UI and commands
```

### 2. **Key Requirements for VSCode**

#### A. Package Dependencies
The extension must depend on the CLI package:

```json
{
  "dependencies": {
    "@pr-ready/cli": "workspace:*",
    "@pr-ready/shared": "workspace:*",
    "openai": "^6.38.0"
  }
}
```

#### B. Configuration in VSCode Settings
Add to `package.json` contribution points:

```json
{
  "contributes": {
    "configuration": {
      "title": "PR Ready",
      "properties": {
        "prReady.llm.provider": {
          "type": "string",
          "enum": ["openai", "anthropic", "ollama", "none"],
          "default": "none",
          "description": "LLM provider to use"
        },
        "prReady.llm.baseURL": {
          "type": "string",
          "default": "http://172.16.6.27:20128/v1",
          "description": "Custom base URL for LLM API"
        },
        "prReady.llm.model": {
          "type": "string",
          "default": "kr/claude-sonnet-4.5",
          "description": "Model to use"
        },
        "prReady.llm.apiKey": {
          "type": "string",
          "default": "",
          "description": "API key for LLM provider"
        }
      }
    }
  }
}
```

#### C. Import and Use CLI Components

In the extension's TypeScript code:

```typescript
import * as vscode from 'vscode';
import { GitDiffExtractor } from '@pr-ready/cli/dist/git-diff-extractor';
import { RuleBasedAnalyzer } from '@pr-ready/cli/dist/rule-based-analyzer';
import { PRPacketGenerator } from '@pr-ready/cli/dist/pr-packet-generator';
import { OpenAIProvider } from '@pr-ready/cli/dist/openai-provider';
import { LLMConfig } from '@pr-ready/shared';

export function activate(context: vscode.ExtensionContext) {
  // Get configuration
  const config = vscode.workspace.getConfiguration('prReady');
  
  // Create LLM config from VSCode settings
  const llmConfig: LLMConfig = {
    provider: config.get('llm.provider', 'none'),
    baseURL: config.get('llm.baseURL'),
    model: config.get('llm.model'),
    apiKey: config.get('llm.apiKey'),
    timeout: 30000
  };
  
  // Register command
  let disposable = vscode.commands.registerCommand('prReady.analyze', async () => {
    try {
      // Extract diff
      const diffExtractor = new GitDiffExtractor();
      const diff = await diffExtractor.extractDiff({
        baseBranch: 'origin/main',
        cwd: vscode.workspace.rootPath
      });
      
      // Analyze
      const analyzer = new RuleBasedAnalyzer();
      const analysis = analyzer.analyze(diff);
      
      // LLM analysis if enabled
      let llmAnalysis = null;
      if (llmConfig.provider !== 'none') {
        const provider = new OpenAIProvider(llmConfig);
        llmAnalysis = await provider.analyze(diff);
      }
      
      // Generate packet
      const generator = new PRPacketGenerator();
      const packet = generator.generate(diff, analysis, llmAnalysis);
      const markdown = generator.generateMarkdown(packet);
      
      // Show in VSCode
      const doc = await vscode.workspace.openTextDocument({
        content: markdown,
        language: 'markdown'
      });
      await vscode.window.showTextDocument(doc);
      
    } catch (error) {
      vscode.window.showErrorMessage(`Error: ${error.message}`);
    }
  });
  
  context.subscriptions.push(disposable);
}
```

### 3. **Testing in VSCode**

#### Step 1: Build All Packages
```bash
# Build shared package first
cd packages/shared
npm run build

# Build CLI package
cd ../cli
npm run build

# Install extension dependencies
cd ../vscode-extension
npm install
```

#### Step 2: Configure VSCode Settings
In VSCode, open Settings (Ctrl+,) and search for "PR Ready":
- Set `prReady.llm.provider` to `openai`
- Set `prReady.llm.baseURL` to `http://172.16.6.27:20128/v1`
- Set `prReady.llm.model` to `kr/claude-sonnet-4.5`
- Set `prReady.llm.apiKey` to your API key

#### Step 3: Launch Extension Development Host
1. Open `packages/vscode-extension` in VSCode
2. Press `F5` to launch Extension Development Host
3. In the new window, open your project
4. Press `Ctrl+Shift+P` and run "PR Ready: Analyze"

### 4. **Debugging LLM in VSCode**

Add logging to see what's happening:

```typescript
// In extension code
const outputChannel = vscode.window.createOutputChannel('PR Ready');

outputChannel.appendLine(`[LLM] Provider: ${llmConfig.provider}`);
outputChannel.appendLine(`[LLM] BaseURL: ${llmConfig.baseURL}`);
outputChannel.appendLine(`[LLM] Model: ${llmConfig.model}`);

// Show the output channel
outputChannel.show();
```

### 5. **Common Issues and Solutions**

#### Issue: "Module not found"
**Solution**: Ensure packages are built:
```bash
npm run build --workspaces
```

#### Issue: "LLM not responding"
**Solution**: Check the output channel for errors:
- Verify baseURL is accessible from VSCode
- Check API key is correct
- Ensure local endpoint is running

#### Issue: "Configuration not loading"
**Solution**: Reload VSCode window after changing settings:
- Press `Ctrl+Shift+P`
- Run "Developer: Reload Window"

### 6. **Production Deployment**

To package the extension:

```bash
cd packages/vscode-extension
npm install -g vsce
vsce package
```

This creates a `.vsix` file that can be installed in VSCode.

### 7. **Verification Checklist**

- [ ] Shared package builds successfully
- [ ] CLI package builds successfully
- [ ] Extension has correct dependencies in package.json
- [ ] Extension imports CLI components correctly
- [ ] VSCode settings are configured
- [ ] Extension Development Host launches
- [ ] Command appears in Command Palette
- [ ] LLM provider is initialized with correct config
- [ ] API calls are made to local endpoint
- [ ] Results are displayed in VSCode

## Next Steps

1. Create extension scaffold (if not done)
2. Add package.json with dependencies
3. Implement extension.ts with CLI integration
4. Test in Extension Development Host
5. Verify LLM integration works
6. Package and distribute

## Testing Command

To quickly test if everything works:

```bash
# From project root
npm run build --workspaces
cd packages/vscode-extension
code .
# Press F5 to launch