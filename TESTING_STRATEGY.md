# Testing Strategy - PR Readiness Assistant

## Test Infrastructure Setup

### 1. Install Test Dependencies

```bash
npm install -D jest @types/jest ts-jest
npm install -D @jest/globals
npm install -D memfs mock-fs
npm install -D nock
```

### 2. Jest Configuration

**Root `jest.config.js`:**
```js
module.exports = {
  projects: [
    '<rootDir>/packages/*/jest.config.js'
  ],
  collectCoverageFrom: [
    'packages/*/src/**/*.ts',
    '!packages/*/src/**/*.d.ts',
    '!packages/*/src/index.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

**`packages/cli/jest.config.js`:**
```js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts'
  ]
};
```

**`packages/shared/jest.config.js`:**
```js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts']
};
```

## Test Structure

```
packages/
├── cli/
│   └── src/
│       ├── __tests__/
│       │   ├── git-diff-extractor.test.ts
│       │   ├── rule-based-analyzer.test.ts
│       │   ├── pr-packet-generator.test.ts
│       │   ├── config-manager.test.ts
│       │   ├── output-handler.test.ts
│       │   └── integration/
│       │       └── cli-flow.test.ts
│       └── __fixtures__/
│           ├── sample-diff.json
│           ├── sample-config.json
│           └── test-repo/
└── shared/
    └── src/
        └── __tests__/
            └── types.test.ts
```

## Unit Tests

### [`GitDiffExtractor`](packages/cli/src/git-diff-extractor.ts) Tests

**Test file:** `packages/cli/src/__tests__/git-diff-extractor.test.ts`

```typescript
import { GitDiffExtractor } from '../git-diff-extractor';
import simpleGit from 'simple-git';

jest.mock('simple-git');

describe('GitDiffExtractor', () => {
  let extractor: GitDiffExtractor;
  let mockGit: any;

  beforeEach(() => {
    mockGit = {
      checkIsRepo: jest.fn(),
      status: jest.fn(),
      branch: jest.fn(),
      diffSummary: jest.fn(),
      diff: jest.fn(),
      revparse: jest.fn()
    };
    (simpleGit as jest.Mock).mockReturnValue(mockGit);
    extractor = new GitDiffExtractor('/test/path');
  });

  describe('extractDiff', () => {
    it('throws error if not git repo', async () => {
      mockGit.checkIsRepo.mockResolvedValue(false);
      await expect(extractor.extractDiff()).rejects.toThrow('Not a git repository');
    });

    it('extracts diff between branches', async () => {
      mockGit.checkIsRepo.mockResolvedValue(true);
      mockGit.status.mockResolvedValue({ current: 'feature' });
      mockGit.branch.mockResolvedValue({ all: ['origin/main'] });
      mockGit.diffSummary.mockResolvedValue({
        files: [
          { file: 'src/app.ts', insertions: 10, deletions: 5 }
        ],
        changed: 1,
        insertions: 10,
        deletions: 5
      });
      mockGit.diff.mockResolvedValue('diff content');

      const result = await extractor.extractDiff();

      expect(result.files).toHaveLength(1);
      expect(result.baseBranch).toBe('origin/main');
      expect(result.headBranch).toBe('feature');
    });

    it('handles binary files', async () => {
      mockGit.checkIsRepo.mockResolvedValue(true);
      mockGit.status.mockResolvedValue({ current: 'main' });
      mockGit.branch.mockResolvedValue({ all: ['origin/main'] });
      mockGit.diffSummary.mockResolvedValue({
        files: [{ file: 'image.png', binary: true }],
        changed: 1,
        insertions: 0,
        deletions: 0
      });
      mockGit.diff.mockResolvedValue('');

      const result = await extractor.extractDiff();

      expect(result.files[0].changes).toBe('[Binary file]');
    });
  });

  describe('detectUpstreamBranch', () => {
    it('detects origin/main', async () => {
      mockGit.branch.mockResolvedValue({ all: ['origin/main', 'origin/feature'] });
      // Test via extractDiff
      mockGit.checkIsRepo.mockResolvedValue(true);
      mockGit.status.mockResolvedValue({ current: 'feature' });
      mockGit.diffSummary.mockResolvedValue({
        files: [{ file: 'test.ts', insertions: 1, deletions: 0 }],
        changed: 1,
        insertions: 1,
        deletions: 0
      });
      mockGit.diff.mockResolvedValue('diff');

      const result = await extractor.extractDiff();
      expect(result.baseBranch).toBe('origin/main');
    });
  });
});
```

### [`RuleBasedAnalyzer`](packages/cli/src/rule-based-analyzer.ts) Tests

**Test file:** `packages/cli/src/__tests__/rule-based-analyzer.test.ts`

```typescript
import { RuleBasedAnalyzer } from '../rule-based-analyzer';
import { GitDiff } from '@pr-ready/shared';

describe('RuleBasedAnalyzer', () => {
  let analyzer: RuleBasedAnalyzer;

  beforeEach(() => {
    analyzer = new RuleBasedAnalyzer();
  });

  describe('categorizeFiles', () => {
    it('categorizes test files', () => {
      const diff: GitDiff = {
        files: [
          { path: 'src/app.test.ts', status: 'added', additions: 10, deletions: 0, changes: '' },
          { path: 'src/__tests__/utils.test.ts', status: 'added', additions: 5, deletions: 0, changes: '' }
        ],
        baseBranch: 'main',
        headBranch: 'feature',
        totalChanges: 15,
        additions: 15,
        deletions: 0
      };

      const result = analyzer.analyze(diff);
      
      expect(result.categories).toContainEqual({
        name: 'tests',
        files: expect.arrayContaining(['src/app.test.ts', 'src/__tests__/utils.test.ts']),
        count: 2
      });
    });

    it('categorizes frontend files', () => {
      const diff: GitDiff = {
        files: [
          { path: 'src/components/Button.tsx', status: 'modified', additions: 5, deletions: 2, changes: '' },
          { path: 'src/styles/main.css', status: 'modified', additions: 3, deletions: 1, changes: '' }
        ],
        baseBranch: 'main',
        headBranch: 'feature',
        totalChanges: 11,
        additions: 8,
        deletions: 3
      };

      const result = analyzer.analyze(diff);
      
      const frontend = result.categories.find(c => c.name === 'frontend');
      expect(frontend).toBeDefined();
      expect(frontend?.count).toBe(2);
    });

    it('categorizes config files', () => {
      const diff: GitDiff = {
        files: [
          { path: 'package.json', status: 'modified', additions: 2, deletions: 1, changes: '' },
          { path: 'tsconfig.json', status: 'modified', additions: 1, deletions: 0, changes: '' }
        ],
        baseBranch: 'main',
        headBranch: 'feature',
        totalChanges: 4,
        additions: 3,
        deletions: 1
      };

      const result = analyzer.analyze(diff);
      
      const config = result.categories.find(c => c.name === 'config');
      expect(config?.files).toContain('package.json');
      expect(config?.files).toContain('tsconfig.json');
    });
  });

  describe('detectTests', () => {
    it('detects missing tests when source changed', () => {
      const diff: GitDiff = {
        files: [
          { path: 'src/app.ts', status: 'modified', additions: 10, deletions: 5, changes: '' }
        ],
        baseBranch: 'main',
        headBranch: 'feature',
        totalChanges: 15,
        additions: 10,
        deletions: 5
      };

      const result = analyzer.analyze(diff);
      
      expect(result.testDetection.hasTests).toBe(false);
      expect(result.testDetection.sourceFilesChanged).toBe(true);
      expect(result.testDetection.missingTests).toBe(true);
    });

    it('detects tests present', () => {
      const diff: GitDiff = {
        files: [
          { path: 'src/app.ts', status: 'modified', additions: 10, deletions: 5, changes: '' },
          { path: 'src/app.test.ts', status: 'modified', additions: 5, deletions: 2, changes: '' }
        ],
        baseBranch: 'main',
        headBranch: 'feature',
        totalChanges: 22,
        additions: 15,
        deletions: 7
      };

      const result = analyzer.analyze(diff);
      
      expect(result.testDetection.hasTests).toBe(true);
      expect(result.testDetection.missingTests).toBe(false);
      expect(result.testDetection.testFiles).toContain('src/app.test.ts');
    });
  });

  describe('detectRisks', () => {
    it('flags database migrations as high risk', () => {
      const diff: GitDiff = {
        files: [
          { path: 'migrations/001_add_users.sql', status: 'added', additions: 20, deletions: 0, changes: '' }
        ],
        baseBranch: 'main',
        headBranch: 'feature',
        totalChanges: 20,
        additions: 20,
        deletions: 0
      };

      const result = analyzer.analyze(diff);
      
      const highRisk = result.risks.find(r => r.level === 'high' && r.pattern === 'migrations/schema');
      expect(highRisk).toBeDefined();
      expect(highRisk?.reason).toContain('Database schema change');
    });

    it('flags auth changes as high risk', () => {
      const diff: GitDiff = {
        files: [
          { path: 'src/auth/login.ts', status: 'modified', additions: 15, deletions: 10, changes: '' }
        ],
        baseBranch: 'main',
        headBranch: 'feature',
        totalChanges: 25,
        additions: 15,
        deletions: 10
      };

      const result = analyzer.analyze(diff);
      
      const authRisk = result.risks.find(r => r.pattern === 'auth/security');
      expect(authRisk?.level).toBe('high');
    });

    it('flags large refactors as medium risk', () => {
      const diff: GitDiff = {
        files: [
          { path: 'src/large-file.ts', status: 'modified', additions: 300, deletions: 250, changes: '' }
        ],
        baseBranch: 'main',
        headBranch: 'feature',
        totalChanges: 550,
        additions: 300,
        deletions: 250
      };

      const result = analyzer.analyze(diff);
      
      const refactorRisk = result.risks.find(r => r.pattern === 'large-refactor');
      expect(refactorRisk?.level).toBe('medium');
      expect(refactorRisk?.reason).toContain('550 lines');
    });
  });
});
```

### [`PRPacketGenerator`](packages/cli/src/pr-packet-generator.ts) Tests

**Test file:** `packages/cli/src/__tests__/pr-packet-generator.test.ts`

```typescript
import { PRPacketGenerator } from '../pr-packet-generator';
import { GitDiff, RuleAnalysis } from '@pr-ready/shared';

describe('PRPacketGenerator', () => {
  let generator: PRPacketGenerator;

  beforeEach(() => {
    generator = new PRPacketGenerator();
  });

  const mockDiff: GitDiff = {
    files: [
      { path: 'src/app.ts', status: 'modified', additions: 10, deletions: 5, changes: '' },
      { path: 'src/app.test.ts', status: 'modified', additions: 5, deletions: 2, changes: '' }
    ],
    baseBranch: 'main',
    headBranch: 'feature',
    totalChanges: 22,
    additions: 15,
    deletions: 7
  };

  const mockAnalysis: RuleAnalysis = {
    categories: [
      { name: 'frontend', files: ['src/app.ts'], count: 1 },
      { name: 'tests', files: ['src/app.test.ts'], count: 1 }
    ],
    testDetection: {
      testFiles: ['src/app.test.ts'],
      hasTests: true,
      sourceFilesChanged: true,
      missingTests: false
    },
    risks: []
  };

  describe('generate', () => {
    it('generates complete PR packet', () => {
      const packet = generator.generate(mockDiff, mockAnalysis);

      expect(packet.summary).toContain('2 file(s)');
      expect(packet.filesChanged).toHaveLength(2);
      expect(packet.testStatus.hasTests).toBe(true);
      expect(packet.metadata.baseBranch).toBe('main');
      expect(packet.metadata.headBranch).toBe('feature');
    });

    it('includes risk warnings in summary', () => {
      const analysisWithRisks: RuleAnalysis = {
        ...mockAnalysis,
        risks: [
          { level: 'high', file: 'migrations/001.sql', reason: 'DB change', pattern: 'migrations/schema' }
        ]
      };

      const packet = generator.generate(mockDiff, analysisWithRisks);

      expect(packet.summary).toContain('high-risk');
      expect(packet.risks).toHaveLength(1);
    });
  });

  describe('generateMarkdown', () => {
    it('generates valid markdown', () => {
      const packet = generator.generate(mockDiff, mockAnalysis);
      const markdown = generator.generateMarkdown(packet);

      expect(markdown).toContain('# PR Readiness Report');
      expect(markdown).toContain('## Summary');
      expect(markdown).toContain('## Files Changed');
      expect(markdown).toContain('## Test Coverage');
      expect(markdown).toContain('## Risk Assessment');
      expect(markdown).toContain('## Reviewer Checklist');
    });

    it('shows test warning when missing', () => {
      const analysisNoTests: RuleAnalysis = {
        ...mockAnalysis,
        testDetection: {
          testFiles: [],
          hasTests: false,
          sourceFilesChanged: true,
          missingTests: true
        }
      };

      const packet = generator.generate(mockDiff, analysisNoTests);
      const markdown = generator.generateMarkdown(packet);

      expect(markdown).toContain('⚠️');
      expect(markdown).toContain('no test files modified');
    });

    it('formats risk levels correctly', () => {
      const analysisWithRisks: RuleAnalysis = {
        ...mockAnalysis,
        risks: [
          { level: 'high', file: 'auth.ts', reason: 'Auth change', pattern: 'auth/security' },
          { level: 'medium', file: 'config.ts', reason: 'Config change', pattern: 'config' },
          { level: 'low', file: 'api.ts', reason: 'API change', pattern: 'api' }
        ]
      };

      const packet = generator.generate(mockDiff, analysisWithRisks);
      const markdown = generator.generateMarkdown(packet);

      expect(markdown).toContain('🔴 High Risk');
      expect(markdown).toContain('🟡 Medium Risk');
      expect(markdown).toContain('🟢 Low Risk');
    });
  });

  describe('generateChecklist', () => {
    it('includes standard items', () => {
      const packet = generator.generate(mockDiff, mockAnalysis);

      expect(packet.checklist).toContain('Code follows project style guidelines');
      expect(packet.checklist).toContain('No breaking changes (or documented in PR description)');
    });

    it('adds DB-specific items for migrations', () => {
      const analysisWithDb: RuleAnalysis = {
        ...mockAnalysis,
        risks: [
          { level: 'high', file: 'migrations/001.sql', reason: 'DB', pattern: 'migrations/schema' }
        ]
      };

      const packet = generator.generate(mockDiff, analysisWithDb);

      expect(packet.checklist).toContain('Database migrations are reversible');
      expect(packet.checklist).toContain('Migration tested on staging environment');
    });

    it('adds auth-specific items', () => {
      const analysisWithAuth: RuleAnalysis = {
        ...mockAnalysis,
        risks: [
          { level: 'high', file: 'auth.ts', reason: 'Auth', pattern: 'auth/security' }
        ]
      };

      const packet = generator.generate(mockDiff, analysisWithAuth);

      expect(packet.checklist).toContain('Security implications reviewed');
      expect(packet.checklist).toContain('Authentication flows tested');
    });
  });
});
```

### [`ConfigManager`](packages/cli/src/config-manager.ts) Tests

**Test file:** `packages/cli/src/__tests__/config-manager.test.ts`

```typescript
import { ConfigManager } from '../config-manager';
import { vol } from 'memfs';

jest.mock('fs', () => require('memfs').fs);
jest.mock('fs/promises', () => require('memfs').fs.promises);

describe('ConfigManager', () => {
  let configManager: ConfigManager;

  beforeEach(() => {
    vol.reset();
    configManager = new ConfigManager('/test/project');
  });

  describe('loadConfig', () => {
    it('loads config from .prreadyrc.json', async () => {
      vol.fromJSON({
        '/test/project/.prreadyrc.json': JSON.stringify({
          llm: { provider: 'openai', model: 'gpt-4' }
        })
      });

      const config = await configManager.loadConfig();

      expect(config.llm?.provider).toBe('openai');
      expect(config.llm?.model).toBe('gpt-4');
    });

    it('returns default config if no file exists', async () => {
      const config = await configManager.loadConfig();

      expect(config).toBeDefined();
      expect(config.llm?.provider).toBe('none');
    });

    it('merges with defaults', async () => {
      vol.fromJSON({
        '/test/project/.prreadyrc.json': JSON.stringify({
          llm: { provider: 'openai' }
        })
      });

      const config = await configManager.loadConfig();

      expect(config.output?.clipboard).toBe(false); // default value
    });
  });

  describe('saveConfig', () => {
    it('saves config to file', async () => {
      const config = {
        llm: { provider: 'anthropic' as const, model: 'claude-3' }
      };

      await configManager.saveConfig(config);

      const saved = vol.readFileSync('/test/project/.prreadyrc.json', 'utf-8');
      const parsed = JSON.parse(saved);
      expect(parsed.llm.provider).toBe('anthropic');
    });
  });
});
```

## Integration Tests

**Test file:** `packages/cli/src/__tests__/integration/cli-flow.test.ts`

```typescript
import { GitDiffExtractor } from '../../git-diff-extractor';
import { RuleBasedAnalyzer } from '../../rule-based-analyzer';
import { PRPacketGenerator } from '../../pr-packet-generator';
import simpleGit from 'simple-git';

jest.mock('simple-git');

describe('CLI Integration Flow', () => {
  it('completes full analysis flow', async () => {
    // Mock git operations
    const mockGit = {
      checkIsRepo: jest.fn().mockResolvedValue(true),
      status: jest.fn().mockResolvedValue({ current: 'feature' }),
      branch: jest.fn().mockResolvedValue({ all: ['origin/main'] }),
      diffSummary: jest.fn().mockResolvedValue({
        files: [
          { file: 'src/app.ts', insertions: 10, deletions: 5 },
          { file: 'src/app.test.ts', insertions: 5, deletions: 2 }
        ],
        changed: 2,
        insertions: 15,
        deletions: 7
      }),
      diff: jest.fn().mockResolvedValue('mock diff content')
    };
    (simpleGit as jest.Mock).mockReturnValue(mockGit);

    // Execute flow
    const extractor = new GitDiffExtractor('/test');
    const analyzer = new RuleBasedAnalyzer();
    const generator = new PRPacketGenerator();

    const diff = await extractor.extractDiff();
    const analysis = analyzer.analyze(diff);
    const packet = generator.generate(diff, analysis);
    const markdown = generator.generateMarkdown(packet);

    // Verify results
    expect(diff.files).toHaveLength(2);
    expect(analysis.testDetection.hasTests).toBe(true);
    expect(packet.summary).toContain('2 file(s)');
    expect(markdown).toContain('# PR Readiness Report');
  });
});
```

## Running Tests

### Package Scripts

Update `package.json` files:

**Root:**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

**CLI package:**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

### Commands

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# CI mode
npm run test:ci
```

## CI/CD Pipeline

**`.github/workflows/test.yml`:**
```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

## Pre-commit Hooks

**`.husky/pre-commit`:**
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run test:ci
npm run lint
```

## Test Coverage Goals

- **Overall:** >80%
- **Critical modules:** >90%
  - [`GitDiffExtractor`](packages/cli/src/git-diff-extractor.ts)
  - [`RuleBasedAnalyzer`](packages/cli/src/rule-based-analyzer.ts)
  - [`PRPacketGenerator`](packages/cli/src/pr-packet-generator.ts)

## Next Steps

1. Install dependencies
2. Create test files
3. Write unit tests for each module
4. Add integration tests
5. Configure CI/CD
6. Set up pre-commit hooks
7. Achieve 80%+ coverage