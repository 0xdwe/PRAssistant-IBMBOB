# Quick Test Guide - VSCode Extension

## Step-by-Step Testing Instructions

### 1. Restart the Extension Development Host
Since we just installed new dependencies and recompiled:

1. **If Extension Development Host is already running:**
   - Go to the Extension Development Host window
   - Press `Shift+F5` to stop it
   - Go back to the main VSCode window
   - Press `F5` to launch it again

2. **If not running yet:**
   - In the main VSCode window (with PRAssistant-IBMBOB open)
   - Press `F5`
   - A new window will open titled "[Extension Development Host]"

### 2. Open Your Git Repository
In the **Extension Development Host** window:
1. Click "File" → "Open Folder"
2. Navigate to your git repository (e.g., `c:/Users/sukse/PRAssistant-IBMBOB`)
3. Click "Select Folder"

### 3. Make Sure You Have Changes
You need either:
- **Uncommitted changes** (modified files), OR
- **Commits on your branch** that aren't on the base branch

To create a test change:
1. Open `README.md`
2. Add a line like: `<!-- Test change for PR Ready -->`
3. Save the file (don't commit yet)

### 4. Run the Extension Command
1. Press `Ctrl+Shift+P` (opens Command Palette)
2. Type: `PR Ready`
3. Select: **"PR Ready: Analyze Current Branch"**
4. Press Enter

### 5. Watch for Results
You should see:

**Output Channel (automatically opens):**
```
Configuration: LLM Provider: openai, Base URL: http://172.16.6.27:20128/v1, Model: kr/claude-sonnet-4.5
Extracting git diff...
Analyzing changes...
Calling LLM for analysis...
Generating PR packet...
Analysis complete!
```

**New Markdown Document (automatically opens):**
- Should show a complete PR analysis
- Should include "AI Analysis" section at the top
- Should include file changes, risk assessment, etc.

### 6. Verify Success
✅ No "Not a git repository" error
✅ Output channel shows all steps completing
✅ Markdown document opens with analysis
✅ AI Analysis section is present (if LLM call succeeded)

## Troubleshooting

### Still Getting "Not a git repository"?
1. Make sure you opened a folder that IS a git repository
2. Check the folder has a `.git` directory
3. Try opening the terminal in Extension Development Host and run: `git status`

### LLM Call Fails?
This is OK for testing! The extension will still work and show rule-based analysis.
Check if the endpoint is accessible: http://172.16.6.27:20128/v1

### Nothing Happens?
1. Check the Debug Console in the main VSCode window for errors
2. Check the Output channel in Extension Development Host
3. Try restarting: `Shift+F5` then `F5`

## What You're Testing
- ✅ Git diff extraction works
- ✅ Rule-based analysis works
- ✅ LLM integration works (if endpoint is accessible)
- ✅ Markdown output generation works
- ✅ Output channel logging works

## Expected Timeline
The whole process should take 5-10 seconds:
- Git diff: ~1 second
- Rule-based analysis: ~1 second
- LLM call: ~3-8 seconds (if endpoint is accessible)
- Markdown generation: ~1 second

---

**Ready to test?** Press `F5` in the main VSCode window to start!