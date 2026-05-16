<<<<<<< HEAD
=======
import { describe, it, expect } from '@jest/globals';
>>>>>>> 486204d (feat: implement PR Readiness Assistant (all 20 issues))
import { RuleBasedAnalyzer } from '../rule-based-analyzer';
import { GitDiff } from '@pr-ready/shared';

describe('RuleBasedAnalyzer', () => {
  let analyzer: RuleBasedAnalyzer;

  beforeEach(() => {
    analyzer = new RuleBasedAnalyzer();
  });

  describe('categorizeFiles', () => {
<<<<<<< HEAD
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
=======
    it('should categorize test files', () => {
      const diff: GitDiff = {
        files: [
          { path: 'src/app.test.ts', status: 'added', additions: 10, deletions: 0, changes: '' },
          { path: 'src/__tests__/utils.spec.ts', status: 'added', additions: 5, deletions: 0, changes: '' },
        ],
        baseBranch: 'main',
        headBranch: 'feature',
        totalChanges: 2,
        additions: 15,
        deletions: 0,
      };

      const result = analyzer.analyze(diff);

      expect(result.categories).toHaveLength(1);
      expect(result.categories[0].name).toBe('tests');
      expect(result.categories[0].files).toHaveLength(2);
    });

    it('should categorize documentation files', () => {
      const diff: GitDiff = {
        files: [
          { path: 'README.md', status: 'modified', additions: 5, deletions: 2, changes: '' },
          { path: 'docs/api.md', status: 'added', additions: 100, deletions: 0, changes: '' },
        ],
        baseBranch: 'main',
        headBranch: 'feature',
        totalChanges: 2,
        additions: 105,
        deletions: 2,
      };

      const result = analyzer.analyze(diff);

      expect(result.categories).toHaveLength(1);
      expect(result.categories[0].name).toBe('docs');
      expect(result.categories[0].count).toBe(2);
    });

    it('should categorize configuration files', () => {
      const diff: GitDiff = {
        files: [
          { path: 'package.json', status: 'modified', additions: 2, deletions: 1, changes: '' },
          { path: 'tsconfig.json', status: 'modified', additions: 1, deletions: 0, changes: '' },
          { path: '.eslintrc.json', status: 'added', additions: 20, deletions: 0, changes: '' },
        ],
        baseBranch: 'main',
        headBranch: 'feature',
        totalChanges: 3,
        additions: 23,
        deletions: 1,
      };

      const result = analyzer.analyze(diff);

      expect(result.categories).toHaveLength(1);
      expect(result.categories[0].name).toBe('config');
      expect(result.categories[0].files).toContain('package.json');
    });

    it('should categorize frontend files', () => {
      const diff: GitDiff = {
        files: [
          { path: 'src/components/Button.tsx', status: 'added', additions: 50, deletions: 0, changes: '' },
          { path: 'src/pages/Home.vue', status: 'modified', additions: 10, deletions: 5, changes: '' },
          { path: 'styles/main.css', status: 'modified', additions: 20, deletions: 0, changes: '' },
        ],
        baseBranch: 'main',
        headBranch: 'feature',
        totalChanges: 3,
        additions: 80,
        deletions: 5,
      };

      const result = analyzer.analyze(diff);

      expect(result.categories).toHaveLength(1);
      expect(result.categories[0].name).toBe('frontend');
    });

    it('should categorize backend files', () => {
      const diff: GitDiff = {
        files: [
          { path: 'src/api/users.ts', status: 'added', additions: 100, deletions: 0, changes: '' },
          { path: 'src/controllers/auth.ts', status: 'modified', additions: 20, deletions: 10, changes: '' },
          { path: 'src/models/User.ts', status: 'added', additions: 50, deletions: 0, changes: '' },
        ],
        baseBranch: 'main',
        headBranch: 'feature',
        totalChanges: 3,
        additions: 170,
        deletions: 10,
      };

      const result = analyzer.analyze(diff);

      expect(result.categories).toHaveLength(1);
      expect(result.categories[0].name).toBe('backend');
    });

    it('should categorize database files', () => {
      const diff: GitDiff = {
        files: [
          { path: 'migrations/001_create_users.sql', status: 'added', additions: 20, deletions: 0, changes: '' },
          { path: 'database/schema.sql', status: 'modified', additions: 5, deletions: 2, changes: '' },
        ],
        baseBranch: 'main',
        headBranch: 'feature',
        totalChanges: 2,
        additions: 25,
        deletions: 2,
      };

      const result = analyzer.analyze(diff);

      expect(result.categories).toHaveLength(2);
      const categoryNames = result.categories.map(c => c.name);
      expect(categoryNames).toContain('database');
      expect(categoryNames).toContain('migrations');
    });

    it('should handle multiple categories', () => {
      const diff: GitDiff = {
        files: [
          { path: 'src/app.ts', status: 'modified', additions: 10, deletions: 5, changes: '' },
          { path: 'src/app.test.ts', status: 'added', additions: 20, deletions: 0, changes: '' },
          { path: 'README.md', status: 'modified', additions: 5, deletions: 0, changes: '' },
        ],
        baseBranch: 'main',
        headBranch: 'feature',
        totalChanges: 3,
        additions: 35,
        deletions: 5,
      };

      const result = analyzer.analyze(diff);

      expect(result.categories.length).toBeGreaterThan(1);
      const categoryNames = result.categories.map(c => c.name);
      expect(categoryNames).toContain('tests');
      expect(categoryNames).toContain('docs');
>>>>>>> 486204d (feat: implement PR Readiness Assistant (all 20 issues))
    });
  });

  describe('detectTests', () => {
<<<<<<< HEAD
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
      
=======
    it('should detect test files', () => {
      const diff: GitDiff = {
        files: [
          { path: 'src/app.ts', status: 'modified', additions: 10, deletions: 5, changes: '' },
          { path: 'src/app.test.ts', status: 'added', additions: 20, deletions: 0, changes: '' },
        ],
        baseBranch: 'main',
        headBranch: 'feature',
        totalChanges: 2,
        additions: 30,
        deletions: 5,
      };

      const result = analyzer.analyze(diff);

      expect(result.testDetection.hasTests).toBe(true);
      expect(result.testDetection.testFiles).toContain('src/app.test.ts');
      expect(result.testDetection.sourceFilesChanged).toBe(true);
      expect(result.testDetection.missingTests).toBe(false);
    });

    it('should flag missing tests when source files changed', () => {
      const diff: GitDiff = {
        files: [
          { path: 'src/app.ts', status: 'modified', additions: 50, deletions: 10, changes: '' },
          { path: 'src/utils.ts', status: 'added', additions: 100, deletions: 0, changes: '' },
        ],
        baseBranch: 'main',
        headBranch: 'feature',
        totalChanges: 2,
        additions: 150,
        deletions: 10,
      };

      const result = analyzer.analyze(diff);

>>>>>>> 486204d (feat: implement PR Readiness Assistant (all 20 issues))
      expect(result.testDetection.hasTests).toBe(false);
      expect(result.testDetection.sourceFilesChanged).toBe(true);
      expect(result.testDetection.missingTests).toBe(true);
    });

<<<<<<< HEAD
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
=======
    it('should not flag missing tests for non-source changes', () => {
      const diff: GitDiff = {
        files: [
          { path: 'README.md', status: 'modified', additions: 10, deletions: 5, changes: '' },
          { path: 'package.json', status: 'modified', additions: 2, deletions: 1, changes: '' },
        ],
        baseBranch: 'main',
        headBranch: 'feature',
        totalChanges: 2,
        additions: 12,
        deletions: 6,
      };

      const result = analyzer.analyze(diff);

      expect(result.testDetection.sourceFilesChanged).toBe(false);
      expect(result.testDetection.missingTests).toBe(false);
    });

    it('should recognize various test file patterns', () => {
      const diff: GitDiff = {
        files: [
          { path: 'src/__tests__/app.ts', status: 'added', additions: 10, deletions: 0, changes: '' },
          { path: 'src/utils.spec.ts', status: 'added', additions: 10, deletions: 0, changes: '' },
          { path: 'tests/integration.test.js', status: 'added', additions: 10, deletions: 0, changes: '' },
        ],
        baseBranch: 'main',
        headBranch: 'feature',
        totalChanges: 3,
        additions: 30,
        deletions: 0,
      };

      const result = analyzer.analyze(diff);

      expect(result.testDetection.testFiles).toHaveLength(3);
      expect(result.testDetection.hasTests).toBe(true);
>>>>>>> 486204d (feat: implement PR Readiness Assistant (all 20 issues))
    });
  });

  describe('detectRisks', () => {
<<<<<<< HEAD
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

    it('flags package.json changes as high risk', () => {
      const diff: GitDiff = {
        files: [
          { path: 'package.json', status: 'modified', additions: 5, deletions: 2, changes: '' }
        ],
        baseBranch: 'main',
        headBranch: 'feature',
        totalChanges: 7,
        additions: 5,
        deletions: 2
      };

      const result = analyzer.analyze(diff);
      
      const depRisk = result.risks.find(r => r.pattern === 'dependencies');
      expect(depRisk?.level).toBe('high');
      expect(depRisk?.reason).toContain('Package dependencies changed');
=======
    it('should flag database migrations as high risk', () => {
      const diff: GitDiff = {
        files: [
          { path: 'migrations/001_add_users.sql', status: 'added', additions: 50, deletions: 0, changes: '' },
        ],
        baseBranch: 'main',
        headBranch: 'feature',
        totalChanges: 1,
        additions: 50,
        deletions: 0,
      };

      const result = analyzer.analyze(diff);

      expect(result.risks).toHaveLength(1);
      expect(result.risks[0].level).toBe('high');
      expect(result.risks[0].pattern).toBe('migrations/schema');
    });

    it('should flag authentication changes as high risk', () => {
      const diff: GitDiff = {
        files: [
          { path: 'src/auth/login.ts', status: 'modified', additions: 20, deletions: 10, changes: '' },
        ],
        baseBranch: 'main',
        headBranch: 'feature',
        totalChanges: 1,
        additions: 20,
        deletions: 10,
      };

      const result = analyzer.analyze(diff);

      const authRisk = result.risks.find(r => r.pattern === 'auth/security');
      expect(authRisk).toBeDefined();
      expect(authRisk?.level).toBe('high');
    });

    it('should flag package.json changes as high risk', () => {
      const diff: GitDiff = {
        files: [
          { path: 'package.json', status: 'modified', additions: 5, deletions: 2, changes: '' },
        ],
        baseBranch: 'main',
        headBranch: 'feature',
        totalChanges: 1,
        additions: 5,
        deletions: 2,
      };

      const result = analyzer.analyze(diff);

      const depRisk = result.risks.find(r => r.pattern === 'dependencies');
      expect(depRisk).toBeDefined();
      expect(depRisk?.level).toBe('high');
    });

    it('should flag config changes as medium risk', () => {
      const diff: GitDiff = {
        files: [
          { path: 'webpack.config.js', status: 'modified', additions: 10, deletions: 5, changes: '' },
        ],
        baseBranch: 'main',
        headBranch: 'feature',
        totalChanges: 1,
        additions: 10,
        deletions: 5,
      };

      const result = analyzer.analyze(diff);

      const configRisk = result.risks.find(r => r.pattern === 'config');
      expect(configRisk).toBeDefined();
      expect(configRisk?.level).toBe('medium');
    });

    it('should flag large refactors as medium risk', () => {
      const diff: GitDiff = {
        files: [
          { path: 'src/large-file.ts', status: 'modified', additions: 300, deletions: 250, changes: '' },
        ],
        baseBranch: 'main',
        headBranch: 'feature',
        totalChanges: 1,
        additions: 300,
        deletions: 250,
      };

      const result = analyzer.analyze(diff);

      const refactorRisk = result.risks.find(r => r.pattern === 'large-refactor');
      expect(refactorRisk).toBeDefined();
      expect(refactorRisk?.level).toBe('medium');
    });

    it('should flag API changes as low risk', () => {
      const diff: GitDiff = {
        files: [
          { path: 'src/api/users.ts', status: 'modified', additions: 20, deletions: 10, changes: '' },
        ],
        baseBranch: 'main',
        headBranch: 'feature',
        totalChanges: 1,
        additions: 20,
        deletions: 10,
      };

      const result = analyzer.analyze(diff);

      const apiRisk = result.risks.find(r => r.pattern === 'api');
      expect(apiRisk).toBeDefined();
      expect(apiRisk?.level).toBe('low');
    });

    it('should detect multiple risks for a single file', () => {
      const diff: GitDiff = {
        files: [
          { path: 'src/api/auth.ts', status: 'modified', additions: 300, deletions: 250, changes: '' },
        ],
        baseBranch: 'main',
        headBranch: 'feature',
        totalChanges: 1,
        additions: 300,
        deletions: 250,
      };

      const result = analyzer.analyze(diff);

      // Should have both auth (high) and large-refactor (medium) and api (low) risks
      expect(result.risks.length).toBeGreaterThanOrEqual(2);
      const patterns = result.risks.map(r => r.pattern);
      expect(patterns).toContain('auth/security');
      expect(patterns).toContain('large-refactor');
    });
  });

  describe('full analysis', () => {
    it('should provide complete analysis', () => {
      const diff: GitDiff = {
        files: [
          { path: 'src/app.ts', status: 'modified', additions: 50, deletions: 20, changes: '' },
          { path: 'src/app.test.ts', status: 'added', additions: 100, deletions: 0, changes: '' },
          { path: 'package.json', status: 'modified', additions: 2, deletions: 1, changes: '' },
          { path: 'README.md', status: 'modified', additions: 10, deletions: 5, changes: '' },
        ],
        baseBranch: 'main',
        headBranch: 'feature',
        totalChanges: 4,
        additions: 162,
        deletions: 26,
      };

      const result = analyzer.analyze(diff);

      expect(result.categories.length).toBeGreaterThan(0);
      expect(result.testDetection.hasTests).toBe(true);
      expect(result.testDetection.missingTests).toBe(false);
      expect(result.risks.length).toBeGreaterThan(0);
>>>>>>> 486204d (feat: implement PR Readiness Assistant (all 20 issues))
    });
  });
});

// Made with Bob
