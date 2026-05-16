#!/usr/bin/env node

/**
 * Test script for Anthropic provider
 * Usage: ANTHROPIC_API_KEY=your_key npx tsx packages/cli/src/llm/test-anthropic.ts
 */

import { AnthropicProvider } from './anthropic-provider';
import { GitDiff } from '@pr-ready/shared';

async function testAnthropicProvider() {
  console.log('Testing Anthropic Provider...\n');

  // Check if API key is configured
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('❌ ANTHROPIC_API_KEY environment variable not set');
    console.log('Usage: ANTHROPIC_API_KEY=your_key npx tsx packages/cli/src/llm/test-anthropic.ts');
    process.exit(1);
  }

  // Create provider with default model (claude-3-sonnet)
  const provider = new AnthropicProvider(apiKey);
  
  console.log('✓ Provider created');
  console.log(`✓ Configured: ${provider.isConfigured()}`);
  console.log('');

  // Create a sample diff
  const sampleDiff: GitDiff = {
    baseBranch: 'main',
    headBranch: 'feature/anthropic-provider',
    totalChanges: 181,
    additions: 181,
    deletions: 0,
    files: [
      {
        path: 'packages/cli/src/llm/anthropic-provider.ts',
        status: 'added',
        additions: 181,
        deletions: 0,
        changes: `+import Anthropic from '@anthropic-ai/sdk';
+import { GitDiff, LLMProvider, LLMAnalysis } from '@pr-ready/shared';
+import { SmartTruncator } from './smart-truncator';
+
+export class AnthropicProvider implements LLMProvider {
+  private client: Anthropic | null = null;
+  private model: string;
+  private apiKey: string | undefined;
+  private timeout: number = 30000; // 30 seconds
+  private truncator: SmartTruncator;
+
+  constructor(apiKey?: string, model: string = 'claude-3-sonnet-20240229') {
+    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY;
+    this.model = model;
+    this.truncator = new SmartTruncator({ maxTokens: 100000 });
+
+    if (this.apiKey) {
+      this.client = new Anthropic({
+        apiKey: this.apiKey,
+        timeout: this.timeout,
+      });
+    }
+  }
+
+  isConfigured(): boolean {
+    return !!this.apiKey && !!this.client;
+  }
+
+  async analyze(diff: GitDiff): Promise<LLMAnalysis> {
+    // Implementation details...
+  }
+}`
      }
    ]
  };

  try {
    console.log('Analyzing sample diff...');
    const analysis = await provider.analyze(sampleDiff);
    
    console.log('\n✓ Analysis completed successfully!\n');
    console.log('Summary:', analysis.summary);
    console.log('\nInsights:');
    analysis.insights.forEach((insight, i) => {
      console.log(`  ${i + 1}. ${insight}`);
    });
    console.log('\nKey Changes:');
    analysis.keyChanges.forEach((change, i) => {
      console.log(`  ${i + 1}. ${change}`);
    });
    
    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('\n❌ Test failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run the test
testAnthropicProvider().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});

// Made with Bob