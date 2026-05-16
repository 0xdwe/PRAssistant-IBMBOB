
import { GitDiff, DiffFile } from '@pr-ready/shared';

export interface TruncationResult {
  diff: GitDiff;
  wasTruncated: boolean;
  skippedFiles: string[];
  originalTokenCount: number;
  finalTokenCount: number;
  warnings: string[];
}

export interface TruncatorOptions {
  maxTokens?: number;
  charsPerToken?: number;
}

export class SmartTruncator {
  private readonly SKIP_PATTERNS = [
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    'dist/',
    'build/',
    '.next/',
    'node_modules/',
    '.git/',
    'coverage/',
    '*.min.js',
    '*.min.css',
    '*.map',
  ];

  private readonly PRIORITY_PATTERNS = [
    'src/',
    'lib/',
    'app/',
    'components/',
    'pages/',
    'api/',
    'services/',
    'utils/',
    'hooks/',
  ];

  private readonly CONFIG_PATTERNS = [
    'package.json',
    'tsconfig.json',
    'webpack.config',
    'vite.config',
    'next.config',
    '.eslintrc',
    '.prettierrc',
    'jest.config',
    'babel.config',
  ];

  private maxTokens: number;
  private charsPerToken: number;

  constructor(options: TruncatorOptions = {}) {
    this.maxTokens = options.maxTokens || 100000; // Default 100k tokens for GPT-4
    this.charsPerToken = options.charsPerToken || 4; // Approximate: 1 token ≈ 4 chars
  }

  /**
   * Truncate a GitDiff to fit within token limits
   */
  truncate(diff: GitDiff): TruncationResult {
    const skippedFiles: string[] = [];
    const warnings: string[] = [];

    // Calculate original token count
    const originalTokenCount = this.estimateTokens(diff);

    // If already within limits, return as-is
    if (originalTokenCount <= this.maxTokens) {
      return {
        diff,
        wasTruncated: false,
        skippedFiles: [],
        originalTokenCount,
        finalTokenCount: originalTokenCount,
        warnings: [],
      };
    }

    // Filter out files that should be skipped
    const { kept, skipped } = this.filterFiles(diff.files);
    skippedFiles.push(...skipped.map(f => f.path));

    // Categorize remaining files by priority
    const prioritized = this.prioritizeFiles(kept);

    // Build truncated diff
    let currentTokens = this.estimateMetadataTokens(diff);
    const truncatedFiles: DiffFile[] = [];

    // Add high priority files first
    for (const file of prioritized.high) {
      const fileTokens = this.estimateFileTokens(file);
      if (currentTokens + fileTokens <= this.maxTokens) {
        truncatedFiles.push(file);
        currentTokens += fileTokens;
      } else {
        // Try to add truncated version
        const truncatedFile = this.truncateFile(file, this.maxTokens - currentTokens);
        if (truncatedFile) {
          truncatedFiles.push(truncatedFile);
          currentTokens += this.estimateFileTokens(truncatedFile);
          warnings.push(`File truncated: ${file.path}`);
        } else {
          skippedFiles.push(file.path);
        }
        break;
      }
    }

    // Add medium priority files if space remains
    if (currentTokens < this.maxTokens) {
      for (const file of prioritized.medium) {
        const fileTokens = this.estimateFileTokens(file);
        if (currentTokens + fileTokens <= this.maxTokens) {
          truncatedFiles.push(file);
          currentTokens += fileTokens;
        } else {
          const truncatedFile = this.truncateFile(file, this.maxTokens - currentTokens);
          if (truncatedFile) {
            truncatedFiles.push(truncatedFile);
            currentTokens += this.estimateFileTokens(truncatedFile);
            warnings.push(`File truncated: ${file.path}`);
          } else {
            skippedFiles.push(file.path);
          }
          break;
        }
      }
    }

    // Add low priority files if space remains
    if (currentTokens < this.maxTokens) {
      for (const file of prioritized.low) {
        const fileTokens = this.estimateFileTokens(file);
        if (currentTokens + fileTokens <= this.maxTokens) {
          truncatedFiles.push(file);
          currentTokens += fileTokens;
        } else {
          skippedFiles.push(file.path);
        }
      }
    }

    const truncatedDiff: GitDiff = {
      ...diff,
      files: truncatedFiles,
      totalChanges: truncatedFiles.reduce((sum, f) => sum + f.additions + f.deletions, 0),
      additions: truncatedFiles.reduce((sum, f) => sum + f.additions, 0),
      deletions: truncatedFiles.reduce((sum, f) => sum + f.deletions, 0),
    };

    const finalTokenCount = this.estimateTokens(truncatedDiff);

    if (skippedFiles.length > 0) {
      warnings.push(`Skipped ${skippedFiles.length} file(s) due to token limits or skip patterns`);
    }

    return {
      diff: truncatedDiff,
      wasTruncated: true,
      skippedFiles,
      originalTokenCount,
      finalTokenCount,
      warnings,
    };
  }

  /**
   * Filter files based on skip patterns
   */
  private filterFiles(files: DiffFile[]): { kept: DiffFile[]; skipped: DiffFile[] } {
    const kept: DiffFile[] = [];
    const skipped: DiffFile[] = [];

    for (const file of files) {
      if (this.shouldSkipFile(file.path)) {
        skipped.push(file);
      } else {
        kept.push(file);
      }
    }

    return { kept, skipped };
  }

  /**
   * Check if a file should be skipped based on patterns
   */
  private shouldSkipFile(path: string): boolean {
    return this.SKIP_PATTERNS.some(pattern => {
      if (pattern.endsWith('/')) {
        return path.includes(pattern);
      }
      if (pattern.startsWith('*.')) {
        return path.endsWith(pattern.substring(1));
      }
      return path.includes(pattern);
    });
  }

  /**
   * Prioritize files into high, medium, and low priority
   */
  private prioritizeFiles(files: DiffFile[]): {
    high: DiffFile[];
    medium: DiffFile[];
    low: DiffFile[];
  } {
    const high: DiffFile[] = [];
    const medium: DiffFile[] = [];
    const low: DiffFile[] = [];

    for (const file of files) {
      if (this.isHighPriority(file.path)) {
        high.push(file);
      } else if (this.isConfigFile(file.path)) {
        low.push(file);
      } else {
        medium.push(file);
      }
    }

    return { high, medium, low };
  }

  /**
   * Check if a file is high priority (source code)
   */
  private isHighPriority(path: string): boolean {
    return this.PRIORITY_PATTERNS.some(pattern => path.includes(pattern));
  }

  /**
   * Check if a file is a config file
   */
  private isConfigFile(path: string): boolean {
    return this.CONFIG_PATTERNS.some(pattern => path.includes(pattern));
  }

  /**
   * Truncate a single file's changes to fit within token budget
   */
  private truncateFile(file: DiffFile, maxTokens: number): DiffFile | null {
    const minTokens = 100; // Minimum tokens to keep a file
    if (maxTokens < minTokens) {
      return null;
    }

    const maxChars = maxTokens * this.charsPerToken;
    const lines = file.changes.split('\n');
    
    // Keep file metadata and first/last few lines
    const headerLines = lines.slice(0, 5);
    const footerLines = lines.slice(-5);
    const middleLines = lines.slice(5, -5);

    let truncatedChanges = headerLines.join('\n');
    const availableChars = maxChars - truncatedChanges.length - footerLines.join('\n').length - 100;

    if (availableChars > 0 && middleLines.length > 0) {
      const middleChars = middleLines.join('\n').substring(0, availableChars);
      truncatedChanges += '\n... [truncated] ...\n' + middleChars;
    }

    truncatedChanges += '\n' + footerLines.join('\n');

    return {
      ...file,
      changes: truncatedChanges,
    };
  }

  /**
   * Estimate token count for entire diff
   */
  private estimateTokens(diff: GitDiff): number {
    let tokens = this.estimateMetadataTokens(diff);
    
    for (const file of diff.files) {
      tokens += this.estimateFileTokens(file);
    }

    return tokens;
  }

  /**
   * Estimate tokens for diff metadata
   */
  private estimateMetadataTokens(diff: GitDiff): number {
    const metadata = `${diff.baseBranch} ${diff.headBranch} ${diff.totalChanges} ${diff.additions} ${diff.deletions}`;
    return Math.ceil(metadata.length / this.charsPerToken);
  }

  /**
   * Estimate token count for a single file
   */
  private estimateFileTokens(file: DiffFile): number {
    const pathTokens = Math.ceil(file.path.length / this.charsPerToken);
    const changesTokens = Math.ceil(file.changes.length / this.charsPerToken);
    return pathTokens + changesTokens + 10; // +10 for metadata
  }

  /**
   * Get a summary of what would be truncated (for warnings)
   */
  getSummary(result: TruncationResult): string {
    const lines: string[] = [];

    if (!result.wasTruncated) {
      lines.push('✓ No truncation needed');
      lines.push(`  Token count: ${result.originalTokenCount.toLocaleString()} / ${this.maxTokens.toLocaleString()}`);
      return lines.join('\n');
    }

    lines.push('⚠ Diff truncated to fit token limits');
    lines.push(`  Original: ${result.originalTokenCount.toLocaleString()} tokens`);
    lines.push(`  Final: ${result.finalTokenCount.toLocaleString()} tokens`);
    lines.push(`  Limit: ${this.maxTokens.toLocaleString()} tokens`);

    if (result.skippedFiles.length > 0) {
      lines.push(`\n  Skipped ${result.skippedFiles.length} file(s):`);
      result.skippedFiles.slice(0, 10).forEach(file => {
        lines.push(`    - ${file}`);
      });
      if (result.skippedFiles.length > 10) {
        lines.push(`    ... and ${result.skippedFiles.length - 10} more`);
      }
    }

    if (result.warnings.length > 0) {
      lines.push('\n  Warnings:');
      result.warnings.forEach(warning => {
        lines.push(`    - ${warning}`);
      });
    }

    return lines.join('\n');
  }
}
