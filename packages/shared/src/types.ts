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
  risks: RiskFlag[];
  checklist: string[];
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
  };
  test?: {
    command?: string;
    patterns?: string[];
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

// Made with Bob
