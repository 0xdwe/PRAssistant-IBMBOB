
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { GitDiffExtractor } from '../git-diff-extractor';
import simpleGit from 'simple-git';

// Mock simple-git
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
      revparse: jest.fn(),
    };

    (simpleGit as jest.MockedFunction<typeof simpleGit>).mockReturnValue(mockGit as any);
    extractor = new GitDiffExtractor('/test/path');
  });

  describe('extractDiff', () => {
    it('should throw error if not in git repository', async () => {
      mockGit.checkIsRepo.mockResolvedValue(false);

      await expect(extractor.extractDiff()).rejects.toThrow(
        'Not a git repository'
      );
    });

    it('should extract diff between branches', async () => {
      mockGit.checkIsRepo.mockResolvedValue(true);
      mockGit.status.mockResolvedValue({ current: 'feature-branch' });
      mockGit.branch.mockResolvedValue({
        all: ['origin/main', 'origin/develop'],
      });
      mockGit.diffSummary.mockResolvedValue({
        files: [
          {
            file: 'src/app.ts',
            insertions: 10,
            deletions: 5,
            binary: false,
          },
          {
            file: 'src/utils.ts',
            insertions: 20,
            deletions: 0,
            binary: false,
          },
        ],
        changed: 2,
        insertions: 30,
        deletions: 5,
      });
      mockGit.diff.mockResolvedValue('diff content');

      const result = await extractor.extractDiff({
        baseBranch: 'origin/main',
        headBranch: 'feature-branch',
      });

      expect(result.files).toHaveLength(2);
      expect(result.baseBranch).toBe('origin/main');
      expect(result.headBranch).toBe('feature-branch');
      expect(result.totalChanges).toBe(2);
      expect(result.additions).toBe(30);
      expect(result.deletions).toBe(5);
    });

    it('should auto-detect current branch', async () => {
      mockGit.checkIsRepo.mockResolvedValue(true);
      mockGit.status.mockResolvedValue({ current: 'feature-branch' });
      mockGit.branch.mockResolvedValue({
        all: ['origin/main'],
      });
      mockGit.diffSummary.mockResolvedValue({
        files: [{ file: 'test.ts', insertions: 1, deletions: 0 }],
        changed: 1,
        insertions: 1,
        deletions: 0,
      });
      mockGit.diff.mockResolvedValue('diff');

      const result = await extractor.extractDiff({ baseBranch: 'origin/main' });

      expect(result.headBranch).toBe('feature-branch');
    });

    it('should auto-detect base branch', async () => {
      mockGit.checkIsRepo.mockResolvedValue(true);
      mockGit.status.mockResolvedValue({ current: 'feature' });
      mockGit.branch.mockResolvedValue({
        all: ['origin/main', 'origin/develop'],
      });
      mockGit.diffSummary.mockResolvedValue({
        files: [{ file: 'test.ts', insertions: 1, deletions: 0 }],
        changed: 1,
        insertions: 1,
        deletions: 0,
      });
      mockGit.diff.mockResolvedValue('diff');

      const result = await extractor.extractDiff({ headBranch: 'feature' });

      expect(result.baseBranch).toBe('origin/main');
    });

    it('should handle binary files', async () => {
      mockGit.checkIsRepo.mockResolvedValue(true);
      mockGit.status.mockResolvedValue({ current: 'main' });
      mockGit.branch.mockResolvedValue({ all: ['origin/main'] });
      mockGit.diffSummary.mockResolvedValue({
        files: [
          {
            file: 'image.png',
            insertions: 0,
            deletions: 0,
            binary: true,
          },
        ],
        changed: 1,
        insertions: 0,
        deletions: 0,
      });
      mockGit.diff.mockResolvedValue('');

      const result = await extractor.extractDiff({
        baseBranch: 'origin/main',
        headBranch: 'main',
      });

      expect(result.files[0].changes).toBe('[Binary file]');
    });

    it('should throw error if no differences found', async () => {
      mockGit.checkIsRepo.mockResolvedValue(true);
      mockGit.status.mockResolvedValue({ current: 'main' });
      mockGit.branch.mockResolvedValue({ all: ['origin/main'] });
      mockGit.diffSummary.mockResolvedValue({
        files: [],
        changed: 0,
        insertions: 0,
        deletions: 0,
      });

      await expect(
        extractor.extractDiff({
          baseBranch: 'origin/main',
          headBranch: 'main',
        })
      ).rejects.toThrow('No differences found');
    });

    it('should map file status correctly', async () => {
      mockGit.checkIsRepo.mockResolvedValue(true);
      mockGit.status.mockResolvedValue({ current: 'main' });
      mockGit.branch.mockResolvedValue({ all: ['origin/main'] });
      mockGit.diffSummary.mockResolvedValue({
        files: [
          { file: 'added.ts', insertions: 10, deletions: 0 },
          { file: 'deleted.ts', insertions: 0, deletions: 10 },
          { file: 'modified.ts', insertions: 5, deletions: 5 },
        ],
        changed: 3,
        insertions: 15,
        deletions: 15,
      });
      mockGit.diff.mockResolvedValue('diff');

      const result = await extractor.extractDiff({
        baseBranch: 'origin/main',
        headBranch: 'main',
      });

      expect(result.files[0].status).toBe('added');
      expect(result.files[1].status).toBe('deleted');
      expect(result.files[2].status).toBe('modified');
    });
  });

  describe('upstream branch detection', () => {
    it('should detect origin/main as upstream', async () => {
      mockGit.checkIsRepo.mockResolvedValue(true);
      mockGit.status.mockResolvedValue({ current: 'feature' });
      mockGit.branch.mockResolvedValue({
        all: ['origin/main', 'origin/feature'],
      });
      mockGit.diffSummary.mockResolvedValue({
        files: [{ file: 'test.ts', insertions: 1, deletions: 0 }],
        changed: 1,
        insertions: 1,
        deletions: 0,
      });
      mockGit.diff.mockResolvedValue('diff');

      const result = await extractor.extractDiff({ headBranch: 'feature' });

      expect(result.baseBranch).toBe('origin/main');
    });

    it('should fallback to origin/master if main not found', async () => {
      mockGit.checkIsRepo.mockResolvedValue(true);
      mockGit.status.mockResolvedValue({ current: 'feature' });
      mockGit.branch.mockResolvedValue({
        all: ['origin/master', 'origin/feature'],
      });
      mockGit.diffSummary.mockResolvedValue({
        files: [{ file: 'test.ts', insertions: 1, deletions: 0 }],
        changed: 1,
        insertions: 1,
        deletions: 0,
      });
      mockGit.diff.mockResolvedValue('diff');

      const result = await extractor.extractDiff({ headBranch: 'feature' });

      expect(result.baseBranch).toBe('origin/master');
    });

    it('should use tracking branch if available', async () => {
      mockGit.checkIsRepo.mockResolvedValue(true);
      mockGit.status.mockResolvedValue({ current: 'feature' });
      mockGit.branch.mockResolvedValue({
        all: ['origin/develop'],
      });
      mockGit.revparse.mockResolvedValue('origin/develop');
      mockGit.diffSummary.mockResolvedValue({
        files: [{ file: 'test.ts', insertions: 1, deletions: 0 }],
        changed: 1,
        insertions: 1,
        deletions: 0,
      });
      mockGit.diff.mockResolvedValue('diff');

      const result = await extractor.extractDiff({ headBranch: 'feature' });

      expect(result.baseBranch).toBe('origin/develop');
    });
  });
});
