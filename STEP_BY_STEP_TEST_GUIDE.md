# Complete Step-by-Step Testing Guide - From Start to Finish

## Step 1: Open VSCode with the Project

1. **Open VSCode**
   - Launch Visual Studio Code application

2. **Open the Project Folder**
   - Click `File` → `Open Folder...`
   - Navigate to: `c:\Users\sukse\PRAssistant-IBMBOB`
   - Click `Select Folder`
   - Wait for VSCode to load the workspace

## Step 2: Verify the Project is Ready

You should see in the Explorer (left sidebar):
```
PRAssistant-IBMBOB/
├── packages/
│   ├── cli/
│   ├── shared/
│   └── vscode-extension/
├── .pr-ready.json
├── package.json
└── ... other files
```

## Step 3: Launch Extension Development Host

1. **Press F5** (or click Run → Start Debugging)
   - This will compile and launch the extension in a new window
   - You'll see a new VSCode window open with title: **"[Extension Development Host]"**
   - The original window is your "main" window
   - The new window is where you'll test the extension

**What's happening:**
- VSCode compiles the extension
- Launches a new VSCode instance with your extension loaded
- This is a sandboxed environment for testing

## Step 4: In the Extension Development Host Window

Now you have TWO VSCode windows:
- **Main Window**: Your development window (stays open)
- **Extension Development Host**: Testing window (just opened)

**In the Extension Development Host window:**

1. **Open the Same Folder**
   - Click `File` → `Open Folder...`
   - Navigate to: `c:\Users\sukse\PRAssistant-IBMBOB`
   - Click `Select Folder`

2. **Make a Test Change**
   - Open `README.md` (or any file)
   - Add a line: `<!-- Test change for extension -->`
   - Press `Ctrl+S` to save
   - **Don't commit this change yet!**

## Step 5: Run the Extension Command

**In the Extension Development Host window:**

1. **Open Command Palette**
   - Press `Ctrl+Shift+P`
   - A search box appears at the top

2. **Find the Command**
   - Type: `PR Ready`
   - You should see: **"PR Ready: Analyze Current Branch"**
   - Click it or press Enter

## Step 6: Watch the Magic Happen! ✨

You should see:

### A. Output Channel Opens (bottom panel)
Look for a tab called **"PR Ready"** with output like:
```
Configuration: LLM Provider: openai, Base URL: http://172.16.6.27:20128/v1, Model: kr/claude-sonnet-4.5
Extracting git diff...
Analyzing changes...
Calling LLM for analysis...
Generating PR packet...
Analysis complete!
```

### B. New Markdown Document Opens
A new tab opens with content like:
```markdown
# PR Readiness Analysis

## AI Analysis
[Summary from the LLM about your changes]

## Summary
- Files changed: 1
- Lines added: 1
- Lines removed: 0

## File Changes
### Documentation (1 file)
- README.md

... more analysis ...
```

## Step 7: Verify Success ✅

Check these things:

- [ ] No error messages in the Output channel
- [ ] No "Not a git repository" error
- [ ] Markdown document opened automatically
- [ ] Markdown contains "AI Analysis" section (if LLM endpoint is accessible)
- [ ] Markdown contains file changes and analysis

## Troubleshooting

### If You See "Not a git repository"
This should be FIXED now, but if you still see it:
1. Make sure you opened `c:\Users\sukse\PRAssistant-IBMBOB` in Extension Development Host
2. Check that folder has a `.git` directory
3. Try closing Extension Development Host and pressing F5 again

### If Nothing Happens
1. Check the **Debug Console** in the main window (not Extension Development Host)
   - Click `View` → `Debug Console`
   - Look for error messages
2. Try restarting: Press `Shift+F5` to stop, then `F5` to start again

### If LLM Call Fails
This is OK! The extension will still work and show rule-based analysis.
The LLM section might say "LLM analysis not available" or be missing.

### If You Don't See the Command
1. Make sure you're in the Extension Development Host window
2. Try typing the full command: "PR Ready: Analyze Current Branch"
3. Check the Debug Console in main window for activation errors

## Understanding the Two Windows

**Main Window (Development):**
- Where you edit code
- Shows Debug Console with extension logs
- Press F5 here to launch Extension Development Host
- Press Shift+F5 to stop Extension Development Host

**Extension Development Host (Testing):**
- Where you test the extension
- Has your extension loaded
- Run commands here
- See results here

## Quick Reference

| Action | Shortcut |
|--------|----------|
| Launch Extension Development Host | F5 (in main window) |
| Stop Extension Development Host | Shift+F5 (in main window) |
| Open Command Palette | Ctrl+Shift+P |
| Save File | Ctrl+S |
| Open Debug Console | Ctrl+Shift+Y |

## What You're Testing

When you run the command, the extension:
1. ✅ Reads your VSCode configuration
2. ✅ Extracts git diff (uncommitted changes)
3. ✅ Analyzes changes with rule-based analyzer
4. ✅ Calls LLM for AI analysis (if endpoint is accessible)
5. ✅ Generates markdown PR packet
6. ✅ Opens the result in a new document
7. ✅ Shows progress in Output channel

## Success Criteria

You've successfully tested the extension when:
- ✅ Extension Development Host launches without errors
- ✅ Command appears in Command Palette
- ✅ Command executes without "Not a git repository" error
- ✅ Output channel shows all steps completing
- ✅ Markdown document opens with analysis
- ✅ Analysis includes your test change

---

## Ready? Let's Start!

1. Open VSCode
2. Open folder: `c:\Users\sukse\PRAssistant-IBMBOB`
3. Press F5
4. Follow steps above

**Need help?** Check the Debug Console in the main window for any error messages.