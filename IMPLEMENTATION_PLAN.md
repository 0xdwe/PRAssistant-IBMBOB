
# Core CLI Implementation Plan (Issues 001-007)

## Overview

This plan covers the implementation of the core CLI functionality for PR Readiness Assistant, including git diff extraction, rule-based analysis, markdown generation, clipboard output, and configuration system.

## Project Structure

```
pr-readiness-assistant/
├── package.json                    # Root workspace config
├── tsconfig.json                   # Root TypeScript config
├── .gitignore
├── README.md
├── IMPLEMENTATION_PLAN.md
├── packages/
│   ├── cli/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── index.ts           # CLI entry point
│   │   │   ├── commands/
│   │   │   │   └── analyze.ts     # Main analyze command
│   │   │   ├── modules/
│   │   │   │   ├── GitDiffExtractor.ts
│   │   │   │   ├── RuleBasedAnalyzer.ts
│   │   │   │   ├── PRPacketGenerator.ts
│   │   │   │   ├── OutputHandler.ts
│   │   │   │   └── ConfigManager.ts
│   │   │   └── utils/
│   │   │       ├── git-utils.ts
│   │   │       └── error-handler.ts
│   │   └── bin/
│   │       └── pr-ready.js        # Executable entry
│   └── shared/
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── types/
│           │   ├── git.ts         # GitDiff, DiffOptions types
│           │   ├── analysis.ts    # Analysis, RuleAnalysis types
│           │   ├── config.ts      # Config types
│           │   └── output.ts      # PRPacket, OutputOptions types
│           └── index.ts           # Export all types
```

## Dependencies

### Root package.json
```json
{
  "name": "pr-readiness-assistant",
  "version": "0.1.0",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces",
    "dev": "npm run dev -w @pr-ready/cli"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.3",
    "tsx": "^4.7.0",
    "vitest": "^1.0.4"
  }
}
```

### packages/cli/package.json
```json
{
  "name": "@pr-ready/cli",
  "version": "0.1.0",
  "type": "module",
  "bin": {
    "pr-ready": "./bin/pr-ready.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/index.ts",
    "test": "vitest"
  },
  "dependencies": {
    "@pr-ready/shared": "workspace:*",
    "commander": "^11.1.0",
    "simple-git": "^3.21.0",
    "clipboardy": "^4.0.0",
    "chalk": "^5.3.0",
    "ora": "^8.0.1"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.3"
  }
}
```

### packages/shared/package.json
```json
{
  "name": "@pr-ready/shared",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "vitest"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.3"
  }
}
```

## Implementation Steps

### Phase 1: Project Setup (Issue 001 - Part 1)

#### Step 1.1: Initialize Monorepo
```bash
# Create project structure
mkdir -p pr-readiness-assistant/packages/{cli,shared}
cd pr-readiness-assistant

# Initialize root package.json
npm init -y
```

**Files to create:**
- `package.json` (root workspace config)
- `.gitignore`
- `README.md`

**Verification:**
```bash
npm install
# Should install without errors
```

#### Step 1.2: Setup TypeScript Configuration

**Root tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

**packages/cli/tsconfig.json:**
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "references": [
    { "path": "../shared" }
  ]
}
```

**packages/shared/tsconfig.json:**
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true
  },
  "include": ["src/**/*"]
}
```

**Verification:**
```bash
cd packages/shared && npx tsc --noEmit
cd ../cli && npx tsc --noEmit
```

#### Step 1.3: Create Shared Types Package

**packages/shared/src/types/git.ts:**
```typescript
export interface DiffOptions {
  base?: string;
  head?: string;
  cwd?: string;
}

export interface FileDiff {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  additions: number;
  deletions: number;
  changes: string;
  oldPath?: string; // For renamed files
}

export interface GitDiff {
  files: FileDiff[];
  totalAdditions: number;
  totalDeletions: number;
  baseBranch: string;
  headBranch: string;
  commitCount: number;
}
```

**packages/shared/src/types/analysis.ts:**
```typescript
export type FileCategory = 
  | 'frontend'
  | 'backend'
  | 'tests'
  | 'config'
  | 'docs'
  | 'root'
  | 'other';

export interface CategorizedFile {
  path: string;
  category: FileCategory;
  additions: number;
  deletions: number;
}

export interface TestDetection {
  testFiles: string[];
  hasTests: boolean;
  hasSourceChanges: boolean;
  missingTests: boolean;
}

export type RiskLevel = 'high' | 'medium' | 'low';

export interface RiskFlag {
  file: string;
  level: RiskLevel;
  reason: string;
  pattern: string;
}

export interface RuleAnalysis {
  categorizedFiles: CategorizedFile[];
  testDetection: TestDetection;
  riskFlags: RiskFlag[];
  summary: {
    totalFiles: number;
    categoryCounts: Record<FileCategory, number>;
    testFileCount: number;
    riskCount: number;
  };
}
```

**packages/shared/src/types/config.ts:**
```typescript
export interface RiskPattern {
  pattern: string;
  level: RiskLevel;
  reason: string;
}

export interface Config {
  llm?: {
    provider?: 'openai' | 'anthropic' | 'ollama';
    apiKey?: string;
    model?: string;
  };
  test?: {
    patterns?: string[];
    commands?: string[];
  };
  risks?: {
    patterns?: RiskPattern[];
    largeFileThreshold?: number;
  };
  output?: {
    file?: string;
    clipboard?: boolean;
  };
  monorepo?: {
    enabled?: boolean;
    packages?: string[];
  };
}

export interface RiskLevel {
  // Imported from analysis.ts
}
```

**packages/shared/src/types/output.ts:**
```typescript
import { RuleAnalysis } from './analysis.js';

export interface PRPacket {
  summary: string;
  filesChanged: string;
  tests: string;
  risks: string;
  checklist: string;
  fullMarkdown: string;
}

export interface OutputOptions {
  file?: string;
  clipboard?: boolean;
}
```

**packages/shared/src/index.ts:**
```typescript
export * from './types/git.js';
export * from './types/analysis.js';
export * from './types/config.js';
export * from './types/output.js';
```

**Verification:**
```bash
cd packages/shared
npm run build
# Should compile without errors
```

### Phase 2: Git Diff Extraction (Issue 001 - Part 2)

#### Step 2.1: Create GitDiffExtractor Module

**packages/cli/src/modules/GitDiffExtractor.ts:**
```typescript
import simpleGit, { SimpleGit, DiffResult } from 'simple-git';
import { DiffOptions, GitDiff, FileDiff } from '@pr-ready/shared';

export class GitDiffExtractor {
  private git: SimpleGit;

  constructor(cwd: string = process.cwd()) {
    this.git = simpleGit(cwd);
  }

  async extractDiff(options: DiffOptions = {}): Promise<GitDiff> {
    // Verify we're in a git repository
    const isRepo = await this.git.checkIsRepo();
    if (!isRepo) {
      throw new Error('Not a git repository');
    }

    // Get current branch
    const currentBranch = await this.git.revparse(['--abbrev-ref', 'HEAD']);
    const headBranch = options.head || currentBranch;

    // Auto-detect base branch if not provided
    const baseBranch = options.base || await this.detectUpstreamBranch();

    // Get diff summary
    const diffSummary = await this.git.diffSummary([baseBranch, headBranch]);

    // Get detailed diff for each file
    const files: FileDiff[] = await Promise.all(
      diffSummary.files.map(file => this.getFileDiff(file, baseBranch, headBranch))
    );

    // Get commit count
    const log = await this.git.log({ from: baseBranch, to: headBranch });

    return {
      files,
      totalAdditions: diffSummary.insertions,
      totalDeletions: diffSummary.deletions,
      baseBranch,
      headBranch,
      commitCount: log.total
    };
  }

  private async detectUpstreamBranch(): Promise<string> {
    // Try common upstream branches
    const candidates = ['origin/main', 'origin/master', 'main', 'master'];
    
    for (const branch of candidates) {
      try {
        await this.git.revparse([branch]);
        return branch;
      } catch {
        continue;
      }
    }

    throw new Error('Could not auto-detect upstream branch. Please specify --base flag.');
  }

  private async getFileDiff(
    file: any,
    baseBranch: string,
    headBranch: string
  ): Promise<FileDiff> {
    const diff = await this.git.diff([baseBranch, headBranch, '--', file.file]);

    return {
      path: file.file,
      status: this.mapStatus(file),
      additions: file.insertions,
      deletions: file.deletions,
      changes: diff,
      oldPath: file.rename ? file.file : undefined
    };
  }

  private mapStatus(file: any): FileDiff['status'] {
    if (file.binary) return 'modified';
    // Map simple-git status to our status
    // This is simplified - adjust based on actual simple-git output
    return 'modified';
  }
}
```

**Verification:**
```bash
# Create test script
cd packages/cli
npm run dev -- --base main --head feature-branch
# Should output diff summary
```

#### Step 2.2: Create CLI Entry Point

**packages/cli/bin/pr-ready.js:**
```javascript
#!/usr/bin/env node
import '../dist/index.js';
```

**packages/cli/src/index.ts:**
```typescript
import { Command } from 'commander';
import { analyzeCommand } from './commands/analyze.js';

const program = new Command();

program
  .name('pr-ready')
  .description('PR Readiness Assistant - Analyze branch changes and generate PR packets')
  .version('0.1.0');

program
  .command('analyze', { isDefault: true })
  .description('Analyze git diff and generate PR packet')
  .option('-b, --base <branch>', 'Base branch to compare against')
  .option('-h, --head <branch>', 'Head branch to compare (default: current branch)')
  .option('--no-clipboard', 'Skip copying to clipboard')
  .option('--config <path>', 'Path to config file')
  .action(analyzeCommand);

program.parse();
```

**packages/cli/src/commands/analyze.ts:**
```typescript
import { GitDiffExtractor } from '../modules/GitDiffExtractor.js';
import chalk from 'chalk';
import ora from 'ora';

interface AnalyzeOptions {
  base?: string;
  head?: string;
  clipboard?: boolean;
  config?: string;
}

export async function analyzeCommand(options: AnalyzeOptions) {
  const spinner = ora('Extracting git diff...').start();

  try {
    const extractor = new GitDiffExtractor();
    const diff = await extractor.extractDiff({
      base: options.base,
      head: options.head
    });

    spinner.succeed('Git diff extracted');

    console.log(chalk.bold('\n📊 Diff Summary:'));
    console.log(`  Base: ${chalk.cyan(diff.baseBranch)}`);
    console.log(`  Head: ${chalk.cyan(diff.headBranch)}`);
    console.log(`  Files changed: ${chalk.yellow(diff.files.length)}`);
    console.log(`  Additions: ${chalk.green(`+${diff.totalAdditions}`)}`);
    console.log(`  Deletions: ${chalk.red(`-${diff.totalDeletions}`)}`);
    console.log(`  Commits: ${chalk.blue(diff.commitCount)}`);

  } catch (error) {
    spinner.fail('Failed to extract git diff');
    console.error(chalk.red(`\n❌ Error: ${error.message}`));
    process.exit(1);
  }
}
```

**Verification:**
```bash
npm run build
chmod +x bin/pr-ready.js
./bin/pr-ready.js
# Should show diff summary
```

### Phase 3: Rule-Based Analysis (Issues 002, 003, 004)

#### Step 3.1: Create RuleBasedAnalyzer Module

**packages/cli/src/modules/RuleBasedAnalyzer.ts:**
```typescript
import { GitDiff, RuleAnalysis, CategorizedFile, FileCategory, TestDetection, RiskFlag, RiskLevel } from '@pr-ready/shared';

export class RuleBasedAnalyzer {
  private testPatterns = [
    /\.test\.(ts|js|tsx|jsx)$/,
    /\.spec\.(ts|js|tsx|jsx)$/,
    /__tests__\//,
    /\.test\./,
    /\.spec\./
  ];

  private categoryPatterns: Record<FileCategory, RegExp[]> = {
    frontend: [
      /^(src\/)?components?\//i,
      /^(src\/)?pages?\//i,
      /^(src\/)?views?\//i,
      /^(src\/)?styles?\//i,
      /^(src\/)?assets?\//i,
      /\.(css|scss|sass|less|vue|jsx|tsx)$/
    ],
    backend: [
      /^(src\/)?api\//i,
      /^(src\/)?server\//i,
      /^(src\/)?controllers?\//i,
      /^(src\/)?models?\//i,
      /^(src\/)?services?\//i,
      /^(src\/)?routes?\//i,
      /^(src\/)?middleware\//i
    ],
    tests: [
      /__tests__\//,
      /\.(test|spec)\.(ts|js|tsx|jsx)$/,
      /^tests?\//i,
      /^e2e\//i
    ],
    config: [
      /\.(config|rc)\.(js|ts|json|yaml|yml)$/,
      /^\..*rc$/,
      /package\.json$/,
      /tsconfig\.json$/,
      /webpack\.config/,
      /vite\.config/,
      /rollup\.config/
    ],
    docs: [
      /\.(md|mdx|txt)$/i,
      /^docs?\//i,
      /README/i,
      /CHANGELOG/i,
      /LICENSE/i
    ],
    root: [
      /^[^\/]+$/  // Files in root directory
    ],
    other: []
  };

  private riskPatterns = [
    {
      pattern: /migrations?\//i,
      level: 'high' as RiskLevel,
      reason: 'Database migration'
    },
    {
      pattern: /schema/i,
      level: 'high' as RiskLevel,
      reason: 'Database schema change'
    },
    {
      pattern: /auth/i,
      level: 'high' as RiskLevel,
      reason: 'Authentication/authorization change'
    },
    {
      pattern: /security/i,
      level: 'high' as RiskLevel,
      reason: 'Security-related change'
    },
    {
      pattern: /\.config\.(js|ts)$/,
      level: 'medium' as RiskLevel,
      reason: 'Configuration file change'
    },
    {
      pattern: /package\.json$/,
      level: 'medium' as RiskLevel,
      reason: 'Dependency change'
    },
    {
      pattern: /Dockerfile/,
      level: 'medium' as RiskLevel,
      reason: 'Docker configuration change'
    }
  ];

  analyze(diff: GitDiff): RuleAnalysis {
    const categorizedFiles = this.categorizeFiles(diff);
    const testDetection = this.detectTests(diff);
    const riskFlags = this.detectRisks(diff);

    const categoryCounts = categorizedFiles.reduce((acc, file) => {
      acc[file.category] = (acc[file.category] || 0) + 1;
      return acc;
    }, {} as Record<FileCategory, number>);

    return {
      categorizedFiles,
      testDetection,
      riskFlags,
      summary: {
        totalFiles: diff.files.length,
        categoryCounts,
        testFileCount: testDetection.testFiles.length,
        riskCount: riskFlags.length
      }
    };
  }

  private categorizeFiles(diff: GitDiff): CategorizedFile[] {
    return diff.files.map(file => ({
      path: file.path,
      category: this.determineCategory(file.path),
      additions: file.additions,
      deletions: file.deletions
    }));
  }

  private determineCategory(filePath: string): FileCategory {
    // Check each category in priority order
    for (const [category, patterns] of Object.entries(this.categoryPatterns)) {
      if (category === 'other') continue;
      
      for (const pattern of patterns) {
        if (pattern.test(filePath)) {
          return category as FileCategory;
        }
      }
    }
    
    return 'other';
  }

  private detectTests(diff: GitDiff): TestDetection {
    const testFiles = diff.files
      .filter(file => this.isTestFile(file.path))
      .map(file => file.path);

    const sourceFiles = diff.files
      .filter(file => !this.isTestFile(file.path))
      .filter(file => this.isSourceFile(file.path));

    const hasTests = testFiles.length > 0;
    const hasSourceChanges = sourceFiles.length > 0;
    const missingTests = hasSourceChanges && !hasTests;

    return {
      testFiles,
      hasTests,
      hasSourceChanges,
      missingTests
    };
  }

  private isTestFile(filePath: string): boolean {
    return this.testPatterns.some(pattern => pattern.test(filePath));
  }

  private isSourceFile(filePath: string): boolean {
    // Consider files that are likely source code
    const sourceExtensions = /\.(ts|js|tsx|jsx|py|java|go|rb|php|cs)$/;
    const excludePatterns = [
      /node_modules\//,
      /dist\//,
      /build\//,
      /\.min\./,
      /package-lock\.json$/,
      /yarn\.lock$/
    ];

    return sourceExtensions.test(filePath) && 
           !excludePatterns.some(pattern => pattern.test(filePath));
  }

  private detectRisks(diff: GitDiff): RiskFlag[] {
    const risks: RiskFlag[] = [];

    for (const file of diff.files) {
      // Check pattern-based risks
      for (const risk of this.riskPatterns) {
        if (risk.pattern.test(file.path)) {
          risks.push({
            file: file.path,
            level: risk.level,
            reason: risk.reason,
            pattern: risk.pattern.source
          });
        }
      }

      // Check for large refactors
      const totalChanges = file.additions + file.deletions;
      if (totalChanges > 500) {
        risks.push({
          file: file.path,
          level: 'medium',
          reason: `Large refactor (${totalChanges} lines changed)`,
          pattern: 'large-file-change'
        });
      }
    }

    return risks;
  }
}
```

**Verification:**
```bash
# Update analyze command to use RuleBasedAnalyzer
npm run build
./bin/pr-ready.js
# Should show categorized files, test detection, and risks
```

#### Step 3.2: Update Analyze Command

**packages/cli/src/commands/analyze.ts (updated):**
```typescript
import { GitDiffExtractor } from '../modules/GitDiffExtractor.js';
import { RuleBasedAnalyzer } from '../modules/RuleBasedAnalyzer.js';
import chalk from 'chalk';
import ora from 'ora';

interface AnalyzeOptions {
  base?: string;
  head?: string;
  clipboard?: boolean;
  config?: string;
}

export async function analyzeCommand(options: AnalyzeOptions) {
  let spinner = ora('Extracting git diff...').start();

  try {
    // Extract diff
    const extractor = new GitDiffExtractor();
    const diff = await extractor.extractDiff({
      base: options.base,
      head: options.head
    });
    spinner.succeed('Git diff extracted');

    // Analyze diff
    spinner = ora('Analyzing changes...').start();
    const analyzer = new RuleBasedAnalyzer();
    const analysis = analyzer.analyze(diff);
    spinner.succeed('Analysis complete');

    // Display results
    console.log(chalk.bold('\n📊 Diff Summary:'));
    console.log(`  Base: ${chalk.cyan(diff.baseBranch)}`);
    console.log(`  Head: ${chalk.cyan(diff.headBranch)}`);
    console.log(`  Files changed: ${chalk.yellow(diff.files.length)}`);
    console.log(`  Additions: ${chalk.green(`+${diff.totalAdditions}`)}`);
    console.log(`  Deletions: ${chalk.red(`-${diff.totalDeletions}`)}`);

    // Display categories
    console.log(chalk.bold('\n📁 Files by Category:'));
    Object.entries(analysis.summary.categoryCounts).forEach(([category, count]) => {
      if (count > 0) {
        console.log(`  ${category}: ${chalk.yellow(count)}`);
      }
    });

    // Display test detection
    console.log(chalk.bold('\n🧪 Test Detection:'));
    if (analysis.testDetection.hasTests) {
      console.log(chalk.green(`  ✓ Tests found: ${analysis.testDetection.testFiles.length} files`));
    } else if (analysis.testDetection.missingTests) {
      console.log(chalk.yellow('  ⚠️  No tests detected (source code changed)'));
    } else {
      console.log(chalk.gray('  No source code changes'));
    }

    // Display risks
    if (analysis.riskFlags.length > 0) {
      console.log(chalk.bold('\n⚠️  Risk Flags:'));
      analysis.riskFlags.forEach(risk => {
        const icon = risk.level === 'high' ? '🔴' : '🟡';
        console.log(`  ${icon} ${chalk.yellow(risk.file)}: ${risk.reason}`);
      });
    }

  } catch (error) {
    spinner.fail('Failed to analyze changes');
    console.error(chalk.red(`\n❌ Error: ${error.message}`));
    process.exit(1);
  }
}
```

**Verification:**
```bash
npm run build
./bin/pr-ready.js
# Should show full analysis with categories, tests, and risks
```

### Phase 4: PR Packet Generation (Issue 005)

#### Step 4.1: Create PRPacketGenerator Module

**packages/cli/src/modules/PRPacketGenerator.ts:**
```typescript
import { RuleAnalysis, PRPacket, GitDiff } from '@pr-ready/shared';

export class PRPacketGenerator {
  generate(diff: GitDiff, analysis: RuleAnalysis): PRPacket {
    const summary = this.generateSummary(diff, analysis);
    const filesChanged = this.generateFilesSection(analysis);
    const tests = this.generateTestsSection(analysis);
    const risks = this.generateRisksSection(analysis);
    const checklist = this.generateChecklist(analysis);

    const fullMarkdown = this.assembleMarkdown({
      summary,
      filesChanged,
      tests,
      risks,
      checklist
    });

    return {
      summary,
      filesChanged,
      tests,
      risks,
      checklist,
      fullMarkdown
    };
  }

  private generateSummary(diff: GitDiff, analysis: RuleAnalysis): string {
    const categoryList = Object.entries(analysis.summary.categoryCounts)
      .filter(([_, count]) => count > 0)
      .map(([category, count]) => `${count} ${category}`)
      .join(', ');

    return `## Summary

This PR includes changes to **${diff.files.length} files** across ${Object.keys(analysis.summary.categoryCounts).length} categories: ${categoryList}.

- **Base branch:** \`${diff.baseBranch}\`
- **Head branch:** \`${diff.headBranch}\`
- **Commits:** ${diff.commitCount}
- **Lines changed:** +${diff.totalAdditions} / -${diff.totalDeletions}`;
  }

  private generateFilesSection(analysis: RuleAnalysis): string {
    let section = '## Files Changed\n\n';

    // Group files by category
    const filesByCategory = analysis.categorizedFiles.reduce((acc, file) => {
      if (!acc[file.category]) {
        acc[file.category] = [];
      }
      acc[file.category].push(file);
      return acc;
    }, {} as Record<string, typeof analysis.categorizedFiles>);

    // Output each category
    Object.entries(filesByCategory).forEach(([category, files]) => {
      section += `### ${this.capitalizeFirst(category)} (${files.length})\n\n`;
      files.forEach(file => {
        section += `- \`${file.path}\` (+${file.additions}/-${file.deletions})\n`;
      });
      section += '\n';
    });

    return section;
  }

  private generateTestsSection(analysis: RuleAnalysis): string {
    let section = '## Tests\n\n';

    if (analysis.testDetection.hasTests) {
      section += `✅ **Tests included** (${analysis.testDetection.testFiles.length} test files)\n\n`;
      analysis.testDetection.testFiles.forEach(file => {
        section += `- \`${file}\`\n`;
      });
    } else if (analysis.testDetection.missingTests) {
      section += '⚠️ **No tests detected** - Source code changed but no test files modified\n';
    } else {
      section += '✅ **No tests needed** - No source code changes\n';
    }

    return section;
  }

  private generateRisksSection(analysis: RuleAnalysis): string {
    let section = '## Risk Assessment\n\n';

    if (analysis.riskFlags.length === 0) {
      section += '✅ **No high-risk changes detected**\n';
      return section;
    }

    const highRisks = analysis.riskFlags.filter(r => r.level === 'high');
    const mediumRisks = analysis.riskFlags.filter(r => r.level === 'medium');

    if (highRisks.length > 0) {
      section += '### 🔴 High Risk\n\n';
      highRisks.forEach(risk => {
        section += `- **\`${risk.file}\`**: ${risk.reason}\n`;
      });
      section += '\n';
    }

    if (mediumRisks.length > 0) {
      section += '### 🟡 Medium Risk\n\n';
      mediumRisks.forEach(risk => {
        section += `- **\`${risk.file}\`**: ${risk.reason}\n`;
      });
      section += '\n';
    }

    return section;
  }

  private generateChecklist(analysis: RuleAnalysis): string {
    let checklist = '## Reviewer Checklist\n\n';

    // Base checklist items
    checklist += '- [ ] Code follows project style guidelines\n';
    checklist += '- [ ] Changes are well-documented\n';
    
    // Test-related items
    if (analysis.testDetection.hasTests) {
      checklist += '- [ ] All tests pass\n';
      checklist += '- [ ] New tests cover the changes\n';
    } else if (analysis.testDetection.missingTests) {
      checklist += '- [ ] ⚠️ Tests needed for source code changes\n';
    }

    // Risk-related items
    if (analysis.riskFlags.some(r => r.reason.includes('migration'))) {
      checklist += '- [ ] Database migration tested\n';
      checklist += '- [ ] Rollback plan documented\n';
    }

    if (analysis.riskFlags.some(r => r.reason.includes('auth'))) {
      checklist += '- [ ] Authentication changes reviewed\n';
      checklist += '- [ ] Security implications considered\n';
    }

    if (analysis.riskFlags.some(r => r.reason.includes('Dependency'))) {
      checklist += '- [ ] Dependencies reviewed for security\n';
      checklist += '- [ ] Package versions compatible\n';
    }

    // General items
    checklist += '- [ ] No breaking changes (or documented)\n';
    checklist += '- [ ] Performance impact considered\n';

    return checklist;
  }

  private assembleMarkdown(sections: Omit<PRPacket, 'fullMarkdown'>): string {
    return `# PR Packet

${sections.summary}

${sections.filesChanged}

${sections.tests}

${sections.risks}

${sections.checklist}

---
*Generated by PR Readiness Assistant*
`;
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
```

**Verification:**
```bash
# Update analyze command to generate PR packet
npm run build
./bin/pr-ready.js
# Should generate and display markdown
```

### Phase 5: Output Handling (Issue 006)

#### Step 5.1: Create OutputHandler Module

**packages/cli/src/modules/OutputHandler.ts:**
```typescript
import { PRPacket, OutputOptions } from '@pr-ready/shared';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import clipboard from 'clipboardy';
import chalk from 'chalk';

export class OutputHandler {
  async output(packet: PRPacket, options: OutputOptions = {}): Promise<void> {
    const filePath = options.file || '.pr-ready.md';
    const shouldCopy = options.clipboard !== false;

    // Write to file
    await this.writeToFile(packet.fullMarkdown, filePath);
    console.log(chalk.green(`\n✓ PR packet written to ${chalk.cyan(filePath)}`));

    // Copy to clipboard
    if (shouldCopy) {
      try {
        await clipboard.write(packet.fullMarkdown);
        console.log(chalk.green('✓ Copied to clipboard'));
      } catch (error) {
        console.log(chalk.yellow('⚠️  Could not copy to clipboard (headless environment?)'));
      }
    }
  }

  private async writeToFile(content: string, filePath: string): Promise<void> {
    const fullPath = join(process.cwd(), filePath);
    await writeFile(fullPath, content, 'utf-8');
  }
}
```

**Verification:**
```bash
npm run build
./bin/pr-ready.js
# Should create .pr-ready.md and copy to clipboard
cat .pr-ready.md
# Should show generated markdown
```

#### Step 5.2: Update Analyze Command (Final)

**packages/cli/src/commands/analyze.ts (final version):**
```typescript
import { GitDiffExtractor } from '../modules/GitDiffExtractor.js';
import { RuleBasedAnalyzer } from '../modules/RuleBasedAnalyzer.js';
import { PRPacketGenerator } from '../modules/PRPacketGenerator.js';
import { OutputHandler } from '../modules/OutputHandler.js';
import chalk from 'chalk';
import ora from 'ora';

interface AnalyzeOptions {
  base?: string;
  head?: string;
  clipboard?: boolean;
  config?: string;
}

export async function analyzeCommand(options: AnalyzeOptions) {
  let spinner = ora('Extracting git diff...').start();

  try {
    // Extract diff
    const extractor = new GitDiffExtractor();
    const diff = await extractor.extractDiff({
      base: options.base,
      head: options.head
    });
    spinner.succeed('Git diff extracted');

    // Analyze diff
    spinner = ora('Analyzing changes...').start();
    const analyzer = new RuleBasedAnalyzer();
    const analysis = analyzer.analyze(diff);
    spinner.succeed('Analysis complete');

    // Generate PR packet
    spinner = ora('Generating PR packet...').start();
    const generator = new PRPacketGenerator();
    const packet = generator.generate(diff, analysis);
    spinner.succeed('PR packet generated');

    // Output results
    spinner = ora('Writing output...').start();
    const outputHandler = new OutputHandler();
    await outputHandler.output(packet, {
      clipboard: options.clipboard
    });
    spinner.succeed('Output complete');

    // Display summary
    console.log(chalk.bold('\n📊 Analysis Summary:'));
    console.log(`  Files changed: ${chalk.yellow(diff.files.length)}`);
    console.log(`  Categories: ${chalk.yellow(Object.keys(analysis.summary.categoryCounts).length)}`);
    console.log(`  Test files: ${chalk.yellow(analysis.testDetection.testFiles.length)}`);
    console.log(`  Risk flags: ${chalk.yellow(analysis.riskFlags.length)}`);

    console.log(chalk.bold('\n✨ Next steps:'));
    console.log('  1. Review .pr-ready.md');
    console.log('  2. Paste into GitHub PR (already in clipboard!)');
    console.log('  3. Make any manual adjustments\n');

  } catch (error) {
    spinner.fail('Failed to generate PR packet');
    console.error(chalk.red(`\n❌ Error: ${error.message}`));
    process.exit(1);
  }
}
```

**Verification:**
```bash
npm run build
./bin/pr-ready.js
# Should complete full workflow
```

### Phase 6: Configuration System (Issue 007)

#### Step 6.1: Create ConfigManager Module

**packages/cli/src/modules/ConfigManager.ts:**
```typescript
import { Config, RiskPattern } from '@pr-ready/shared';
import { readFile } from 'fs/promises';
import { join } from 'path';

export class ConfigManager {
  private defaultConfig: Config = {
    test: {
      patterns: [
        '*.test.ts',
        '*.spec.ts',
        '*.test.js',
        '*.spec.js',
        '__tests__/**'
      ]
    },
    risks: {
      patterns: [
        {
          pattern: 'migrations?/',
          level: 'high',
          reason: 'Database migration'
        },
        {
          pattern: 'schema',
          level: 'high',
          reason: 'Database schema change'
        },
        {
          pattern: 'auth',
          level: 'high',
          reason: 'Authentication/authorization change'
        },
        {
          pattern: 'security',
          level: 'high',
          reason: 'Security-related change'
        },
        {
          pattern: '\\.config\\.(js|ts)$',
          level: 'medium',
          reason: 'Configuration file change'
        },
        {
          pattern: 'package\\.json$',
          level: 'medium',
          reason: 'Dependency change'
        }
      ],
      largeFileThreshold: 500
    },
    output: {
      file: '.pr-ready.md',
      clipboard: true
    }
  };

  async loadConfig(cwd: string = process.cwd(), configPath?: string): Promise<Config> {
    let config = { ...this.defaultConfig };

    // Try custom config path first
    if (configPath) {
      const customConfig = await this.loadFromFile(join(cwd, configPath));
      if (customConfig) {
        config = this.mergeConfigs(config, customConfig);
      }
      return config;
    }

    // Try package.json
    const packageConfig = await this.loadFromPackageJson(cwd);
    if (packageConfig) {
      config = this.mergeConfigs(config, packageConfig);
      return config;
    }

    // Try .pr-ready.json
    const fileConfig = await this.loadFromFile(join(cwd, '.pr-ready.json'));
    if (fileConfig) {
      config = this.mergeConfigs(config, fileConfig);
    }

    return config;
  }

  private async loadFromPackageJson(cwd: string): Promise<Partial<Config> | null> {
    try {
      const packagePath = join(cwd, 'package.json');
      const content = await readFile(packagePath, 'utf-8');
      const packageJson = JSON.parse(content);
      return packageJson.prReady || null;
    } catch {
      return null;
    }
  }

  private async loadFromFile(filePath: string): Promise<Partial<Config> | null> {
    try {
      const content = await readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  private mergeConfigs(base: Config, override: Partial<Config>): Config {
    return {
      llm: { ...base.llm, ...override.llm },
      test: { ...base.test, ...override.test },
      risks: {
        patterns: override.risks?.patterns || base.risks?.patterns,
        largeFileThreshold: override.risks?.largeFileThreshold ?? base.risks?.largeFileThreshold
      },
      output: { ...base.output, ...override.output },
      monorepo: { ...base.monorepo, ...override.monorepo }
    };
  }

  mergeWithCliOptions(config: Config, options: any): Config {
    return {
      ...config,
      output: {
        ...config.output,
        clipboard: options.clipboard ?? config.output?.clipboard
      }
    };
  }
}
```

**Verification:**
```bash
# Create test config
echo '{"output": {"file": "custom-pr.md"}}' > .pr-ready.json
npm run build
./bin/pr-ready.js
# Should use custom filename
```

#### Step 6.2: Integrate Config into Analyze Command

**packages/cli/src/commands/analyze.ts (with config):**
```typescript
import { GitDiffExtractor } from '../modules/GitDiffExtractor.js';
import { RuleBasedAnalyzer } from '../modules/RuleBasedAnalyzer.js';
import { PRPacketGenerator } from '../modules/PRPacketGenerator.js';
import { OutputHandler } from '../modules/OutputHandler.js';
import { ConfigManager } from '../modules/ConfigManager.js';
import chalk from 'chalk';
import ora from 'ora';

interface AnalyzeOptions {
  base?: string;
  head?: string;
  clipboard?: boolean;
  config?: string;
}

export async function analyzeCommand(options: AnalyzeOptions) {
  let spinner = ora('Loading configuration...').start();

  try {
    // Load config
    const configManager = new ConfigManager();
    const config = await configManager.loadConfig(process.cwd(), options.config);
    const finalConfig = configManager.mergeWithCliOptions(config, options);
    spinner.succeed('Configuration loaded');

    // Extract diff
    spinner = ora('Extracting git diff...').start();
    const extractor = new GitDiffExtractor();
    const diff = await extractor.extractDiff({
      base: options.base,
      head: options.head
    });
    spinner.succeed('Git diff extracted');

    // Analyze diff
    spinner = ora('Analyzing changes...').start();
    const analyzer = new RuleBasedAnalyzer();
    const analysis = analyzer.analyze(diff);
    spinner.succeed('Analysis complete');

    // Generate PR packet
    spinner = ora('Generating PR packet...').start();
    const generator = new PRPacketGenerator();
    const packet = generator.generate(diff, analysis);
    spinner.succeed('PR packet generated');

    // Output results
    spinner = ora('Writing output...').start();
    const outputHandler = new OutputHandler();
    await outputHandler.output(packet, finalConfig.output);
    spinner.succeed('Output complete');

    // Display summary
    console.log(chalk.bold('\n📊 Analysis Summary:'));
    console.log(`  Files changed: ${chalk.yellow(diff.files.length)}`);
    console.log(`  Categories: ${chalk.yellow(Object.keys(analysis.summary.categoryCounts).length)}`);
    console.log(`  Test files: ${chalk.yellow(analysis.testDetection.testFiles.length)}`);
    console.log(`  Risk flags: ${chalk.yellow(analysis.riskFlags.length)}`);

    console.log(chalk.bold('\n✨ Next steps:'));
    console.log(`  1. Review ${chalk.cyan(finalConfig.output?.file || '.pr-ready.md')}`);
    console.log('  2. Paste into GitHub PR (already in clipboard!)');
    console.log('  3. Make any manual adjustments\n');

  } catch (error) {
    spinner.fail('Failed to generate PR packet');
    console.error(chalk.red(`\n❌ Error: ${error.message}`));
    process.exit(1);
  }
}
```

**Verification:**
```bash
npm run build
./bin/pr-ready.js --config custom-config.json
# Should use custom config
```

### Phase 7: Error Handling & Polish

#### Step 7.1: Create Error Handler Utility

**packages/cli/src/utils/error-handler.ts:**
```typescript
import chalk from 'chalk';

export class PRReadyError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: string
  ) {
    super(message);
    this.name = 'PRReadyError';
  }
}

export function handleError(error: unknown): never {
  if (error instanceof PRReadyError) {
    console.error(chalk.red(`\n❌ ${error.message}`));
    if (error.details) {
      console.error(chalk.gray(`   ${error.details}`));
    }
    console.error(chalk.gray(`   Error code: ${error.code}\n`));
  } else if (error instanceof Error) {
    console.error(chalk.red(`\n❌ ${error.message}\n`));
  } else {
    console.error(chalk.red('\n❌ An unknown error occurred\n'));
  }
  
  process.exit(1);
}

export function createGitError(message: string): PRReadyError {
  return new PRReadyError(
    message,
    'GIT_ERROR',
    'Make sure you are in a git repository and have committed changes'
  );
}

