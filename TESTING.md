# Testing Guide for PR Ready VSCode Extension

## Prerequisites

- Node.js >= 18.0.0
- VSCode installed
- Git repository for testing

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   npm run build
   ```

2. **Build the extension:**
   ```bash
   cd packages/extension
   npm run compile
   ```

## Testing the Extension

### Method 1: Run in Development Mode

1. **Open extension in VSCode:**
   ```bash
   code packages/extension
   ```

2. **Press F5** or go to **Run > Start Debugging**
   - This opens a new VSCode window with the extension loaded

3. **In the new window:**
   - Open a git repository
   - Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
   - Type "PR Ready: Analyze Changes"
   - Press Enter

4. **Expected behavior:**
   - Progress notification appears
   - Markdown document opens with PR analysis
   - Content copied to clipboard
   - Success message shows file count

### Method 2: Install as VSIX

1. **Package the extension:**
   ```bash
   cd packages/extension
   npm install -g @vscode/vsce
   vsce package
   ```

2. **Install the .vsix file:**
   - In VSCode: Extensions view (Cmd+Shift+X)
   - Click "..." menu → "Install from VSIX..."
   - Select `pr-ready-vscode-0.1.0.vsix`

3. **Test as in Method 1, step 3-4**

## Test Scenarios

### Scenario 1: Basic Analysis
```bash
# Create test changes
echo "test" >> test.txt
git add test.txt
```
Run command → Should show 1 file changed

### Scenario 2: No Changes
```bash
# Ensure clean working directory
git status
```
Run command → Should show "No changes detected"

### Scenario 3: Multiple File Types
```bash
# Create various files
touch src/app.ts src/app.test.ts README.md
git add .
```
Run command → Should categorize files correctly

### Scenario 4: Error Handling
- Run in non-git directory → Should show error
- Run with no workspace → Should show error

## Troubleshooting

### Extension not activating
- Check VSCode output panel: View > Output > PR Ready
- Verify extension installed: Extensions view

### Command not found
- Reload window: Cmd+Shift+P → "Reload Window"
- Check package.json contributes.commands

### Import errors
```bash
cd packages/extension
npm install
npm run compile
```

### TypeScript errors
```bash
# Rebuild CLI first
cd packages/cli
npm run build

# Then rebuild extension
cd ../extension
npm run compile
```

## Verification Checklist

- [ ] Extension activates on startup
- [ ] Command appears in command palette
- [ ] Analyzes git changes correctly
- [ ] Opens markdown document
- [ ] Copies to clipboard
- [ ] Shows progress notifications
- [ ] Handles errors gracefully
- [ ] Works with no changes
- [ ] Categorizes files correctly
- [ ] Detects test files

## Debug Tips

1. **View logs:**
   - Help > Toggle Developer Tools
   - Console tab shows extension logs

2. **Check extension host:**
   - View > Output > Extension Host

3. **Reload extension:**
   - Cmd+Shift+P → "Developer: Reload Window"

4. **Uninstall/reinstall:**
   - Extensions view → Right-click → Uninstall
   - Reinstall from VSIX or F5

## Expected Output Example

```markdown
# PR Readiness Report

## Summary
This PR modifies 3 file(s) across 2 categories.

## Files Changed
### ⚙️ Backend (1)
- src/app.ts (+10, -2)

### 🧪 Tests (1)
- src/app.test.ts (+25, -0)

### 📚 Documentation (1)
- README.md (+5, -1)

## Test Coverage
✅ Test files detected: 1
✅ All modified source files have tests

## Reviewer Checklist
- [ ] Code changes reviewed
- [ ] Tests are adequate
- [ ] Documentation updated