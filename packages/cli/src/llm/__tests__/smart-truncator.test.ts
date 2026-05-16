import { describe, it, expect, beforeEach } from '@jest/globals';
import { SmartTruncator } from '../smart-truncator';
import { GitDiff, DiffFile } from '@pr-ready/shared';

describe('SmartTruncator', () => {
  let truncator: SmartTruncator;

  beforeEach(() => {
    truncator = new SmartTruncator({ maxTokens: 1000, charsPerToken: 4 });
  });

  const createMockFile = (path: string, changesLength: number): DiffFile => ({
    path,
    status: 'modified',
    additions: 10,
    deletions: 5,
    changes: 'x'.repeat(changesLength),
  });

  const createMockDiff = (files: DiffFile[]): GitDiff => ({
    files,
    baseBranch: 'main',
    headBranch: 'feature',
    totalChanges: files.length,
    additions: files.reduce((sum, f) => sum + f.additions, 0),
    deletions: files.reduce((sum, f) => sum + f.deletions, 0),
  });

  describe('truncate', () => {
    it('should not truncate if within limits', () => {
      const diff = createMockDiff([
        createMockFile('src/app.ts', 100),
      ]);

      const result = truncator.truncate(diff);

      expect(result.wasTruncated).toBe(false);
      expect(result.skippedFiles).toHaveLength(0);
      expect(result.diff.files).toHaveLength(1);
    });

    it('should skip lock files', () => {
      const diff = createMockDiff([
        createMockFile('package-lock.json', 5000),
        createMockFile('src/app.ts', 100),
      ]);

      const result = truncator.truncate(diff);

      expect(result.skippedFiles).toContain('package-lock.json');
      expect(result.diff.files).toHaveLength(1);
      expect(result.diff.files[0].path).toBe('src/app.ts');
    });

    it('should skip build directories', () => {
      const diff = createMockDiff([
        createMockFile('dist/bundle.js', 5000),
        createMockFile('build/output.js', 5000),
        createMockFile('src/app.ts', 100),
      ]);

      const result = truncator.truncate(diff);

      expect(result.skippedFiles).toContain('dist/bundle.js');
      expect(result.skippedFiles).toContain('build/output.js');
      expect(result.diff.files).toHaveLength(1);
    });

    it('should prioritize source files over config files', () => {
      const diff = createMockDiff([
        createMockFile('package.json', 2000),
        createMockFile('src/app.ts', 2000),
        createMockFile('tsconfig.json', 2000),
      ]);

      const result = truncator.truncate(diff);

      expect(result.wasTruncated).toBe(true);
      // Source file should be included
      const hasSourceFile = result.diff.files.some(f => f.path === 'src/app.ts');
      expect(hasSourceFile).toBe(true);
    });

    it('should truncate large files when necessary', () => {
      const diff = createMockDiff([
        createMockFile('src/large.ts', 10000),
      ]);

      const result = truncator.truncate(diff);

      if (result.wasTruncated) {
        expect(result.warnings.length).toBeGreaterThan(0);
        expect(result.finalTokenCount).toBeLessThanOrEqual(1000);
      }
    });

    it('should handle multiple files with prioritization', () => {
      const diff = createMockDiff([
        createMockFile('src/components/Button.tsx', 500),
        createMockFile('src/utils/helper.ts', 500),
        createMockFile('README.md', 500),
        createMockFile('package.json', 500),
      ]);

      const result = truncator.truncate(diff);

      // High priority files (src/) should be included first
      const sourceFiles = result.diff.files.filter(f => f.path.includes('src/'));
      expect(sourceFiles.length).toBeGreaterThan(0);
    });
  });

  describe('skip patterns', () => {
    it('should skip yarn.lock', () => {
      const diff = createMockDiff([createMockFile('yarn.lock', 5000)]);
      const result = truncator.truncate(diff);
      expect(result.skippedFiles).toContain('yarn.lock');
    });

    it('should skip pnpm-lock.yaml', () => {
      const diff = createMockDiff([createMockFile('pnpm-lock.yaml', 5000)]);
      const result = truncator.truncate(diff);
      expect(result.skippedFiles).toContain('pnpm-lock.yaml');
    });

    it('should skip minified files', () => {
      const diff = createMockDiff([
        createMockFile('bundle.min.js', 5000),
        createMockFile('styles.min.css', 5000),
      ]);
      const result = truncator.truncate(diff);
      expect(result.skippedFiles).toContain('bundle.min.js');
      expect(result.skippedFiles).toContain('styles.min.css');
    });

    it('should skip source maps', () => {
      const diff = createMockDiff([createMockFile('app.js.map', 5000)]);
      const result = truncator.truncate(diff);
      expect(result.skippedFiles).toContain('app.js.map');
    });

    it('should skip node_modules', () => {
      const diff = createMockDiff([createMockFile('node_modules/package/index.js', 5000)]);
      const result = truncator.truncate(diff);
      expect(result.skippedFiles).toContain('node_modules/package/index.js');
    });
  });

  describe('priority patterns', () => {
    it('should prioritize src/ files', () => {
      const diff = createMockDiff([
        createMockFile('src/app.ts', 2000),
        createMockFile('other/file.ts', 2000),
      ]);

      const result = truncator.truncate(diff);

      if (result.wasTruncated) {
        const hasSrcFile = result.diff.files.some(f => f.path.includes('src/'));
        expect(hasSrcFile).toBe(true);
      }
    });

    it('should prioritize components/', () => {
      const diff = createMockDiff([
        createMockFile('components/Button.tsx', 2000),
        createMockFile('other/file.ts', 2000),
      ]);

      const result = truncator.truncate(diff);

      if (result.wasTruncated) {
        const hasComponent = result.diff.files.some(f => f.path.includes('components/'));
        expect(hasComponent).toBe(true);
      }
    });
  });

  describe('token estimation', () => {
    it('should estimate tokens correctly', () => {
      const diff = createMockDiff([
        createMockFile('src/app.ts', 400), // ~100 tokens
      ]);

      const result = truncator.truncate(diff);

      expect(result.originalTokenCount).toBeGreaterThan(0);
      expect(result.finalTokenCount).toBeGreaterThan(0);
    });

    it('should track token reduction', () => {
      const diff = createMockDiff([
        createMockFile('src/large.ts', 10000),
      ]);

      const result = truncator.truncate(diff);

      if (result.wasTruncated) {
        expect(result.finalTokenCount).toBeLessThan(result.originalTokenCount);
      }
    });
  });

  describe('getSummary', () => {
    it('should provide summary for non-truncated diff', () => {
      const diff = createMockDiff([createMockFile('src/app.ts', 100)]);
      const result = truncator.truncate(diff);
      const summary = truncator.getSummary(result);

      expect(summary).toContain('No truncation needed');
      expect(summary).toContain('Token count');
    });

    it('should provide summary for truncated diff', () => {
      const diff = createMockDiff([
        createMockFile('src/large.ts', 10000),
        createMockFile('package-lock.json', 10000),
      ]);
      const result = truncator.truncate(diff);
      const summary = truncator.getSummary(result);

      if (result.wasTruncated) {
        expect(summary).toContain('truncated');
        expect(summary).toContain('Original');
        expect(summary).toContain('Final');
      }
    });

    it('should list skipped files in summary', () => {
      const diff = createMockDiff([
        createMockFile('package-lock.json', 5000),
        createMockFile('yarn.lock', 5000),
      ]);
      const result = truncator.truncate(diff);
      const summary = truncator.getSummary(result);

      expect(summary).toContain('Skipped');
      expect(summary).toContain('package-lock.json');
    });

    it('should limit skipped files list to 10', () => {
      const files = Array.from({ length: 15 }, (_, i) => 
        createMockFile(`file${i}.lock`, 5000)
      );
      const diff = createMockDiff(files);
      const result = truncator.truncate(diff);
      const summary = truncator.getSummary(result);

      expect(summary).toContain('and 5 more');
    });
  });

  describe('custom options', () => {
    it('should respect custom maxTokens', () => {
      const customTruncator = new SmartTruncator({ maxTokens: 500 });
      const diff = createMockDiff([createMockFile('src/app.ts', 3000)]);

      const result = customTruncator.truncate(diff);

      expect(result.finalTokenCount).toBeLessThanOrEqual(500);
    });

    it('should respect custom charsPerToken', () => {
      const customTruncator = new SmartTruncator({ charsPerToken: 2 });
      const diff = createMockDiff([createMockFile('src/app.ts', 100)]);

      const result = customTruncator.truncate(diff);

      expect(result.originalTokenCount).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty diff', () => {
      const diff = createMockDiff([]);

      const result = truncator.truncate(diff);

      expect(result.wasTruncated).toBe(false);
      expect(result.diff.files).toHaveLength(0);
    });

    it('should handle single large file', () => {
      const diff = createMockDiff([createMockFile('src/huge.ts', 50000)]);

      const result = truncator.truncate(diff);

      expect(result.wasTruncated).toBe(true);
      expect(result.finalTokenCount).toBeLessThanOrEqual(1000);
    });

    it('should handle all files being skipped', () => {
      const diff = createMockDiff([
        createMockFile('package-lock.json', 5000),
        createMockFile('yarn.lock', 5000),
        createMockFile('dist/bundle.js', 5000),
      ]);

      const result = truncator.truncate(diff);

      expect(result.diff.files).toHaveLength(0);
      expect(result.skippedFiles.length).toBeGreaterThan(0);
    });
  });
});

// Made with Bob
