
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CacheManager } from '../cache-manager';
import { GitDiff, LLMAnalysis, Config } from '@pr-ready/shared';
import { vol } from 'memfs';
import { fs } from 'memfs';

jest.mock('fs/promises', () => fs.promises);

describe('CacheManager', () => {
  let cacheManager: CacheManager;
  const testCacheDir = '.test-cache';

  const mockDiff: GitDiff = {
    files: [
      { path: 'src/app.ts', status: 'modified', additions: 10, deletions: 5, changes: 'diff content' },
    ],
    baseBranch: 'main',
    headBranch: 'feature',
    totalChanges: 1,
    additions: 10,
    deletions: 5,
  };

  const mockAnalysis: LLMAnalysis = {
    summary: 'Test summary',
    insights: ['Insight 1'],
    keyChanges: ['Change 1'],
  };

  beforeEach(() => {
    vol.reset();
    cacheManager = new CacheManager(testCacheDir, true);
  });

  describe('constructor', () => {
    it('should create cache manager with default settings', () => {
      const cm = new CacheManager();
      expect(cm).toBeDefined();
    });

    it('should create cache manager with custom settings', () => {
      const cm = new CacheManager('/custom/cache', false);
      expect(cm).toBeDefined();
    });
  });

  describe('set and get', () => {
    it('should cache and retrieve LLM analysis', async () => {
      await cacheManager.set(mockDiff, mockAnalysis);
      const cached = await cacheManager.get(mockDiff);

      expect(cached).toEqual(mockAnalysis);
    });

    it('should return null for cache miss', async () => {
      const cached = await cacheManager.get(mockDiff);
      expect(cached).toBeNull();
    });

    it('should invalidate cache when diff changes', async () => {
      await cacheManager.set(mockDiff, mockAnalysis);

      const modifiedDiff: GitDiff = {
        ...mockDiff,
        files: [
          { path: 'src/different.ts', status: 'added', additions: 20, deletions: 0, changes: 'new content' },
        ],
      };

      const cached = await cacheManager.get(modifiedDiff);
      expect(cached).toBeNull();
    });

    it('should invalidate cache when config changes', async () => {
      const config1: Config = {
        llm: { provider: 'openai', model: 'gpt-4' },
      };

      const config2: Config = {
        llm: { provider: 'openai', model: 'gpt-3.5-turbo' },
      };

      await cacheManager.set(mockDiff, mockAnalysis, config1);
      const cached = await cacheManager.get(mockDiff, config2);

      expect(cached).toBeNull();
    });

    it('should handle cache with same config', async () => {
      const config: Config = {
        llm: { provider: 'openai', model: 'gpt-4' },
      };

      await cacheManager.set(mockDiff, mockAnalysis, config);
      const cached = await cacheManager.get(mockDiff, config);

      expect(cached).toEqual(mockAnalysis);
    });

    it('should not cache when disabled', async () => {
      const disabledCache = new CacheManager(testCacheDir, false);
      
      await disabledCache.set(mockDiff, mockAnalysis);
      const cached = await disabledCache.get(mockDiff);

      expect(cached).toBeNull();
    });
  });

  describe('clear', () => {
    it('should clear all cache entries', async () => {
      vol.fromJSON({
        [`${testCacheDir}/file1.json`]: '{}',
        [`${testCacheDir}/file2.json`]: '{}',
      });

      await cacheManager.clear();

      const stats = await cacheManager.getStats();
      expect(stats.entries).toBe(0);
    });

    it('should handle clearing non-existent cache', async () => {
      await expect(cacheManager.clear()).resolves.not.toThrow();
    });
  });

  describe('getStats', () => {
    it('should return cache statistics', async () => {
      vol.fromJSON({
        [`${testCacheDir}/file1.json`]: JSON.stringify({ data: 'test1' }),
        [`${testCacheDir}/file2.json`]: JSON.stringify({ data: 'test2' }),
      });

      const stats = await cacheManager.getStats();

      expect(stats.entries).toBe(2);
      expect(stats.totalSize).toBeGreaterThan(0);
    });

    it('should return zero stats for empty cache', async () => {
      const stats = await cacheManager.getStats();

      expect(stats.entries).toBe(0);
      expect(stats.totalSize).toBe(0);
    });
  });

  describe('hash generation', () => {
    it('should generate consistent hashes for same diff', async () => {
      await cacheManager.set(mockDiff, mockAnalysis);
      const cached1 = await cacheManager.get(mockDiff);

      await cacheManager.set(mockDiff, mockAnalysis);
      const cached2 = await cacheManager.get(mockDiff);

      expect(cached1).toEqual(cached2);
    });

    it('should generate different hashes for different diffs', async () => {
      const diff1: GitDiff = {
        ...mockDiff,
        files: [{ path: 'file1.ts', status: 'added', additions: 10, deletions: 0, changes: 'content1' }],
      };

      const diff2: GitDiff = {
        ...mockDiff,
        files: [{ path: 'file2.ts', status: 'added', additions: 10, deletions: 0, changes: 'content2' }],
      };

      await cacheManager.set(diff1, mockAnalysis);
      const cached = await cacheManager.get(diff2);

      expect(cached).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should handle read errors gracefully', async () => {
      const cached = await cacheManager.get(mockDiff);
      expect(cached).toBeNull();
    });

    it('should handle write errors gracefully', async () => {
      await expect(cacheManager.set(mockDiff, mockAnalysis)).resolves.not.toThrow();
    });
  });
});
