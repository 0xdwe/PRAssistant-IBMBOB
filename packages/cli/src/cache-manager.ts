import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { GitDiff, LLMAnalysis, Config } from '@pr-ready/shared';

export interface CacheEntry {
  diffHash: string;
  configHash: string;
  llmAnalysis: LLMAnalysis;
  timestamp: number;
}

export class CacheManager {
  private cacheDir: string;
  private enabled: boolean;

  constructor(cacheDir: string = '.pr-ready-cache', enabled: boolean = true) {
    this.cacheDir = cacheDir;
    this.enabled = enabled;
  }

  /**
   * Generate SHA-256 hash of diff content
   */
  private hashDiff(diff: GitDiff): string {
    // Create a stable string representation of the diff
    const diffString = JSON.stringify({
      files: diff.files.map(f => ({
        path: f.path,
        status: f.status,
        changes: f.changes,
        oldPath: f.oldPath,
      })),
      baseBranch: diff.baseBranch,
      headBranch: diff.headBranch,
    });

    return crypto.createHash('sha256').update(diffString).digest('hex');
  }

  /**
   * Generate hash of LLM config to detect config changes
   */
  private hashConfig(config?: Config): string {
    if (!config?.llm) {
      return 'no-llm';
    }

    // Only hash relevant LLM settings that affect analysis
    const configString = JSON.stringify({
      provider: config.llm.provider,
      model: config.llm.model,
      endpoint: config.llm.endpoint,
    });

    return crypto.createHash('sha256').update(configString).digest('hex');
  }

  /**
   * Get cache file path for a given diff hash
   */
  private getCacheFilePath(diffHash: string): string {
    return path.join(this.cacheDir, `${diffHash}.json`);
  }

  /**
   * Ensure cache directory exists
   */
  private async ensureCacheDir(): Promise<void> {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      // Ignore if directory already exists
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw error;
      }
    }
  }

  /**
   * Get cached LLM analysis if available and valid
   */
  async get(diff: GitDiff, config?: Config): Promise<LLMAnalysis | null> {
    if (!this.enabled) {
      return null;
    }

    try {
      const diffHash = this.hashDiff(diff);
      const configHash = this.hashConfig(config);
      const cacheFilePath = this.getCacheFilePath(diffHash);

      // Check if cache file exists
      try {
        await fs.access(cacheFilePath);
      } catch {
        // Cache miss - file doesn't exist
        return null;
      }

      // Read cache file
      const cacheContent = await fs.readFile(cacheFilePath, 'utf-8');
      const cacheEntry: CacheEntry = JSON.parse(cacheContent);

      // Validate config hash - invalidate if config changed
      if (cacheEntry.configHash !== configHash) {
        console.log('Cache invalidated: LLM config changed');
        return null;
      }

      console.log('✓ Cache hit - loading cached LLM analysis');
      return cacheEntry.llmAnalysis;
    } catch (error) {
      // On any error, treat as cache miss
      console.log('Cache read error, treating as cache miss');
      return null;
    }
  }

  /**
   * Save LLM analysis to cache
   */
  async set(diff: GitDiff, llmAnalysis: LLMAnalysis, config?: Config): Promise<void> {
    if (!this.enabled) {
      return;
    }

    try {
      await this.ensureCacheDir();

      const diffHash = this.hashDiff(diff);
      const configHash = this.hashConfig(config);
      const cacheFilePath = this.getCacheFilePath(diffHash);

      const cacheEntry: CacheEntry = {
        diffHash,
        configHash,
        llmAnalysis,
        timestamp: Date.now(),
      };

      await fs.writeFile(cacheFilePath, JSON.stringify(cacheEntry, null, 2), 'utf-8');
      console.log('✓ LLM analysis cached');
    } catch (error) {
      // Don't fail if cache write fails - just log
      console.log('Warning: Failed to write cache');
    }
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    try {
      const files = await fs.readdir(this.cacheDir);
      await Promise.all(
        files.map(file => fs.unlink(path.join(this.cacheDir, file)))
      );
      console.log('✓ Cache cleared');
    } catch (error) {
      // Ignore if cache directory doesn't exist
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{ entries: number; totalSize: number }> {
    try {
      const files = await fs.readdir(this.cacheDir);
      let totalSize = 0;

      for (const file of files) {
        const filePath = path.join(this.cacheDir, file);
        const stats = await fs.stat(filePath);
        totalSize += stats.size;
      }

      return {
        entries: files.length,
        totalSize,
      };
    } catch (error) {
      return { entries: 0, totalSize: 0 };
    }
  }
}

// Made with Bob