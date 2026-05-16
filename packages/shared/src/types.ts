/**
 * Shared types for PR Readiness Assistant
 */

export interface GitDiff {
  files: DiffFile[];
  baseBranch: string;
  headBranch: string;
  totalChanges: number;
  additions: number;
  deletions: number;
}

export interface DiffFile {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  additions: number;
  deletions: number;
  changes: string;
  oldPath?: string; // For renamed files
}

export interface FileCategory {
  name: string;
  files: string[];
  count: number;
}

export interface TestDetection {
  testFiles: string[];
  hasTests: boolean;
  sourceFilesChanged: boolean;
  missingTests: boolean;
}

export interface RiskFlag {
  level: 'high' | 'medium' | 'low';
  file: string;
  reason: string;
  pattern: string;
}

export interface RuleAnalysis {
  categories: FileCategory[];
  testDetection: TestDetection;
  risks: RiskFlag[];
}

export interface PRPacket {
  summary: string;
  filesChanged: FileCategory[];
  testStatus: TestDetection;
  testResults?: TestResult;
  risks: RiskFlag[];
  checklist: string[];
  monorepo?: MonorepoDetection;
  metadata: {
    baseBranch: string;
    headBranch: string;
    totalFiles: number;
    totalChanges: number;
    generatedAt: string;
  };
}

export interface DiffOptions {
  baseBranch?: string;
  headBranch?: string;
  cwd?: string;
}

export interface AnalysisOptions {
  useLLM: boolean;
  llmProvider?: 'openai' | 'anthropic' | 'ollama';
  runTests: boolean;
  useCache: boolean;
}

export interface OutputOptions {
  file: string;
  clipboard: boolean;
}

export interface Config {
  llm?: {
    provider?: 'openai' | 'anthropic' | 'ollama' | 'none';
    apiKey?: string;
    model?: string;
    endpoint?: string; // For Ollama custom endpoint
  };
  test?: {
    command?: string;
    patterns?: string[];
    timeout?: number; // in milliseconds, default 300000 (5 min)
  };
  risks?: {
    patterns?: string[];
  };
  output?: {
    file?: string;
    clipboard?: boolean;
  };
  monorepo?: {
    enabled?: boolean;
    packages?: string[];
  };
}

export interface TestResult {
  passed: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests?: number;
  duration: number; // in milliseconds
  output: string;
  error?: string;
}

export interface LLMAnalysis {
  summary: string;
  insights: string[];
  keyChanges: string[];
  suggestedReviewers?: string[];
  checklistItems?: string[]; // 2-4 context-specific checklist items
}

export interface LLMProvider {
  analyze(diff: GitDiff): Promise<LLMAnalysis>;
  isConfigured(): boolean;
}

export interface HybridAnalysis extends RuleAnalysis {
  llmAnalysis?: LLMAnalysis;
  llmError?: string;
}

export interface MonorepoPackage {
  name: string;
  path: string;
  packageJson?: any;
}

export interface MonorepoDetection {
  isMonorepo: boolean;
  type?: 'npm-workspaces' | 'lerna' | 'nx' | 'pnpm' | 'yarn';
  packages: MonorepoPackage[];
  affectedPackages: string[];
}

// Made with Bob
