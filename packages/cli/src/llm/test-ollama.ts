import { OllamaProvider } from './ollama-provider';
import { GitDiff } from '@pr-ready/shared';

/**
 * Test script for Ollama provider
 * 
 * Prerequisites:
 * 1. Install Ollama: https://ollama.ai
 * 2. Start Ollama: ollama serve
 * 3. Pull a model: ollama pull codellama
 * 
 * Run: npx tsx packages/cli/src/llm/test-ollama.ts
 */

async function testOllamaProvider() {
  console.log('Testing Ollama Provider...\n');

  // Test with default settings (localhost:11434, codellama model)
  const provider = new OllamaProvider();

  console.log('Configuration:');
  console.log('- Endpoint: http://localhost:11434');
  console.log('- Model: codellama');
  console.log('- Configured:', provider.isConfigured());
  console.log();

  // Create a sample diff
  const sampleDiff: GitDiff = {
    baseBranch: 'main',
    headBranch: 'feature/ollama-provider',
    totalChanges: 254,
    additions: 254,
    deletions: 0,
    files: [
      {
        path: 'packages/cli/src/llm/ollama-provider.ts',
        status: 'added',
        additions: 254,
        deletions: 0,
        changes: `+import { GitDiff, LLMProvider, LLMAnalysis } from '@pr-ready/shared';
+import { SmartTruncator } from './smart-truncator';
+
+export class OllamaProvider implements LLMProvider {
+  private endpoint: string;
+  private model: string;
+  private timeout: number = 60000;
+  private truncator: SmartTruncator;
+
+  constructor(endpoint?: string, model: string = 'codellama') {
+    this.endpoint = endpoint || process.env.OLLAMA_ENDPOINT || 'http://localhost:11434';
+    this.model = model;
+    this.truncator = new SmartTruncator({ maxTokens: 100000 });
+  }
+
+  isConfigured(): boolean {
+    return true;
+  }
+
+  async analyze(diff: GitDiff): Promise<LLMAnalysis> {
+    await this.checkOllamaRunning();
+    // ... implementation
+  }
+}`
      },
      {
        path: 'packages/cli/src/hybrid-analyzer.ts',
        status: 'modified',
        additions: 2,
        deletions: 3,
        changes: `+import { OllamaProvider } from './llm/ollama-provider';
 
-      case 'ollama':
-        console.warn('Ollama provider not yet implemented');
-        return null;
+      case 'ollama':
+        return new OllamaProvider(config.llm?.endpoint, config.llm?.model);`
      },
      {
        path: 'packages/shared/src/types.ts',
        status: 'modified',
        additions: 1,
        deletions: 0,
        changes: `   llm?: {
     provider?: 'openai' | 'anthropic' | 'ollama' | 'none';
     apiKey?: string;
     model?: string;
+    endpoint?: string; // For Ollama custom endpoint
   };`
      }
    ]
  };

  try {
    console.log('Analyzing sample diff...');
    console.log('This may take 30-60 seconds with local models...\n');
    
    const startTime = Date.now();
    const analysis = await provider.analyze(sampleDiff);
    const duration = Date.now() - startTime;

    console.log('✓ Analysis completed successfully!\n');
    console.log(`Duration: ${(duration / 1000).toFixed(1)}s\n`);
    console.log('Summary:');
    console.log(analysis.summary);
    console.log();
    console.log('Insights:');
    analysis.insights.forEach((insight, i) => {
      console.log(`${i + 1}. ${insight}`);
    });
    console.log();
    console.log('Key Changes:');
    analysis.keyChanges.forEach((change, i) => {
      console.log(`${i + 1}. ${change}`);
    });
    console.log();
    console.log('✓ All tests passed!');
  } catch (error) {
    console.error('✗ Test failed:');
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Test with custom endpoint (optional)
async function testCustomEndpoint() {
  console.log('\n\nTesting with custom endpoint...\n');

  const customProvider = new OllamaProvider('http://localhost:11434', 'deepseek-coder');

  console.log('Configuration:');
  console.log('- Endpoint: http://localhost:11434');
  console.log('- Model: deepseek-coder');
  console.log('- Configured:', customProvider.isConfigured());
  console.log();

  // Simple test to check if Ollama is running
  try {
    const sampleDiff: GitDiff = {
      baseBranch: 'main',
      headBranch: 'test',
      totalChanges: 10,
      additions: 10,
      deletions: 0,
      files: [
        {
          path: 'test.ts',
          status: 'added',
          additions: 10,
          deletions: 0,
          changes: '+console.log("Hello, Ollama!");'
        }
      ]
    };

    console.log('Testing connection with small diff...');
    await customProvider.analyze(sampleDiff);
    console.log('✓ Custom endpoint test passed!');
  } catch (error) {
    console.error('✗ Custom endpoint test failed:');
    console.error(error instanceof Error ? error.message : error);
  }
}

// Run tests
testOllamaProvider()
  .then(() => testCustomEndpoint())
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });

// Made with Bob