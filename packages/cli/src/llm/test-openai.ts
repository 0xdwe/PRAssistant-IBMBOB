#!/usr/bin/env node
import { OpenAIProvider } from './openai-provider';
import { GitDiff } from '@pr-ready/shared';

/**
 * Simple test script to verify OpenAI provider works
 * Usage: OPENAI_API_KEY=your-key node dist/llm/test-openai.js
 */

async function testOpenAIProvider() {
  console.log('Testing OpenAI Provider...\n');

  // Create a mock diff for testing
  const mockDiff: GitDiff = {
    files: [
      {
        path: 'src/app.ts',
        status: 'modified',
        additions: 15,
        deletions: 5,
        changes: `@@ -10,7 +10,15 @@ export class App {
-  constructor() {
-    this.config = {};
+  constructor(config: Config) {
+    this.config = config;
+    this.validateConfig();
   }
+
+  private validateConfig(): void {
+    if (!this.config.apiKey) {
+      throw new Error('API key is required');
+    }
+  }
 }`,
      },
      {
        path: 'src/types.ts',
        status: 'added',
        additions: 8,
        deletions: 0,
        changes: `@@ -0,0 +1,8 @@
+export interface Config {
+  apiKey: string;
+  timeout?: number;
+  retries?: number;
+}
+
+export type Status = 'pending' | 'success' | 'error';
+`,
      },
    ],
    baseBranch: 'main',
    headBranch: 'feature/add-config',
    totalChanges: 23,
    additions: 23,
    deletions: 5,
  };

  // Test 1: Check if configured
  const provider = new OpenAIProvider();
  console.log('1. Configuration check:');
  console.log(`   Configured: ${provider.isConfigured()}`);
  
  if (!provider.isConfigured()) {
    console.log('\n❌ OpenAI provider is not configured.');
    console.log('   Set OPENAI_API_KEY environment variable to test.');
    console.log('   Example: OPENAI_API_KEY=sk-... node dist/llm/test-openai.js');
    process.exit(1);
  }

  // Test 2: Analyze diff
  console.log('\n2. Analyzing mock diff...');
  try {
    const analysis = await provider.analyze(mockDiff);
    
    console.log('\n✅ Analysis successful!\n');
    console.log('Summary:');
    console.log(`   ${analysis.summary}\n`);
    
    console.log('Insights:');
    analysis.insights.forEach((insight, i) => {
      console.log(`   ${i + 1}. ${insight}`);
    });
    
    console.log('\nKey Changes:');
    analysis.keyChanges.forEach((change, i) => {
      console.log(`   ${i + 1}. ${change}`);
    });

    console.log('\n✅ All tests passed!');
  } catch (error: any) {
    console.log('\n❌ Analysis failed:');
    console.log(`   ${error.message}`);
    process.exit(1);
  }
}

// Run tests
testOpenAIProvider().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});

// Made with Bob