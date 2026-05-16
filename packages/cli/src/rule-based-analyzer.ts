import { GitDiff, RuleAnalysis, FileCategory, TestDetection, RiskFlag } from '@pr-ready/shared';

export class RuleBasedAnalyzer {
  analyze(diff: GitDiff): RuleAnalysis {
    const categories = this.categorizeFiles(diff);
    const testDetection = this.detectTests(diff);
    const risks = this.detectRisks(diff);

    return {
      categories,
      testDetection,
      risks,
    };
  }

  private categorizeFiles(diff: GitDiff): FileCategory[] {
    const categoryMap = new Map<string, string[]>();

    for (const file of diff.files) {
      const category = this.determineCategory(file.path);
      
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(file.path);
    }

    // Convert map to array and sort by category name
    const categories: FileCategory[] = [];
    for (const [name, files] of categoryMap.entries()) {
      categories.push({
        name,
        files: files.sort(),
        count: files.length,
      });
    }

    return categories.sort((a, b) => a.name.localeCompare(b.name));
  }

  private determineCategory(filePath: string): string {
    const path = filePath.toLowerCase();

    // Test files
    if (this.isTestFile(filePath)) {
      return 'tests';
    }

    // Documentation
    if (path.match(/\.(md|txt|rst)$/) || path.includes('/docs/') || path.includes('/documentation/')) {
      return 'docs';
    }

    // Configuration files
    if (path.match(/\.(json|yaml|yml|toml|ini|conf|config)$/) || 
        path.includes('config/') ||
        path.match(/^\..*rc$/) ||
        path.match(/^(package|tsconfig|jest|webpack|vite|rollup|babel)\..*\.(js|json|ts)$/)) {
      return 'config';
    }

    // Frontend (common frontend directories and file types)
    if (path.includes('/frontend/') || 
        path.includes('/client/') || 
        path.includes('/web/') ||
        path.includes('/ui/') ||
        path.includes('/components/') ||
        path.includes('/pages/') ||
        path.includes('/views/') ||
        path.match(/\.(jsx|tsx|vue|svelte|css|scss|sass|less)$/)) {
      return 'frontend';
    }

    // Backend (common backend directories)
    if (path.includes('/backend/') || 
        path.includes('/server/') || 
        path.includes('/api/') ||
        path.includes('/services/') ||
        path.includes('/controllers/') ||
        path.includes('/models/') ||
        path.includes('/routes/')) {
      return 'backend';
    }

    // Database/migrations
    if (path.includes('/migrations/') || 
        path.includes('/seeds/') ||
        path.includes('/schema/') ||
        path.includes('database/')) {
      return 'database';
    }

    // Build/tooling
    if (path.includes('/scripts/') || 
        path.includes('/tools/') ||
        path.includes('/build/') ||
        path.includes('/.github/') ||
        path.includes('/.gitlab/')) {
      return 'tooling';
    }

    // Root level files
    if (!path.includes('/')) {
      return 'root';
    }

    // Default: use first directory name
    const firstDir = filePath.split('/')[0];
    return firstDir || 'other';
  }

  private detectTests(diff: GitDiff): TestDetection {
    const testFiles: string[] = [];
    let sourceFilesChanged = false;

    for (const file of diff.files) {
      if (this.isTestFile(file.path)) {
        testFiles.push(file.path);
      } else if (this.isSourceFile(file.path)) {
        sourceFilesChanged = true;
      }
    }

    const hasTests = testFiles.length > 0;
    const missingTests = sourceFilesChanged && !hasTests;

    return {
      testFiles,
      hasTests,
      sourceFilesChanged,
      missingTests,
    };
  }

  private isTestFile(filePath: string): boolean {
    const path = filePath.toLowerCase();
    return (
      path.includes('__tests__/') ||
      path.includes('.test.') ||
      path.includes('.spec.') ||
      path.includes('/tests/') ||
      path.includes('/test/')
    );
  }

  private isSourceFile(filePath: string): boolean {
    const path = filePath.toLowerCase();
    
    // Exclude non-source files
    if (this.isTestFile(path)) return false;
    if (path.match(/\.(md|txt|json|yaml|yml)$/)) return false;
    if (path.includes('/docs/')) return false;
    
    // Include common source file extensions
    return path.match(/\.(ts|tsx|js|jsx|py|java|go|rs|cpp|c|cs|rb|php|swift|kt)$/) !== null;
  }

  private detectRisks(diff: GitDiff): RiskFlag[] {
    const risks: RiskFlag[] = [];

    for (const file of diff.files) {
      const fileRisks = this.analyzeFileRisks(file.path, file.additions + file.deletions);
      risks.push(...fileRisks);
    }

    return risks;
  }

  private analyzeFileRisks(filePath: string, totalChanges: number): RiskFlag[] {
    const risks: RiskFlag[] = [];
    const path = filePath.toLowerCase();

    // High risk: Database migrations
    if (path.includes('migrations/') || path.includes('schema/') || path.includes('/migrations/') || path.includes('/schema/')) {
      risks.push({
        level: 'high',
        file: filePath,
        reason: 'Database schema change',
        pattern: 'migrations/schema',
      });
    }

    // High risk: Authentication/security
    if (path.includes('/auth/') || path.includes('/security/') || path.includes('authentication')) {
      risks.push({
        level: 'high',
        file: filePath,
        reason: 'Authentication or security code modified',
        pattern: 'auth/security',
      });
    }

    // High risk: Package dependencies
    if (path === 'package.json' || path === 'package-lock.json' || 
        path === 'yarn.lock' || path === 'pnpm-lock.yaml') {
      risks.push({
        level: 'high',
        file: filePath,
        reason: 'Package dependencies changed',
        pattern: 'dependencies',
      });
    }

    // Medium risk: Configuration files
    if (path.match(/\.(config|conf)\.(js|ts|json)$/) || 
        path.includes('webpack') || 
        path.includes('vite') ||
        path.includes('tsconfig')) {
      risks.push({
        level: 'medium',
        file: filePath,
        reason: 'Build or TypeScript configuration changed',
        pattern: 'config',
      });
    }

    // Medium risk: Environment files
    if (path.includes('.env') || path.includes('environment')) {
      risks.push({
        level: 'medium',
        file: filePath,
        reason: 'Environment configuration changed',
        pattern: 'environment',
      });
    }

    // Medium risk: Large refactors
    if (totalChanges > 500) {
      risks.push({
        level: 'medium',
        file: filePath,
        reason: `Large file change (${totalChanges} lines)`,
        pattern: 'large-refactor',
      });
    }

    // Low risk: API routes
    if (path.includes('/api/') || path.includes('/routes/')) {
      risks.push({
        level: 'low',
        file: filePath,
        reason: 'API endpoint modified',
        pattern: 'api',
      });
    }

    return risks;
  }
}

// Made with Bob
