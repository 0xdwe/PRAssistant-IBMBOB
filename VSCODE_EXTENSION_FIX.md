# VSCode Extension Fix - "Not a git repository" Error

## Problem
The VSCode extension was showing "Not a git repository" error even when run from within a git repository.

## Root Cause
The `GitDiffExtractor` class was initialized in the constructor with `process.cwd()`, but the VSCode extension was passing the workspace folder path via the `cwd` option to `extractDiff()`. The `cwd` parameter was being ignored because the git instance was already initialized.

## Solution
Updated `GitDiffExtractor.extractDiff()` to reinitialize the git instance if a `cwd` option is provided:

```typescript
async extractDiff(options: DiffOptions = {}): Promise<GitDiff> {
  // If cwd is provided in options, reinitialize git with the new directory
  if (options.cwd) {
    this.git = simpleGit(options.cwd);
  }
  
  // Verify we're in a git repository
  const isRepo = await this.git.checkIsRepo();
  if (!isRepo) {
    throw new Error('Not a git repository. Please run this command from within a git repository.');
  }
  // ... rest of the method
}
```

## Files Changed
- `packages/cli/src/git-diff-extractor.ts` - Added cwd handling in extractDiff method

## Testing Steps

### 1. Reload the Extension Development Host
If you have the Extension Development Host window open:
1. Close the Extension Development Host window
2. In your main VSCode window, press `F5` to launch a new Extension Development Host

OR

1. In the Extension Development Host window, press `Ctrl+R` to reload

### 2. Open a Git Repository
In the Extension Development Host window:
1. Open a folder that is a git repository (e.g., `c:/Users/sukse/PRAssistant-IBMBOB`)
2. Make sure you have some changes or commits to analyze

### 3. Run the Extension
1. Press `Ctrl+Shift+P` to open Command Palette
2. Type "PR Ready: Analyze Current Branch"
3. Press Enter

### 4. Expected Results
You should now see:
- ✅ "Starting PR analysis..." in the output channel
- ✅ Configuration details (LLM Provider, Base URL, Model)
- ✅ "Extracting git diff..." message
- ✅ Number of changed files
- ✅ Analysis results
- ✅ LLM analysis (if configured)
- ✅ A new markdown document with the PR packet
- ✅ Results copied to clipboard

### 5. Check the Output Channel
The "PR Ready" output channel should show detailed logs without the "Not a git repository" error.

## Alternative: Test from Command Line
If you want to verify the fix works in the CLI as well:

```bash
cd c:/Users/sukse/PRAssistant-IBMBOB
node packages/cli/dist/cli.js --llm openai --base origin/main
```

This should also work correctly now.

## What Changed
- **Before**: The extension would fail with "Not a git repository" because it couldn't set the working directory
- **After**: The extension properly sets the working directory to the VSCode workspace folder before checking if it's a git repository

## Configuration
Your current configuration in `.pr-ready.json`:
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

This configuration will be used automatically by both the CLI and VSCode extension.

## Troubleshooting

### If you still see the error:
1. Make sure you've reloaded the Extension Development Host (Ctrl+R)
2. Verify the workspace folder is actually a git repository (check for `.git` folder)
3. Check the "PR Ready" output channel for detailed error messages

### If LLM analysis fails:
1. Verify the endpoint `http://172.16.6.27:20128/v1` is accessible
2. Check the API key is correct
3. Look at the output channel for specific error messages

## Next Steps
Once this works, you can:
1. Test with different branches: The extension currently compares against `origin/main`
2. Customize the base branch in the extension settings
3. Package the extension for distribution: `cd packages/vscode-extension && vsce package`