
import { SmartTruncator } from './smart-truncator';
import { GitDiff, DiffFile } from '@pr-ready/shared';

/**
 * Test script for SmartTruncator
 * Run with: npx tsx packages/cli/src/llm/test-smart-truncator.ts
 */

// Helper to create a large diff file
function createLargeDiffFile(path: string, sizeInChars: number): DiffFile {
  const changes = 'a'.repeat(sizeInChars);
  return {
    path,
    status: 'modified',
    additions: 100,
    deletions: 50,
    changes,
  };
}

// Test 1: Small diff (no truncation needed)
function testSmallDiff() {
  console.log('\n=== Test 1: Small Diff (No Truncation) ===');
  
  const truncator = new SmartTruncator({ maxTokens: 10000 });
  
  const diff: GitDiff = {
    baseBranch: 'main',
    headBranch: 'feature/test',
    totalChanges: 150,
    additions: 100,
    deletions: 50,
    files: [
      {
        path: 'src/app.ts',
        status: 'modified',
        additions: 50,
        deletions: 25,
        changes: 'console.log("hello");\n'.repeat(10),
      },
      {
        path: 'src/utils.ts',
        status: 'modified',
        additions: 50,
        deletions: 25,
        changes: 'export function test() {}\n'.repeat(10),
      },
    ],
  };

  const result = truncator.truncate(diff);
  console.log(truncator.getSummary(result));
  console.log(`Files in result: ${result.diff.files.length}`);
}

// Test 2: Large diff with skip patterns
function testSkipPatterns() {
  console.log('\n=== Test 2: Skip Patterns ===');
  
  const truncator = new SmartTruncator({ maxTokens: 10000 });
  
  const diff: GitDiff = {
    baseBranch: 'main',
    headBranch: 'feature/test',
    totalChanges: 1000,
    additions: 600,
    deletions: 400,
    files: [
      createLargeDiffFile('src/app.ts', 1000),
      createLargeDiffFile('package-lock.json', 50000), // Should be skipped
      createLargeDiffFile('dist/bundle.js', 30000), // Should be skipped
      createLargeDiffFile('node_modules/lib.js', 20000), // Should be skipped
      createLargeDiffFile('src/utils.ts', 1000),
    ],
  };

  const result = truncator.truncate(diff);
  console.log(truncator.getSummary(result));
  console.log(`Files in result: ${result.diff.files.length}`);
  console.log(`Skipped files: ${result.skippedFiles.join(', ')}`);
}

// Test 3: Priority-based truncation
function testPrioritization() {
  console.log('\n=== Test 3: Priority-Based Truncation ===');
  
  const truncator = new SmartTruncator({ maxTokens: 5000 });
  
  const diff: GitDiff = {
    baseBranch: 'main',
    headBranch: 'feature/test',
    totalChanges: 10000,
    additions: 6000,
    deletions: 4000,
    files: [
      createLargeDiffFile('src/app.ts', 8000), // High priority
      createLargeDiffFile('lib/utils.ts', 8000), // High priority
      createLargeDiffFile('package.json', 2000), // Low priority (config)
      createLargeDiffFile('tsconfig.json', 2000), // Low priority (config)
      createLargeDiffFile('other/file.ts', 8000), // Medium priority
    ],
  };

  const result = truncator.truncate(diff);
  console.log(truncator.getSummary(result));
  console.log(`Files in result: ${result.diff.files.length}`);
  console.log('Files kept:', result.diff.files.map(f => f.path).join(', '));
  console.log('Files skipped:', result.skippedFiles.join(', '));
}

// Test 4: Very large diff (extreme truncation)
function testExtremeTruncation() {
  console.log('\n=== Test 4: Extreme Truncation ===');
  
  const truncator = new SmartTruncator({ maxTokens: 1000 });
  
  const diff: GitDiff = {
    baseBranch: 'main',
    headBranch: 'feature/massive-refactor',
    totalChanges: 100000,
    additions: 60000,
    deletions: 40000,
    files: Array.from({ length: 50 }, (_, i) => 
      createLargeDiffFile(`src/file${i}.ts`, 10000)
    ),
  };

  const result = truncator.truncate(diff);
  console.log(truncator.getSummary(result));
  console.log(`Original files: ${diff.files.length}`);
  console.log(`Files in result: ${result.diff.files.length}`);
  console.log(`Reduction: ${((1 - result.finalTokenCount / result.originalTokenCount) * 100).toFixed(1)}%`);
}

// Test 5: Token estimation accuracy
function testTokenEstimation() {
  console.log('\n=== Test 5: Token Estimation ===');
  
  const truncator = new SmartTruncator();
  
  const testCases = [
    { chars: 400, expectedTokens: 100 },
    { chars: 4000, expectedTokens: 1000 },
    { chars: 40000, expectedTokens: 10000 },
  ];

  testCases.forEach(({ chars, expectedTokens }) => {
    const diff: GitDiff = {
      baseBranch: 'main',
      headBranch: 'test',
      totalChanges: 100,
      additions: 50,
      deletions: 50,
      files: [createLargeDiffFile('test.ts', chars)],
    };

    const result = truncator.truncate(diff);
    const estimatedTokens = result.originalTokenCount;
    const error = Math.abs(estimatedTokens - expectedTokens);
    const errorPercent = (error / expectedTokens) * 100;
    
    console.log(`${chars} chars → ~${estimatedTokens} tokens (expected ~${expectedTokens}, error: ${errorPercent.toFixed(1)}%)`);
  });
}

// Run all tests
async function runTests() {
  console.log('🧪 Testing SmartTruncator\n');
  
  try {
    testSmallDiff();
    testSkipPatterns();
    testPrioritization();
    testExtremeTruncation();
    testTokenEstimation();
    
    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

runTests();
