# How to Test the Fixed VSCode Extension

## The Fix is Already Applied
✅ The bug fix has been applied to `packages/cli/src/git-diff-extractor.ts`
✅ The CLI package has been rebuilt
✅ The extension has been recompiled

## Problem
You're seeing "All installed extensions are temporarily disabled" because you're trying to test in the Extension Development Host, but the extension needs to be tested differently.

## Two Ways to Test

### Method 1: Test in Your Current VSCode Window (Easiest)

Since the extension is already installed in your main VSCode, you can test it right now:

1. **Make sure you're in this window** (not the Extension Development Host)
2. **Press `Ctrl+Shift+P`** to open Command Palette
3. **Type "PR Ready"** and you should see "PR Ready: Analyze Current Branch"
4. **Select it and press Enter**

The extension should now work without the "Not a git repository" error!

### Method 2: Test in Extension Development Host (For Development)

If you want to test during development:

1. **Close any Extension Development Host windows**
2. **In your main VSCode**, open the `packages/vscode-extension` folder
3. **Press `F5`** to launch Extension Development Host
4. **In the new window that opens**, use `File > Open Folder` to open `c:/Users/sukse/PRAssistant-IBMBOB`
5. **Now press `Ctrl+Shift+P`** and run "PR Ready: Analyze Current Branch"

## What Should Happen

When you run the command, you should see:

1. **Output Channel opens** showing "PR Ready" logs
2. **Configuration displayed**:
   - LLM Provider: openai
   - Base URL: http://172.16.6.27:20128/v1
   - Model: kr/claude-sonnet-4.5
3. **"Extracting git diff..."** message
4. **Number of changed files** found
5. **Analysis results** (categories, tests, risks)
6. **LLM analysis** (if your endpoint is accessible)
7. **A new markdown document** opens with the PR packet
8. **Success message**: "PR analysis complete! Results opened and copied to clipboard."

## If You Still See "Not a git repository"

This means the old version is still loaded. To fix:

1. **Uninstall the old extension**:
   ```powershell
   code --uninstall-extension pr-ready-vscode
   ```

2. **Reinstall with the fix**:
   ```powershell
   cd packages/vscode-extension
   npm run package
   code --install-extension pr-ready-vscode-0.1.0.vsix
   ```

3. **Reload VSCode**: Press `Ctrl+Shift+P` → "Developer: Reload Window"

4. **Try again**: `Ctrl+Shift+P` → "PR Ready: Analyze Current Branch"

## Quick Test Right Now

**Try this immediately in your current VSCode window:**

1. Press `Ctrl+Shift+P`
2. Type "PR Ready"
3. If you see the command, select it
4. Check the "PR Ready" output channel for results

If the command doesn't appear, the extension needs to be reinstalled with the fix.

## Verify the Fix is Working

The fix allows the extension to properly set the working directory to your workspace folder. You'll know it's working when:

- ✅ No "Not a git repository" error
- ✅ Git diff is extracted successfully
- ✅ Files are analyzed
- ✅ PR packet is generated

## Alternative: Test via CLI

If you want to verify the fix works without dealing with the extension:

```powershell
cd c:/Users/sukse/PRAssistant-IBMBOB
node packages/cli/dist/cli.js --llm openai --base origin/main
```

This should work perfectly now with the fix applied.