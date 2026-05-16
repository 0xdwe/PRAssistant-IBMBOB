
import simpleGit, { SimpleGit, DiffResult } from 'simple-git';
import { GitDiff, DiffFile, DiffOptions } from '@pr-ready/shared';

export class GitDiffExtractor {
  private git: SimpleGit;

  constructor(cwd: string = process.cwd()) {
    this.git = simpleGit(cwd);
  }

  async extractDiff(options: DiffOptions = {}): Promise<GitDiff> {
    // If cwd is provided in options, reinitialize git with the new directory
    if (options.cwd) {
      this.git = simpleGit(options.cwd);
    }
    
    // Verify we're in a git repository
    const isRepo = await this.git.checkIsRepo();
    if (!isRepo) {
      throw new Error('Not a git repository. Please run this command from within a git repository.');
    }

    // Check if we should analyze uncommitted changes (when no branches specified)
    const analyzeUncommitted = !options.baseBranch && !options.headBranch;
    
    let diffSummary;
    let baseBranch: string;
    let headBranch: string;
    
    if (analyzeUncommitted) {
      // Get uncommitted changes (staged + unstaged)
      diffSummary = await this.git.diffSummary(['HEAD']);
      baseBranch = 'HEAD';
      headBranch = 'Working Directory';
      
      // If no changes in diff, check for untracked files
      if (diffSummary.files.length === 0) {
        const status = await this.git.status();
        if (status.not_added.length === 0 && status.modified.length === 0 && status.created.length === 0) {
          throw new Error('No uncommitted changes found. Make some changes or commit your work first.');
        }
      }
    } else {
      // Get current branch if head not specified
      headBranch = options.headBranch || await this.getCurrentBranch();
      
      // Auto-detect base branch if not specified
      baseBranch = options.baseBranch || await this.detectUpstreamBranch();

      // Get diff between branches
      diffSummary = await this.git.diffSummary([baseBranch, headBranch]);
      
      if (diffSummary.files.length === 0) {
        throw new Error(`No differences found between ${baseBranch} and ${headBranch}`);
      }
    }

    // Get detailed diff for each file
    const files: DiffFile[] = [];
    
    for (const file of diffSummary.files) {
      const fileDiff = analyzeUncommitted
        ? await this.git.diff(['HEAD', '--', file.file])
        : await this.git.diff([baseBranch, headBranch, '--', file.file]);
      
      // Handle different file types from simple-git
      const insertions = 'insertions' in file ? file.insertions : 0;
      const deletions = 'deletions' in file ? file.deletions : 0;
      const isBinary = 'binary' in file ? file.binary : false;
      
      const diffFile: DiffFile = {
        path: file.file,
        status: this.mapStatus(file),
        additions: insertions,
        deletions: deletions,
        changes: isBinary ? '[Binary file]' : fileDiff,
      };

      files.push(diffFile);
    }

    return {
      files,
      baseBranch,
      headBranch,
      totalChanges: diffSummary.changed,
      additions: diffSummary.insertions,
      deletions: diffSummary.deletions,
    };
  }

  private async getCurrentBranch(): Promise<string> {
    const status = await this.git.status();
    return status.current || 'HEAD';
  }

  private async detectUpstreamBranch(): Promise<string> {
    try {
      // Try common upstream branch names
      const branches = await this.git.branch(['-r']);
      const remoteBranches = branches.all;

      // Priority order for upstream detection
      const candidates = [
        'origin/main',
        'origin/master',
        'origin/develop',
        'upstream/main',
        'upstream/master',
      ];

      for (const candidate of candidates) {
        if (remoteBranches.includes(candidate)) {
          return candidate;
        }
      }

      // If no common branch found, try to get the tracking branch
      const currentBranch = await this.getCurrentBranch();
      const trackingBranch = await this.git.revparse(['--abbrev-ref', `${currentBranch}@{upstream}`])
        .catch(() => null);

      if (trackingBranch) {
        return trackingBranch.trim();
      }

      // Last resort: use origin/main
      return 'origin/main';
    } catch (error) {
      throw new Error('Could not auto-detect upstream branch. Please specify --base flag.');
    }
  }

  private mapStatus(file: any): 'added' | 'modified' | 'deleted' | 'renamed' {
    // simple-git doesn't provide clear status, infer from changes
    if (file.insertions > 0 && file.deletions === 0) {
      return 'added';
    } else if (file.insertions === 0 && file.deletions > 0) {
      return 'deleted';
    } else {
      return 'modified';
    }
  }
}
