# How to Test VSCode Extension

## Prerequisites
✅ Dependencies installed in vscode-extension package (simple-git, chalk, clipboardy, commander)
✅ Extension compiled successfully

## Testing Steps

### 1. Launch Extension Development Host
1. Open VSCode in the project root (`c:/Users/sukse/PRAssistant-IBMBOB`)
2. Press `F5` to launch Extension Development Host
3. A new VSCode window will open with the extension loaded

### 2. Open a Git Repository
In the Extension Development Host window:
1. Open a folder that is a git repository
2. Make sure you have uncommitted changes or are on a branch with commits ahead of the base branch

### 3. Run the Command
1. Press `Ctrl+Shift+P` to open Command Palette
2. Type "PR Ready: Analyze Current Branch"
3. Press Enter

### 4. Expected Behavior
- Output channel "PR Ready" should open automatically
- You should see:
  ```
  Configuration: LLM Provider: openai, Base URL: http://172.16.6.27:20128/v1, Model: kr/claude-sonnet-4.5
  Extracting git diff...
  Analyzing changes...
  Calling LLM for analysis...
  Generating PR packet...
  Analysis complete!
  ```
- A new markdown document should open with the PR analysis
- The analysis should include an "AI Analysis" section with LLM-generated summary

### 5. Verify LLM Integration
Check the markdown output for:
- **AI Analysis** section at the top
- Summary from the LLM
- Key insights and recommendations
- Standard rule-based analysis sections below

## Troubleshooting

### "Not a git repository" Error
**Fixed!** The extension now has all required dependencies installed:
- simple-git
- chalk
- clipboardy
- commander

### Extension Not Loading
1. Check the Debug Console in the main VSCode window for errors
2. Rebuild: `cd packages/vscode-extension && npm run compile`
3. Restart Extension Development Host (Shift+F5, then F5)

### LLM Call Failing
1. Check if the 9router endpoint is accessible: http://172.16.6.27:20128/v1
2. Verify the API key in VSCode settings or `.pr-ready.json`
3. Check the Output channel for detailed error messages

### No Changes Detected
1. Make sure you have uncommitted changes or commits ahead of the base branch
2. Try specifying a base branch in the configuration

## Configuration

The extension reads configuration from:
1. VSCode settings (File > Preferences > Settings > search "PR Ready")
2. `.pr-ready.json` in the workspace root

Current configuration:
```json
{
  "llm": {
    "provider": "openai",
    "baseURL": "http://172.16.6.27:20128/v1",
    "model": "kr/claude-sonnet-4.5",
    "apiKey": "sk-19d8880ef9d5cdc5-9r6vgy-a9b2b4cd"
  }
}
```

## Next Steps

After successful testing:
1. Test with different types of changes (code, tests, docs)
2. Test with different base branches
3. Verify clipboard functionality
4. Test error handling (disconnect network, invalid API key, etc.)

## Success Criteria

✅ Extension launches without errors
✅ Git diff extraction works
✅ LLM analysis completes successfully
✅ Markdown output includes AI analysis
✅ Output channel shows detailed logs
✅ No "Not a git repository" errors