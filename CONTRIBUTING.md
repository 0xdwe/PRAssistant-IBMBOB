# Contributing to PR Readiness Assistant

Thank you for your interest in contributing to PR Ready! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors. We expect:

- **Respectful Communication:** Be kind and considerate in all interactions
- **Constructive Feedback:** Provide helpful, actionable feedback
- **Collaboration:** Work together to improve the project
- **Inclusivity:** Welcome contributors of all backgrounds and skill levels

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Personal attacks or trolling
- Publishing others' private information
- Any conduct that would be inappropriate in a professional setting

## 🚀 Getting Started

### Prerequisites

- **Node.js:** >= 18.0.0
- **npm:** >= 9.0.0 (or yarn/pnpm)
- **Git:** Latest stable version
- **TypeScript:** Knowledge of TypeScript is helpful

### First Contribution

1. **Find an Issue:** Look for issues labeled `good first issue` or `help wanted`
2. **Ask Questions:** Comment on the issue if you need clarification
3. **Fork & Clone:** Fork the repository and clone your fork
4. **Make Changes:** Create a branch and implement your changes
5. **Submit PR:** Open a pull request with a clear description

## 💻 Development Setup

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/pr-ready.git
cd pr-ready
```

### 2. Install Dependencies

```bash
# Install all workspace dependencies
npm install
```

### 3. Build the Project

```bash
# Build all packages
npm run build

# Build specific package
npm run build -w @pr-ready/cli
```

### 4. Link for Local Testing

```bash
# Link CLI globally for testing
npm link -w @pr-ready/cli

# Now you can use 'pr-ready' command anywhere
pr-ready --help
```

### 5. Development Mode

```bash
# Watch mode for automatic rebuilds
npm run dev -w @pr-ready/cli

# In another terminal, test your changes
pr-ready
```

## 🏗️ Project Structure

```
PRAssistant-IBMBOB/
├── packages/
│   ├── cli/                    # CLI package
│   │   ├── src/
│   │   │   ├── cli.ts          # Entry point
│   │   │   ├── *.ts            # Core modules
│   │   │   └── llm/            # LLM providers
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── shared/                 # Shared types
│       ├── src/
│       │   └── types.ts
│       ├── package.json
│       └── tsconfig.json
├── examples/                   # Config examples
├── issues/                     # Issue specs
├── CONTRIBUTING.md            # This file
├── LICENSE                    # MIT License
├── package.json              # Root package
└── README.md                 # Main docs
```

### Key Files

- **`packages/cli/src/cli.ts`** - CLI entry point and command definitions
- **`packages/cli/src/git-diff-extractor.ts`** - Git diff extraction logic
- **`packages/cli/src/rule-based-analyzer.ts`** - File categorization and analysis
- **`packages/cli/src/pr-packet-generator.ts`** - Markdown generation
- **`packages/shared/src/types.ts`** - TypeScript type definitions

## 🔄 Development Workflow

### 1. Create a Branch

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Or a bugfix branch
git checkout -b fix/bug-description
```

### 2. Make Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update types in `packages/shared/src/types.ts` if needed

### 3. Test Your Changes

```bash
# Build the project
npm run build

# Test manually
pr-ready --help
pr-ready --test

# Run automated tests (when available)
npm test
```

### 4. Commit Your Changes

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add new feature description"
```

### 5. Push and Create PR

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create PR on GitHub
```

## 📝 Coding Standards

### TypeScript Style

```typescript
// ✅ Good: Clear types, descriptive names
interface GitDiffOptions {
  baseBranch?: string;
  headBranch?: string;
  includeUntracked?: boolean;
}

async function extractDiff(options: GitDiffOptions): Promise<GitDiff> {
  // Implementation
}

// ❌ Bad: Unclear types, vague names
function extract(opts: any): any {
  // Implementation
}
```

### Code Organization

```typescript
// ✅ Good: Organized imports
import { Command } from 'commander';
import chalk from 'chalk';
import { GitDiffExtractor } from './git-diff-extractor';
import { RuleBasedAnalyzer } from './rule-based-analyzer';
import type { GitDiff, Analysis } from '@pr-ready/shared';

// ❌ Bad: Disorganized imports
import { RuleBasedAnalyzer } from './rule-based-analyzer';
import type { GitDiff } from '@pr-ready/shared';
import chalk from 'chalk';
import { Command } from 'commander';
```

### Error Handling

```typescript
// ✅ Good: Specific error handling
try {
  const diff = await extractor.extractDiff(options);
} catch (error) {
  if (error instanceof GitError) {
    console.error(chalk.red(`Git error: ${error.message}`));
  } else {
    console.error(chalk.red('Unexpected error occurred'));
  }
  process.exit(1);
}

// ❌ Bad: Generic error handling
try {
  const diff = await extractor.extractDiff(options);
} catch (error) {
  console.error('Error');
}
```

### Naming Conventions

- **Files:** `kebab-case.ts` (e.g., `git-diff-extractor.ts`)
- **Classes:** `PascalCase` (e.g., `GitDiffExtractor`)
- **Functions:** `camelCase` (e.g., `extractDiff`)
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `DEFAULT_TIMEOUT`)
- **Interfaces/Types:** `PascalCase` (e.g., `GitDiffOptions`)

## 🧪 Testing Guidelines

### Manual Testing

```bash
# Test basic functionality
pr-ready

# Test with different options
pr-ready --base main --head feature
pr-ready --test
pr-ready --llm openai
pr-ready --no-clipboard

# Test error cases
pr-ready --base nonexistent-branch
pr-ready --config invalid.json
```

### Writing Tests (Future)

```typescript
// Example test structure
describe('GitDiffExtractor', () => {
  it('should extract diff between branches', async () => {
    const extractor = new GitDiffExtractor();
    const diff = await extractor.extractDiff({
      baseBranch: 'main',
      headBranch: 'feature'
    });
    
    expect(diff.files).toBeDefined();
    expect(diff.files.length).toBeGreaterThan(0);
  });
});
```

### Test Coverage Goals

- **Core functionality:** 80%+ coverage
- **Edge cases:** Handle errors gracefully
- **Integration:** Test CLI end-to-end

## 📝 Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat:** New feature
- **fix:** Bug fix
- **docs:** Documentation changes
- **style:** Code style changes (formatting, etc.)
- **refactor:** Code refactoring
- **test:** Adding or updating tests
- **chore:** Maintenance tasks

### Examples

```bash
# Feature
git commit -m "feat(cli): add --version flag"

# Bug fix
git commit -m "fix(analyzer): handle empty git diff correctly"

# Documentation
git commit -m "docs(readme): update installation instructions"

# With body
git commit -m "feat(llm): add Anthropic provider

- Implement Claude API integration
- Add configuration options
- Update documentation"
```

## 🔀 Pull Request Process

### Before Submitting

- [ ] Code builds without errors (`npm run build`)
- [ ] Manual testing completed
- [ ] Code follows style guidelines
- [ ] Documentation updated (if needed)
- [ ] Commit messages follow guidelines

### PR Title Format

```
<type>: <description>

Examples:
feat: Add Anthropic LLM provider
fix: Resolve clipboard copy issue on Windows
docs: Update configuration examples
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
How was this tested?

## Checklist
- [ ] Code builds successfully
- [ ] Manual testing completed
- [ ] Documentation updated
- [ ] Follows coding standards

## Related Issues
Closes #123
```

### Review Process

1. **Automated Checks:** CI/CD runs (when available)
2. **Code Review:** Maintainer reviews code
3. **Feedback:** Address review comments
4. **Approval:** Maintainer approves PR
5. **Merge:** PR merged to main branch

## 🐛 Issue Reporting

### Before Creating an Issue

1. **Search Existing Issues:** Check if already reported
2. **Check Documentation:** Review README and examples
3. **Try Latest Version:** Update to latest version

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Run command '...'
2. See error

**Expected behavior**
What should happen

**Actual behavior**
What actually happens

**Environment**
- OS: [e.g., macOS 13.0]
- Node.js: [e.g., 18.0.0]
- PR Ready version: [e.g., 0.1.0]

**Additional context**
Any other relevant information
```

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Description of the problem

**Describe the solution you'd like**
Clear description of desired feature

**Describe alternatives you've considered**
Alternative solutions or features

**Additional context**
Any other relevant information
```

## 🎯 Areas for Contribution

### High Priority

- [ ] Anthropic Claude integration
- [ ] Ollama local LLM support
- [ ] Comprehensive test suite
- [ ] VS Code extension

### Medium Priority

- [ ] GitHub Actions integration
- [ ] GitLab CI support
- [ ] Performance optimizations
- [ ] Additional LLM providers

### Low Priority

- [ ] Web dashboard
- [ ] Custom templates
- [ ] Plugin system
- [ ] Team analytics

## 📚 Resources

### Documentation

- [README.md](README.md) - Main documentation
- [examples/](examples/) - Configuration examples
- [issues/](issues/) - Issue specifications
- [PRD.md](PRD.md) - Product requirements

### External Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Commander.js Docs](https://github.com/tj/commander.js/)
- [Git Documentation](https://git-scm.com/doc)

## 💬 Communication

### Getting Help

- **GitHub Issues:** For bugs and feature requests
- **GitHub Discussions:** For questions and ideas
- **Email:** support@pr-ready.dev

### Stay Updated

- Watch the repository for updates
- Follow release notes
- Join discussions

## 🙏 Recognition

Contributors will be:
- Listed in release notes
- Credited in documentation
- Recognized in the community

Thank you for contributing to PR Ready! 🎉

---

**Questions?** Open an issue or start a discussion on GitHub.