# Testing Guide

This guide covers testing for both the CLI tool and VSCode extension.

## Prerequisites

- Node.js >= 18.0.0
- VSCode installed
- Git repository for testing

## Setup

```bash
# Install dependencies
npm install

# Build all packages
npm run build
```

## Testing the CLI

### Basic Tests

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Manual CLI Testing

```bash
# Test with uncommitted changes
echo "test" >> test.txt
pr-ready

# Test with branch comparison
git checkout -b test-branch
echo "test" >> test.txt
git add test.txt
git commit -m "test"
pr-ready --base main --head test-branch

# Test with LLM (requires API key)
export OPENAI_API_KEY=your-key
pr-ready --llm openai

# Test with test execution
pr-ready --test

# Test with custom output
pr-ready --output custom.md --no-clipboard
```

## Testing the VSCode Extension

### Method 1: Debug Mode (Recommended)

1. **Open the project in VSCode**
   ```bash
   code .
   ```

2. **Start debugging:**
   - Press `F5` or go to Run > Start Debugging
   - Select "Run Extension" from the dropdown
   - A new VSCode window opens with the extension loaded

3. **Test the extension:**
   - In the Extension Development Host window, open a git repository
   - Make some changes to files (or have uncommitted changes)
   - Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
   - Type "PR Ready: Analyze Changes"
   - Press Enter

4. **Expected behavior:**
   - Progress notification: "Extracting git diff..."
   - Progress notification: "Analyzing changes..."
   - Progress notification: "Generating PR packet..."
   - Markdown document opens with PR analysis
   - Content is copied to clipboard
   - Success message: "PR analysis complete: X files changed"

### Method 2: Install as VSIX

```bash
# Install vsce globally
npm install -g @vscode/vsce

# Package the extension
cd packages/extension
vsce package

# Install in VSCode
# Extensions view (Cmd+Shift+X) > "..." menu > "Install from VSIX..."
# Select pr-ready-vscode-0.1.0.vsix
```

## Test Scenarios

### Scenario 1: Uncommitted Changes (Default)

```bash
# Make some changes without committing
echo "# Test" >> README.md
echo "console.log('test');" >> src/test.ts
```

**Run:** PR Ready: Analyze Changes

**Expected:**
- Detects uncommitted changes
- Shows "HEAD" vs "Working Directory"
- Lists all modified files

### Scenario 2: Branch Comparison

```bash
# Create and commit changes
git checkout -b feature-branch
echo "test" >> test.txt
git add test.txt
git commit -m "Add test file"
```

**Run:** `pr-ready --base main --head feature-branch`

**Expected:**
- Compares branches
- Shows committed changes only

### Scenario 3: No Changes

```bash
# Ensure clean working directory
git status  # Should show "nothing to commit"
```

**Run:** PR Ready: Analyze Changes

**Expected:**
- Error message: "No uncommitted changes found"

### Scenario 4: Multiple File Types

```bash
# Create various file types
touch src/app.ts
touch src/app.test.ts
touch README.md
touch .env
git add .
```

**Run:** PR Ready: Analyze Changes

**Expected:**
- Files categorized correctly:
  - Backend: src/app.ts
  - Tests: src/app.test.ts
  - Docs: README.md
  - Config: .env

### Scenario 5: High-Risk Files

```bash
# Create high-risk files
mkdir -p migrations
echo "ALTER TABLE users..." >> migrations/001_add_column.sql
touch src/auth/login.ts
git add .
```

**Run:** PR Ready: Analyze Changes

**Expected:**
- Risk assessment shows:
  - 🔴 High Risk: migrations/001_add_column.sql (Database schema change)
  - 🔴 High Risk: src/auth/login.ts (Authentication code)

### Scenario 6: Test Detection

```bash
# Modify source without tests
echo "function add() {}" >> src/math.ts
git add src/math.ts
```

**Run:** PR Ready: Analyze Changes

**Expected:**
- Warning: "No test files modified despite source code changes"

```bash
# Add corresponding test
echo "test('add', () => {})" >> src/math.test.ts
git add src/math.test.ts
```

**Run:** PR Ready: Analyze Changes

**Expected:**
- ✅ Test files detected: 1

## Troubleshooting

### Extension Not Activating

**Check:**
- VSCode Output panel: View > Output > PR Ready
- Extension installed: Extensions view
- Console errors: Help > Toggle Developer Tools

**Fix:**
```bash
# Rebuild extension
cd packages/extension
npm run build

# Reload VSCode
Cmd+Shift+P > "Developer: Reload Window"
```

### Command Not Found

**Fix:**
```bash
# Reload window
Cmd+Shift+P > "Reload Window"

# Or restart VSCode
```

### Import Errors

**Fix:**
```bash
# Rebuild all packages
npm run build

# Specifically rebuild CLI (extension depends on it)
cd packages/cli
npm run build

# Then rebuild extension
cd ../extension
npm run build
```

### Git Errors

**Check:**
- You're in a git repository: `git status`
- Git is installed: `git --version`
- Repository has commits: `git log`

### No Changes Detected

**Possible causes:**
1. No uncommitted changes and no branch specified
2. Comparing identical branches
3. All changes are in ignored files (.gitignore)

**Fix:**
- Make some changes: `echo "test" >> test.txt`
- Or specify branches: `pr-ready --base main --head feature`

## Verification Checklist

### CLI
- [ ] Detects uncommitted changes
- [ ] Compares branches correctly
- [ ] Categorizes files properly
- [ ] Detects test files
- [ ] Identifies high-risk changes
- [ ] Generates markdown output
- [ ] Copies to clipboard
- [ ] Handles errors gracefully
- [ ] Works with monorepos
- [ ] Executes tests (with --test flag)
- [ ] Integrates with LLM (with --llm flag)

### VSCode Extension
- [ ] Extension activates on startup
- [ ] Command appears in command palette
- [ ] Analyzes uncommitted changes
- [ ] Opens markdown document
- [ ] Copies to clipboard
- [ ] Shows progress notifications
- [ ] Handles errors gracefully
- [ ] Works with no changes
- [ ] Works in different workspaces

## Debug Tips

### CLI Debugging

```bash
# Enable verbose logging
DEBUG=pr-ready:* pr-ready

# Check git status
git status
git diff HEAD

# Test git diff extraction directly
node -e "const {GitDiffExtractor} = require('./packages/cli/dist/git-diff-extractor'); new GitDiffExtractor().extractDiff().then(console.log)"
```

### Extension Debugging

1. **View logs:**
   - Help > Toggle Developer Tools
   - Console tab shows extension logs

2. **Check extension host:**
   - View > Output > Extension Host

3. **Reload extension:**
   - Cmd+Shift+P > "Developer: Reload Window"

4. **Set breakpoints:**
   - Open `packages/extension/src/extension.ts`
   - Click left margin to set breakpoints
   - Press F5 to debug

## Performance Testing

```bash
# Test with large diff
git diff HEAD~10 HEAD

# Test with many files
for i in {1..100}; do echo "test" >> "file$i.txt"; done
git add .
pr-ready

# Clean up
rm file*.txt
```

## Expected Output Example

```markdown
# PR Readiness Report

## Summary
This PR modifies 3 file(s) across 2 categories. Changes include: backend (2), tests (1).

## Change Details
- **Base Branch**: `HEAD`
- **Head Branch**: `Working Directory`
- **Files Changed**: 3
- **Total Changes**: +35 lines

## Files Changed
### ⚙️ Backend (2)
- `src/app.ts`
- `src/utils.ts`

### 🧪 Tests (1)
- `src/app.test.ts`

## Test Coverage
✅ **1 test file(s) modified**
- `src/app.test.ts`

## Risk Assessment
✅ No high-risk changes detected

## Reviewer Checklist
- [ ] All tests pass locally
- [ ] No breaking changes (or documented in PR description)
- [ ] New tests cover edge cases
- [ ] Changes are well-documented
- [ ] Code follows project style guidelines
- [ ] No unnecessary console.log or debug code
```

## Continuous Integration

The project uses GitHub Actions for CI. Tests run automatically on:
- Push to main
- Pull requests
- Manual workflow dispatch

See `.github/workflows/` for CI configuration.

---

For more information, see [README.md](README.md)