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
    });
  });
});

// Made with Bob
