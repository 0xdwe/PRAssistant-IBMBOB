**User:**

<task>
Fix the merge conflicts and get the VSCode extension working. Please:

1. **Resolve all merge conflicts** in these files:
   - [`packages/cli/src/cli.ts`](packages/cli/src/cli.ts)
   - [`packages/cli/src/pr-packet-generator.ts`](packages/cli/src/pr-packet-generator.ts)
   - [`packages/cli/src/rule-based-analyzer.ts`](packages/cli/src/rule-based-analyzer.ts)
   - [`packages/cli/src/__tests__/rule-based-analyzer.test.ts`](packages/cli/src/__tests__/rule-based-analyzer.test.ts)

2. **Resolution strategy**:
   - Keep the most complete and recent implementation
   - Remove all conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
   - Ensure the code compiles without errors
   - Preserve all functionality from both versions where possible

3. **After resolving conflicts**:
   - Build the CLI package: Run `npm run build` in packages/cli
   - Build the extension: Run `npm run compile` in packages/extension
   - Verify both compile successfully

4. **Test the extension**:
   - Ensure it can be launched with F5
   - Verify the commands are registered
   - Check that it can analyze a Git repository

Focus on getting a working version first - we can refine the implementation later. The priority is to resolve conflicts and get the extension functional.
</task>
<environment_details>

# VSCode Visible Files

packages/extension/tsconfig.json

# VSCode Open Tabs

issues/008-openai-llm-provider.md,issues/009-hybrid-analyzer.md,issues/010-smart-truncation.md,issues/011-cache-layer.md,issues/012-test-execution.md,issues/013-reviewer-checklist.md,issues/014-monorepo-detection.md,issues/015-anthropic-provider.md,issues/016-ollama-provider.md,issues/017-vscode-extension-scaffold.md,issues/018-vscode-sidebar-panel.md,issues/019-cli-help-docs.md,issues/020-testing-infrastructure.md,IMPLEMENTATION_PLAN.md,packages/shared/package.json,packages/shared/tsconfig.json,packages/shared/src/index.ts,packages/cli/tsconfig.json,packages/cli/src/output-handler.ts,packages/cli/src/index.ts

# Current Time

Current time in ISO 8601 UTC format: 2026-05-16T06:05:23.704Z
User time zone: Asia/Taipei, UTC+8:00

# Current Cost

$0.00

# Review Exclusions

The following file patterns are excluded from code reviews:

- .vscode/\*\*

# Current Mode

<slug>code</slug>
<name>💻 Code</name>

# Current Workspace Directory (/Users/jamesli/Document/VSC/Playground/PRAssistant-IBMBOB) Files

.gitignore
.lintstagedrc.json
.pr-ready.json
.prettierrc.json
CONTRIBUTING.md
IMPLEMENTATION_PLAN.md
jest.config.js
KNOWN_ISSUES.md
LICENSE
LLM_IMPLEMENTATION_TEST_RESULTS.md
package.json
PRD.md
README.md
test-llm.js
TESTING_STRATEGY.md
VERIFICATION-009.md
VERIFICATION-010.md
VERIFICATION-011.md
VERIFICATION-012.md
VERIFICATION-013.md
VERIFICATION-014.md
VERIFICATION-015.md
VERIFICATION-016.md
VERIFICATION-017.md
VERIFICATION-018.md
VERIFICATION-019.md
VERIFICATION-020.md
VERIFICATION.md
VSCODE_EXTENSION_SETUP.md
.github/
.husky/
examples/
examples/basic-config.json
examples/custom-test-config.json
examples/monorepo-config.json
examples/README.md
examples/with-llm-config.json
issues/
issues/001-cli-scaffold-git-diff.md
issues/002-rule-based-file-categorization.md
issues/003-rule-based-test-detection.md
issues/004-rule-based-risk-detection.md
issues/005-basic-pr-packet-markdown.md
issues/006-clipboard-output.md
issues/007-config-system.md
issues/008-openai-llm-provider.md
issues/009-hybrid-analyzer.md
issues/010-smart-truncation.md
issues/011-cache-layer.md
issues/012-test-execution.md
issues/013-reviewer-checklist.md
issues/014-monorepo-detection.md
issues/015-anthropic-provider.md
issues/016-ollama-provider.md
issues/017-vscode-extension-scaffold.md
issues/018-vscode-sidebar-panel.md
issues/019-cli-help-docs.md
issues/020-testing-infrastructure.md
packages/
packages/cli/
packages/cli/jest.config.js
packages/cli/package.json
packages/cli/tsconfig.json
packages/cli/src/
packages/cli/src/cache-manager.ts
packages/cli/src/cli.ts
packages/cli/src/config-manager.ts
packages/cli/src/git-diff-extractor.ts
packages/cli/src/hybrid-analyzer.ts
packages/cli/src/index.ts
packages/cli/src/monorepo-detector.ts
packages/cli/src/openai-provider.ts
packages/cli/src/output-handler.ts
packages/cli/src/pr-packet-generator.ts
packages/cli/src/rule-based-analyzer.ts
packages/cli/src/test-executor.ts
packages/cli/src/**tests**/
packages/cli/src/**tests**/cache-manager.test.ts
packages/cli/src/**tests**/config-manager.test.ts
packages/cli/src/**tests**/git-diff-extractor.test.ts
packages/cli/src/**tests**/rule-based-analyzer.test.ts
packages/cli/src/**tests**/test-executor.test.ts
packages/cli/src/**tests**/integration/
packages/cli/src/**tests**/integration/e2e.test.ts
packages/cli/src/llm/
packages/cli/src/llm/anthropic-provider.ts
packages/cli/src/llm/ollama-provider.ts
packages/cli/src/llm/openai-provider.ts
packages/cli/src/llm/smart-truncator.ts
packages/cli/src/llm/test-anthropic.ts
packages/cli/src/llm/test-ollama.ts
packages/cli/src/llm/test-openai.ts
packages/cli/src/llm/test-smart-truncator.ts
packages/cli/src/llm/**tests**/
packages/cli/src/llm/**tests**/openai-provider.test.ts
packages/cli/src/llm/**tests**/smart-truncator.test.ts
packages/extension/
packages/extension/.vscodeignore
packages/extension/package.json
packages/extension/tsconfig.json
packages/extension/resources/
packages/extension/resources/pr-ready-icon.svg
packages/extension/src/
packages/extension/src/extension.ts
packages/extension/src/webview/
packages/extension/src/webview/PRPanelProvider.ts
packages/extension/src/webview/script.js
packages/extension/src/webview/style.css
packages/shared/
packages/shared/jest.config.js
packages/shared/package.json
packages/shared/tsconfig.json
packages/shared/src/
packages/shared/src/index.ts
packages/shared/src/types.ts
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

I'll help you resolve the merge conflicts and get the VSCode extension working. Let me start by examining the files with conflicts.

<read_file>
<args>
<file>
<path>packages/cli/src/cli.ts</path>
</file>
<file>
<path>packages/cli/src/pr-packet-generator.ts</path>
</file>
<file>
<path>packages/cli/src/rule-based-analyzer.ts</path>
</file>
<file>
<path>packages/cli/src/**tests**/rule-based-analyzer.test.ts</path>
</file>
</args>
</read_file>

---

**User:**

[read_file for 4 files] Result:
<files>
<file><path>packages/cli/src/cli.ts</path>
<content lines="1-220">
1 | #!/usr/bin/env node
2 |
3 | import { Command } from 'commander';
4 | import chalk from 'chalk';
5 | import { GitDiffExtractor } from './git-diff-extractor';
6 | import { HybridAnalyzer } from './hybrid-analyzer';
7 | import { PRPacketGenerator } from './pr-packet-generator';
8 | import { OutputHandler } from './output-handler';
9 | import { ConfigManager } from './config-manager';
10 | <<<<<<< HEAD
11 | import { OpenAIProvider } from './openai-provider';
12 | import { LLMConfig } from '@pr-ready/shared';
13 | =======
14 | import { TestExecutor } from './test-executor';
15 | import { MonorepoDetector } from './monorepo-detector';
16 | import { TestResult, MonorepoDetection } from '@pr-ready/shared';
17 | >>>>>>> ca3a4f3 (feat: implement monorepo detection (issue 014))
18 |
19 | const program = new Command();
20 |
21 | program
22 | .name('pr-ready')
23 | .description('Automated PR readiness analysis tool - Generate comprehensive PR packets from git diffs')
24 | .version('0.1.0')
25 | .option('--base <branch>', 'Base branch to compare against (default: auto-detect from upstream/origin)')
26 | .option('--head <branch>', 'Head branch with changes (default: current branch)')
27 | .option('--llm <provider>', 'LLM provider for enhanced analysis: openai|anthropic|ollama|none (default: none)')
28 | .option('--test', 'Run tests before generating PR packet and include test results')
29 | .option('--no-cache', 'Skip cache lookup and force fresh analysis')
30 | .option('--config <path>', 'Path to custom config file (.pr-ready.json or package.json)')
31 | .option('--output <path>', 'Custom output file path (default: .pr-ready.md)')
32 | .option('--no-clipboard', 'Skip automatic clipboard copy of the generated PR packet')
33 | .addHelpText('after', ` 34 | Examples:
 35 |   $ pr-ready                              # Analyze current branch
 36 |   $ pr-ready --base main --head feature   # Compare specific branches
 37 |   $ pr-ready --test                       # Run tests and include results
 38 |   $ pr-ready --llm openai                 # Use OpenAI for enhanced analysis
 39 |   $ pr-ready --output my-pr.md            # Custom output file
 40 |   $ pr-ready --no-clipboard               # Don't copy to clipboard
 41 | 
 42 | Configuration:
 43 |   Create .pr-ready.json or add "prReady" section to package.json
 44 |   See examples/ directory for sample configurations
 45 | 
 46 | Documentation:
 47 |   Full documentation: https://github.com/yourusername/pr-ready
 48 |   Issues & support: https://github.com/yourusername/pr-ready/issues
 49 |`)
50 | .action(async (options) => {
51 | try {
52 | console.log(chalk.blue('🔍 Analyzing PR readiness...\n'));
53 |
54 | // Load configuration
55 | const configManager = new ConfigManager();
56 | let config = await configManager.loadConfig();
57 |  
 58 | // Apply CLI flags (they override config)
59 | const cliConfig: any = {};
60 | if (options.llm) cliConfig.llm = { provider: options.llm };
61 | if (options.output) cliConfig.output = { ...config.output, file: options.output };
62 | if (options.clipboard === false) cliConfig.output = { ...config.output, clipboard: false };
63 |  
 64 | config = configManager.applyCliFlags(config, cliConfig);
65 | configManager.validateConfig(config);
66 |
67 | // Extract git diff
68 | console.log(chalk.gray('Extracting git diff...'));
69 | const diffExtractor = new GitDiffExtractor();
70 | const diff = await diffExtractor.extractDiff({
71 | baseBranch: options.base,
72 | headBranch: options.head,
73 | });
74 |
75 | console.log(chalk.green(`✓ Found ${diff.files.length} changed file(s)\n`));
76 |
77 | // Analyze with hybrid analyzer (rule-based + optional LLM)
78 | console.log(chalk.gray('Analyzing changes...'));
79 | const useCache = options.cache !== false; // --no-cache sets cache to false
80 | const analyzer = new HybridAnalyzer(config, useCache);
81 | const analysis = await analyzer.analyze(diff);
82 |
83 | console.log(chalk.green(`✓ Categorized into ${analysis.categories.length} categories`));
84 | console.log(chalk.green(`✓ Detected ${analysis.testDetection.testFiles.length} test file(s)`));
85 | console.log(chalk.green(`✓ Found ${analysis.risks.length} risk flag(s)`));
86 |  
 87 | if (analysis.llmAnalysis) {
88 | console.log(chalk.green(`✓ LLM analysis included\n`));
89 | } else if (analysis.llmError) {
90 | console.log(chalk.yellow(`⚠️  LLM analysis failed: ${analysis.llmError}\n`));
91 | } else {
92 | console.log(chalk.gray('(LLM analysis not enabled)\n'));
93 | }
94 |
95 | <<<<<<< HEAD
96 | // LLM analysis if enabled
97 | let llmAnalysis = null;
98 | if (config.llm?.provider && config.llm.provider !== 'none') {
99 | try {
100 | console.log(chalk.gray(`Analyzing with ${config.llm.provider}...`));
101 |  
102 | const llmConfig: LLMConfig = {
103 | provider: config.llm.provider,
104 | baseURL: config.llm.baseURL || 'https://rqhse4n.9router.com/v1',
105 | apiKey: config.llm.apiKey,
106 | model: config.llm.model || 'gpt-4',
107 | timeout: 30000,
108 | };
109 |
110 | if (config.llm.provider === 'openai') {
111 | const provider = new OpenAIProvider(llmConfig);
112 | llmAnalysis = await provider.analyze(diff);
113 | console.log(chalk.green('✓ LLM analysis complete\n'));
114 | } else {
115 | console.log(chalk.yellow(`⚠️  Provider '${config.llm.provider}' not yet implemented\n`));
116 | }
117 | } catch (error) {
118 | if (error instanceof Error) {
119 | console.log(chalk.yellow(`⚠️  LLM analysis failed: ${error.message}\n`));
120 | } else {
121 | console.log(chalk.yellow('⚠️ LLM analysis failed with unknown error\n'));
122 | }
123 | }
124 | =======
125 | // Detect monorepo structure
126 | console.log(chalk.gray('Detecting monorepo structure...'));
127 | const monorepoDetector = new MonorepoDetector(process.cwd(), config);
128 | const changedFilePaths = diff.files.map(f => f.path);
129 | const monorepoDetection = await monorepoDetector.detectAffectedPackages(changedFilePaths);
130 |  
131 | if (monorepoDetection.isMonorepo && monorepoDetection.affectedPackages.length > 0) {
132 | console.log(chalk.green(`✓ Detected ${monorepoDetection.type} monorepo`));
133 | console.log(chalk.green(`✓ Affected packages: ${monorepoDetection.affectedPackages.join(', ')}\n`));
134 | } else if (monorepoDetection.isMonorepo) {
135 | console.log(chalk.green(`✓ Detected ${monorepoDetection.type} monorepo (no packages affected)\n`));
136 | } else {
137 | console.log(chalk.gray('✓ Not a monorepo\n'));
138 | }
139 |
140 | // Run tests if --test flag is provided
141 | let testResults: TestResult | undefined;
142 | if (options.test) {
143 | console.log(chalk.gray('Running tests...'));
144 | try {
145 | const testExecutor = new TestExecutor();
146 | const testCommand = config.test?.command || 'npm test';
147 | const testTimeout = config.test?.timeout || 300000;
148 |  
149 | testResults = await testExecutor.executeTests(testCommand, testTimeout);
150 |  
151 | if (testResults.passed) {
152 | console.log(chalk.green(`✓ All tests passed (${testResults.passedTests}/${testResults.totalTests})`));
153 | } else {
154 | console.log(chalk.red(`✗ Tests failed (${testResults.failedTests}/${testResults.totalTests} failed)`));
155 | }
156 | } catch (error) {
157 | console.error(chalk.red(`✗ Test execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
158 | if (!options.force) {
159 | process.exit(1);
160 | }
161 | }
162 | console.log('');
163 | >>>>>>> ca3a4f3 (feat: implement monorepo detection (issue 014))
164 | }
165 |
166 | // Generate PR packet
167 | console.log(chalk.gray('Generating PR packet...'));
168 | const generator = new PRPacketGenerator();
169 | <<<<<<< HEAD
170 | const packet = generator.generate(diff, analysis, llmAnalysis);
171 | =======
172 | const packet = generator.generate(diff, analysis, testResults, monorepoDetection);
173 | <<<<<<< HEAD
174 | >>>>>>> ca3a4f3 (feat: implement monorepo detection (issue 014))
175 | const markdown = generator.generateMarkdown(packet);
176 | =======
177 | const markdown = generator.generateMarkdown(packet, analysis);
178 | >>>>>>> 486204d (feat: implement PR Readiness Assistant (all 20 issues))
179 |
180 | console.log(chalk.green('✓ PR packet generated\n'));
181 |
182 | // Output results
183 | const outputHandler = new OutputHandler();
184 | const outputOptions = {
185 | file: config.output?.file || '.pr-ready.md',
186 | clipboard: config.output?.clipboard ?? true,
187 | };
188 | await outputHandler.output(markdown, outputOptions);
189 |
190 | console.log(chalk.green('\n✨ Done! Your PR is ready for review.'));
191 |
192 | // Show warnings if any
193 | if (analysis.testDetection.missingTests) {
194 | console.log(chalk.yellow('\n⚠️ Warning: No test files modified despite source code changes'));
195 | }
196 |
197 | const highRisks = analysis.risks.filter(r => r.level === 'high');
198 | if (highRisks.length > 0) {
199 | console.log(chalk.yellow(`\n⚠️  Warning: ${highRisks.length} high-risk change(s) detected`));
200 | }
201 |
202 | // Exit with error if tests failed
203 | if (testResults && !testResults.passed) {
204 | console.log(chalk.red('\n❌ Tests failed. Please fix failing tests before submitting PR.'));
205 | process.exit(1);
206 | }
207 |
208 | } catch (error) {
209 | if (error instanceof Error) {
210 | console.error(chalk.red(`\n❌ Error: ${error.message}`));
211 | } else {
212 | console.error(chalk.red('\n❌ An unexpected error occurred'));
213 | }
214 | process.exit(1);
215 | }
216 | });
217 |
218 | program.parse();
219 |
220 | // Made with Bob
</content>
</file>
<file><path>packages/cli/src/pr-packet-generator.ts</path>
<content lines="1-389">
1 | <<<<<<< HEAD
2 | <<<<<<< HEAD
3 | import { RuleAnalysis, PRPacket, GitDiff, LLMAnalysis } from '@pr-ready/shared';
4 |
5 | export class PRPacketGenerator {
6 | generate(diff: GitDiff, analysis: RuleAnalysis, llmAnalysis?: LLMAnalysis | null): PRPacket {
7 | const summary = this.generateSummary(diff, analysis, llmAnalysis);
8 | =======
9 | import { RuleAnalysis, PRPacket, GitDiff, TestResult, MonorepoDetection } from '@pr-ready/shared';
10 | =======
11 | import { RuleAnalysis, HybridAnalysis, PRPacket, GitDiff, TestResult, MonorepoDetection } from '@pr-ready/shared';
12 | >>>>>>> 486204d (feat: implement PR Readiness Assistant (all 20 issues))
13 |
14 | export class PRPacketGenerator {
15 | generate(
16 | diff: GitDiff,
17 | analysis: RuleAnalysis | HybridAnalysis,
18 | testResults?: TestResult,
19 | monorepo?: MonorepoDetection
20 | ): PRPacket {
21 | const summary = this.generateSummary(diff, analysis, monorepo);
22 | <<<<<<< HEAD
23 | >>>>>>> ca3a4f3 (feat: implement monorepo detection (issue 014))
24 | const checklist = this.generateChecklist(analysis);
25 | =======
26 | const hybridAnalysis = 'llmAnalysis' in analysis ? analysis : undefined;
27 | const checklist = this.generateChecklist(analysis, hybridAnalysis);
28 | >>>>>>> 486204d (feat: implement PR Readiness Assistant (all 20 issues))
29 |
30 | return {
31 | summary,
32 | filesChanged: analysis.categories,
33 | testStatus: analysis.testDetection,
34 | testResults,
35 | risks: analysis.risks,
36 | checklist,
37 | <<<<<<< HEAD
38 | llmAnalysis: llmAnalysis || undefined,
39 | =======
40 | monorepo,
41 | >>>>>>> ca3a4f3 (feat: implement monorepo detection (issue 014))
42 | metadata: {
43 | baseBranch: diff.baseBranch,
44 | headBranch: diff.headBranch,
45 | totalFiles: diff.files.length,
46 | totalChanges: diff.totalChanges,
47 | generatedAt: new Date().toISOString(),
48 | },
49 | };
50 | }
51 |
52 | generateMarkdown(packet: PRPacket, hybridAnalysis?: HybridAnalysis): string {
53 | const sections: string[] = [];
54 |
55 | // Header
56 | sections.push('# PR Readiness Report\n');
57 |
58 | // LLM Summary (if available)
59 | if (hybridAnalysis?.llmAnalysis) {
60 | sections.push('## AI Summary\n');
61 | sections.push(hybridAnalysis.llmAnalysis.summary);
62 | sections.push('');
63 |
64 | // Key Insights
65 | if (hybridAnalysis.llmAnalysis.insights.length > 0) {
66 | sections.push('### Key Insights\n');
67 | for (const insight of hybridAnalysis.llmAnalysis.insights) {
68 | sections.push(`- ${insight}`);
69 | }
70 | sections.push('');
71 | }
72 |
73 | // Key Changes to Review
74 | if (hybridAnalysis.llmAnalysis.keyChanges.length > 0) {
75 | sections.push('### Key Changes to Review\n');
76 | for (const change of hybridAnalysis.llmAnalysis.keyChanges) {
77 | sections.push(`- ${change}`);
78 | }
79 | sections.push('');
80 | }
81 | }
82 |
83 | // Rule-based Summary
84 | sections.push('## Summary\n');
85 | sections.push(packet.summary);
86 | sections.push('');
87 |
88 | // LLM Analysis (if available)
89 | if (packet.llmAnalysis) {
90 | sections.push('## AI Analysis\n');
91 | sections.push(packet.llmAnalysis.summary);
92 | sections.push('');
93 |  
 94 | if (packet.llmAnalysis.insights.length > 0) {
95 | sections.push('### Key Insights\n');
96 | for (const insight of packet.llmAnalysis.insights) {
97 | sections.push(`- ${insight}`);
98 | }
99 | sections.push('');
100 | }
101 |  
102 | if (packet.llmAnalysis.suggestions && packet.llmAnalysis.suggestions.length > 0) {
103 | sections.push('### Suggestions\n');
104 | for (const suggestion of packet.llmAnalysis.suggestions) {
105 | sections.push(`- ${suggestion}`);
106 | }
107 | sections.push('');
108 | }
109 | }
110 |
111 | // Metadata
112 | sections.push('## Change Details\n');
113 | sections.push(`- **Base Branch**: \`${packet.metadata.baseBranch}\``);
114 |     sections.push(`- **Head Branch**: \`${packet.metadata.headBranch}\``);
115 |     sections.push(`- **Files Changed**: ${packet.metadata.totalFiles}`);
116 |     sections.push(`- **Total Changes**: +${packet.metadata.totalChanges} lines`);
117 |     sections.push(`- **Generated**: ${new Date(packet.metadata.generatedAt).toLocaleString()}`);
118 |     
119 |     // Monorepo info
120 |     if (packet.monorepo?.isMonorepo && packet.monorepo.affectedPackages.length > 0) {
121 |       sections.push(`- **Affected Packages**: ${packet.monorepo.affectedPackages.join(', ')}`);
122 |     }
123 |     sections.push('');
124 | 
125 |     // Files by Category
126 |     sections.push('## Files Changed\n');
127 |     if (packet.filesChanged.length === 0) {
128 |       sections.push('_No files changed_\n');
129 |     } else {
130 |       for (const category of packet.filesChanged) {
131 |         sections.push(`### ${this.formatCategoryName(category.name)} (${category.count})\n`);
132 |         for (const file of category.files) {
133 |           sections.push(`- \`${file}\``);
134 |         }
135 |         sections.push('');
136 |       }
137 |     }
138 | 
139 |     // Test Status
140 |     sections.push('## Test Coverage\n');
141 |     if (packet.testStatus.hasTests) {
142 |       sections.push(`✅ **${packet.testStatus.testFiles.length} test file(s) modified**\n`);
143 |       for (const testFile of packet.testStatus.testFiles) {
144 |         sections.push(`- \`${testFile}\``);
145 | }
146 | sections.push('');
147 | } else if (packet.testStatus.missingTests) {
148 | sections.push('⚠️ **Warning: Source code changed but no test files modified**\n');
149 | sections.push('Please ensure appropriate tests are added or updated.\n');
150 | } else {
151 | sections.push('ℹ️ No source code changes detected (config/docs only)\n');
152 | }
153 |
154 | // Test Execution Results
155 | if (packet.testResults) {
156 | sections.push('## Test Execution Results\n');
157 | if (packet.testResults.passed) {
158 | sections.push(`✅ **All tests passed**\n`);
159 |         sections.push(`- Total: ${packet.testResults.totalTests} test(s)`);
160 |         sections.push(`- Passed: ${packet.testResults.passedTests}`);
161 |         if (packet.testResults.skippedTests) {
162 |           sections.push(`- Skipped: ${packet.testResults.skippedTests}`);
163 |         }
164 |         sections.push(`- Duration: ${(packet.testResults.duration / 1000).toFixed(2)}s`);
165 |       } else {
166 |         sections.push(`❌ **Tests failed**\n`);
167 |         sections.push(`- Total: ${packet.testResults.totalTests} test(s)`);
168 |         sections.push(`- Passed: ${packet.testResults.passedTests}`);
169 |         sections.push(`- Failed: ${packet.testResults.failedTests}`);
170 |         if (packet.testResults.skippedTests) {
171 |           sections.push(`- Skipped: ${packet.testResults.skippedTests}`);
172 |         }
173 |         sections.push(`- Duration: ${(packet.testResults.duration / 1000).toFixed(2)}s`);
174 |         if (packet.testResults.error) {
175 |           sections.push(`\n**Error**: ${packet.testResults.error}`);
176 |         }
177 |       }
178 |       sections.push('');
179 |     }
180 | 
181 |     // Risk Flags
182 |     sections.push('## Risk Assessment\n');
183 |     if (packet.risks.length === 0) {
184 |       sections.push('✅ No high-risk changes detected\n');
185 |     } else {
186 |       const highRisks = packet.risks.filter(r => r.level === 'high');
187 |       const mediumRisks = packet.risks.filter(r => r.level === 'medium');
188 |       const lowRisks = packet.risks.filter(r => r.level === 'low');
189 | 
190 |       if (highRisks.length > 0) {
191 |         sections.push('### 🔴 High Risk\n');
192 |         for (const risk of highRisks) {
193 |           sections.push(`- **\`${risk.file}\`**: ${risk.reason}`);
194 |         }
195 |         sections.push('');
196 |       }
197 | 
198 |       if (mediumRisks.length > 0) {
199 |         sections.push('### 🟡 Medium Risk\n');
200 |         for (const risk of mediumRisks) {
201 |           sections.push(`- **\`${risk.file}\`**: ${risk.reason}`);
202 |         }
203 |         sections.push('');
204 |       }
205 | 
206 |       if (lowRisks.length > 0) {
207 |         sections.push('### 🟢 Low Risk\n');
208 |         for (const risk of lowRisks) {
209 |           sections.push(`- **\`${risk.file}\`**: ${risk.reason}`);
210 |         }
211 |         sections.push('');
212 |       }
213 |     }
214 | 
215 |     // Reviewer Checklist
216 |     sections.push('## Reviewer Checklist\n');
217 |     for (const item of packet.checklist) {
218 |       sections.push(`- [ ] ${item}`);
219 |     }
220 |     sections.push('');
221 | 
222 |     return sections.join('\n');
223 |   }
224 | 
225 | <<<<<<< HEAD
226 | <<<<<<< HEAD
227 |   private generateSummary(diff: GitDiff, analysis: RuleAnalysis, llmAnalysis?: LLMAnalysis | null): string {
228 | =======
229 |   private generateSummary(diff: GitDiff, analysis: RuleAnalysis, monorepo?: MonorepoDetection): string {
230 | >>>>>>> ca3a4f3 (feat: implement monorepo detection (issue 014))
231 | =======
232 |   private generateSummary(diff: GitDiff, analysis: RuleAnalysis | HybridAnalysis, monorepo?: MonorepoDetection): string {
233 | >>>>>>> 486204d (feat: implement PR Readiness Assistant (all 20 issues))
234 |     const parts: string[] = [];
235 | 
236 |     // Use LLM summary if available, otherwise use rule-based
237 |     if (llmAnalysis?.summary) {
238 |       return llmAnalysis.summary;
239 |     }
240 | 
241 |     // Basic stats
242 |     parts.push(`This PR modifies **${diff.files.length} file(s)** across **${analysis.categories.length} categor${analysis.categories.length === 1 ? 'y' : 'ies'}**.`);
243 | 
244 |     // Monorepo info
245 |     if (monorepo?.isMonorepo && monorepo.affectedPackages.length > 0) {
246 |       parts.push(`Affects **${monorepo.affectedPackages.length} package(s)**: ${monorepo.affectedPackages.join(', ')}.`);
247 |     }
248 | 
249 |     // Category breakdown
250 |     const categoryNames = analysis.categories.map(c => `${c.name} (${c.count})`).join(', ');
251 |     parts.push(`Changes include: ${categoryNames}.`);
252 | 
253 |     // Test status
254 |     if (analysis.testDetection.hasTests) {
255 |       parts.push(`Tests have been updated (${analysis.testDetection.testFiles.length} test file(s)).`);
256 |     } else if (analysis.testDetection.missingTests) {
257 |       parts.push('⚠️ No test changes detected despite source code modifications.');
258 |     }
259 | 
260 |     // Risk summary
261 |     const highRiskCount = analysis.risks.filter(r => r.level === 'high').length;
262 |     if (highRiskCount > 0) {
263 |       parts.push(`⚠️ Contains ${highRiskCount} high-risk change(s) requiring careful review.`);
264 |     }
265 | 
266 |     return parts.join(' ');
267 |   }
268 | 
269 |   private generateChecklist(analysis: RuleAnalysis | HybridAnalysis, hybridAnalysis?: HybridAnalysis): string[] {
270 |     const allItems: Array<{ item: string; priority: number }> = [];
271 | 
272 |     // Template items with priority (lower number = higher priority)
273 |     // Priority 1: Critical items (tests, breaking changes)
274 |     if (analysis.testDetection.hasTests) {
275 |       allItems.push({ item: 'All tests pass locally', priority: 1 });
276 |     } else if (analysis.testDetection.sourceFilesChanged) {
277 |       allItems.push({ item: 'Tests added/updated for new functionality', priority: 1 });
278 |     }
279 |     
280 |     allItems.push({ item: 'No breaking changes (or documented in PR description)', priority: 1 });
281 | 
282 |     // Priority 2: High-risk specific items
283 |     const hasDbChanges = analysis.risks.some(r => r.pattern === 'migrations/schema');
284 |     if (hasDbChanges) {
285 |       allItems.push({ item: 'Database migrations are reversible', priority: 2 });
286 |       allItems.push({ item: 'Migration tested on staging environment', priority: 2 });
287 |     }
288 | 
289 |     const hasAuthChanges = analysis.risks.some(r => r.pattern === 'auth/security');
290 |     if (hasAuthChanges) {
291 |       allItems.push({ item: 'Security implications reviewed', priority: 2 });
292 |       allItems.push({ item: 'Authentication flows tested', priority: 2 });
293 |     }
294 | 
295 |     const hasDependencyChanges = analysis.risks.some(r => r.pattern === 'dependencies');
296 |     if (hasDependencyChanges) {
297 |       allItems.push({ item: 'Dependency changes reviewed for security vulnerabilities', priority: 2 });
298 |       allItems.push({ item: 'Package lock file updated', priority: 2 });
299 |     }
300 | 
301 |     // Priority 3: Configuration and documentation
302 |     const hasConfigChanges = analysis.categories.some(c => c.name === 'config');
303 |     if (hasConfigChanges) {
304 |       allItems.push({ item: 'Configuration changes documented', priority: 3 });
305 |       allItems.push({ item: 'Environment variables updated if needed', priority: 3 });
306 |     }
307 | 
308 |     allItems.push({ item: 'Changes are well-documented', priority: 3 });
309 | 
310 |     // Priority 4: Code quality
311 |     if (analysis.testDetection.hasTests) {
312 |       allItems.push({ item: 'New tests cover edge cases', priority: 4 });
313 |     }
314 |     allItems.push({ item: 'Code follows project style guidelines', priority: 4 });
315 |     allItems.push({ item: 'No unnecessary console.log or debug code', priority: 4 });
316 | 
317 |     // Add LLM-generated context-specific items (Priority 2 - treat as important)
318 |     if (hybridAnalysis?.llmAnalysis?.checklistItems) {
319 |       for (const llmItem of hybridAnalysis.llmAnalysis.checklistItems) {
320 |         // Check for duplicates (case-insensitive, fuzzy match)
321 |         const isDuplicate = allItems.some(existing =>
322 |           this.isSimilarChecklistItem(existing.item, llmItem)
323 |         );
324 |         
325 |         if (!isDuplicate) {
326 |           allItems.push({ item: llmItem, priority: 2 });
327 |         }
328 |       }
329 |     }
330 | 
331 |     // Sort by priority (ascending), then alphabetically within same priority
332 |     allItems.sort((a, b) => {
333 |       if (a.priority !== b.priority) {
334 |         return a.priority - b.priority;
335 |       }
336 |       return a.item.localeCompare(b.item);
337 |     });
338 | 
339 |     // Return just the items (without priority)
340 |     return allItems.map(item => item.item);
341 |   }
342 | 
343 |   /**
344 |    * Check if two checklist items are similar enough to be considered duplicates
345 |    */
346 |   private isSimilarChecklistItem(item1: string, item2: string): boolean {
347 |     const normalize = (str: string) => str.toLowerCase().trim().replace(/[^\w\s]/g, '');
348 |     const normalized1 = normalize(item1);
349 |     const normalized2 = normalize(item2);
350 |     
351 |     // Exact match after normalization
352 |     if (normalized1 === normalized2) {
353 |       return true;
354 |     }
355 |     
356 |     // Check if one contains the other (for variations like "Tests pass" vs "All tests pass")
357 |     if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
358 |       return true;
359 |     }
360 |     
361 |     // Check for key phrase overlap (at least 60% of words in common)
362 |     const words1 = normalized1.split(/\s+/);
363 |     const words2 = normalized2.split(/\s+/);
364 |     const commonWords = words1.filter(w => words2.includes(w));
365 |     const overlapRatio = commonWords.length / Math.min(words1.length, words2.length);
366 |     
367 |     return overlapRatio >= 0.6;
368 |   }
369 | 
370 |   private formatCategoryName(name: string): string {
371 |     // Capitalize first letter and format common names
372 |     const formatted = name.charAt(0).toUpperCase() + name.slice(1);
373 |     
374 |     const nameMap: Record<string, string> = {
375 |       'Frontend': '🎨 Frontend',
376 |       'Backend': '⚙️ Backend',
377 |       'Tests': '🧪 Tests',
378 |       'Docs': '📚 Documentation',
379 |       'Config': '⚙️ Configuration',
380 |       'Database': '🗄️ Database',
381 |       'Tooling': '🔧 Tooling',
382 |       'Root': '📁 Root',
383 |     };
384 | 
385 |     return nameMap[formatted] || formatted;
386 |   }
387 | }
388 | 
389 | // Made with Bob
</content>
</file>
<file><path>packages/cli/src/rule-based-analyzer.ts</path>
<content lines="1-255">
  1 | import { GitDiff, RuleAnalysis, FileCategory, TestDetection, RiskFlag } from '@pr-ready/shared';
  2 | 
  3 | export class RuleBasedAnalyzer {
  4 |   analyze(diff: GitDiff): RuleAnalysis {
  5 |     const categories = this.categorizeFiles(diff);
  6 |     const testDetection = this.detectTests(diff);
  7 |     const risks = this.detectRisks(diff);
  8 | 
  9 |     return {
 10 |       categories,
 11 |       testDetection,
 12 |       risks,
 13 |     };
 14 |   }
 15 | 
 16 |   private categorizeFiles(diff: GitDiff): FileCategory[] {
 17 |     const categoryMap = new Map<string, string[]>();
 18 | 
 19 |     for (const file of diff.files) {
 20 |       const category = this.determineCategory(file.path);
 21 |       
 22 |       if (!categoryMap.has(category)) {
 23 |         categoryMap.set(category, []);
 24 |       }
 25 |       categoryMap.get(category)!.push(file.path);
 26 |     }
 27 | 
 28 |     // Convert map to array and sort by category name
 29 |     const categories: FileCategory[] = [];
 30 |     for (const [name, files] of categoryMap.entries()) {
 31 |       categories.push({
 32 |         name,
 33 |         files: files.sort(),
 34 |         count: files.length,
 35 |       });
 36 |     }
 37 | 
 38 |     return categories.sort((a, b) => a.name.localeCompare(b.name));
 39 |   }
 40 | 
 41 |   private determineCategory(filePath: string): string {
 42 |     const path = filePath.toLowerCase();
 43 | 
 44 |     // Test files
 45 |     if (this.isTestFile(filePath)) {
 46 |       return 'tests';
 47 |     }
 48 | 
 49 |     // Documentation
 50 |     if (path.match(/\.(md|txt|rst)$/) || path.includes('/docs/') || path.includes('/documentation/')) {
51 | return 'docs';
52 | }
53 |
54 | // Configuration files
55 | if (path.match(/\.(json|yaml|yml|toml|ini|conf|config)$/) || 
 56 |         path.includes('config/') ||
 57 |         path.match(/^\..*rc$/) ||
58 | path.match(/^(package|tsconfig|jest|webpack|vite|rollup|babel)\..\*\.(js|json|ts)$/)) {
 59 |       return 'config';
 60 |     }
 61 | 
 62 |     // Frontend (common frontend directories and file types)
 63 |     if (path.includes('/frontend/') || 
 64 |         path.includes('/client/') || 
 65 |         path.includes('/web/') ||
 66 |         path.includes('/ui/') ||
 67 |         path.includes('/components/') ||
 68 |         path.includes('/pages/') ||
 69 |         path.includes('/views/') ||
 70 |         path.match(/\.(jsx|tsx|vue|svelte|css|scss|sass|less)$/)) {
71 | return 'frontend';
72 | }
73 |
74 | // Backend (common backend directories)
75 | if (path.includes('/backend/') ||
76 | path.includes('/server/') ||
77 | path.includes('/api/') ||
78 | path.includes('/services/') ||
79 | path.includes('/controllers/') ||
80 | path.includes('/models/') ||
81 | path.includes('/routes/')) {
82 | return 'backend';
83 | }
84 |
85 | // Database/migrations
86 | if (path.includes('/migrations/') ||
87 | path.includes('/seeds/') ||
88 | path.includes('/schema/') ||
89 | path.includes('database/')) {
90 | return 'database';
91 | }
92 |
93 | // Build/tooling
94 | if (path.includes('/scripts/') ||
95 | path.includes('/tools/') ||
96 | path.includes('/build/') ||
97 | path.includes('/.github/') ||
98 | path.includes('/.gitlab/')) {
99 | return 'tooling';
100 | }
101 |
102 | // Root level files
103 | if (!path.includes('/')) {
104 | return 'root';
105 | }
106 |
107 | // Default: use first directory name
108 | const firstDir = filePath.split('/')[0];
109 | return firstDir || 'other';
110 | }
111 |
112 | private detectTests(diff: GitDiff): TestDetection {
113 | const testFiles: string[] = [];
114 | let sourceFilesChanged = false;
115 |
116 | for (const file of diff.files) {
117 | if (this.isTestFile(file.path)) {
118 | testFiles.push(file.path);
119 | } else if (this.isSourceFile(file.path)) {
120 | sourceFilesChanged = true;
121 | }
122 | }
123 |
124 | const hasTests = testFiles.length > 0;
125 | const missingTests = sourceFilesChanged && !hasTests;
126 |
127 | return {
128 | testFiles,
129 | hasTests,
130 | sourceFilesChanged,
131 | missingTests,
132 | };
133 | }
134 |
135 | private isTestFile(filePath: string): boolean {
136 | const path = filePath.toLowerCase();
137 | return (
138 | path.includes('**tests**/') ||
139 | path.includes('.test.') ||
140 | path.includes('.spec.') ||
141 | path.includes('/tests/') ||
142 | path.includes('/test/')
143 | );
144 | }
145 |
146 | private isSourceFile(filePath: string): boolean {
147 | const path = filePath.toLowerCase();
148 |  
149 | // Exclude non-source files
150 | if (this.isTestFile(path)) return false;
151 | if (path.match(/\.(md|txt|json|yaml|yml)$/)) return false;
152 |     if (path.includes('/docs/')) return false;
153 |     
154 |     // Include common source file extensions
155 |     return path.match(/\.(ts|tsx|js|jsx|py|java|go|rs|cpp|c|cs|rb|php|swift|kt)$/) !== null;
156 | }
157 |
158 | private detectRisks(diff: GitDiff): RiskFlag[] {
159 | const risks: RiskFlag[] = [];
160 |
161 | for (const file of diff.files) {
162 | const fileRisks = this.analyzeFileRisks(file.path, file.additions + file.deletions);
163 | risks.push(...fileRisks);
164 | }
165 |
166 | return risks;
167 | }
168 |
169 | private analyzeFileRisks(filePath: string, totalChanges: number): RiskFlag[] {
170 | const risks: RiskFlag[] = [];
171 | const path = filePath.toLowerCase();
172 |
173 | // High risk: Database migrations
174 | <<<<<<< HEAD
175 | if (path.includes('migrations/') || path.includes('schema/') || path.includes('/migrations/') || path.includes('/schema/')) {
176 | =======
177 | if (path.includes('migrations/') || path.includes('schema/')) {
178 | >>>>>>> 486204d (feat: implement PR Readiness Assistant (all 20 issues))
179 | risks.push({
180 | level: 'high',
181 | file: filePath,
182 | reason: 'Database schema change',
183 | pattern: 'migrations/schema',
184 | });
185 | }
186 |
187 | // High risk: Authentication/security
188 | if (path.includes('auth') || path.includes('security') || path.includes('authentication')) {
189 | risks.push({
190 | level: 'high',
191 | file: filePath,
192 | reason: 'Authentication or security code modified',
193 | pattern: 'auth/security',
194 | });
195 | }
196 |
197 | // High risk: Package dependencies
198 | if (path === 'package.json' || path === 'package-lock.json' ||
199 | path === 'yarn.lock' || path === 'pnpm-lock.yaml') {
200 | risks.push({
201 | level: 'high',
202 | file: filePath,
203 | reason: 'Package dependencies changed',
204 | pattern: 'dependencies',
205 | });
206 | }
207 |
208 | // Medium risk: Configuration files
209 | if (path.match(/\.(config|conf)\.(js|ts|json)$/) || 
210 |         path.includes('webpack') || 
211 |         path.includes('vite') ||
212 |         path.includes('tsconfig')) {
213 |       risks.push({
214 |         level: 'medium',
215 |         file: filePath,
216 |         reason: 'Build or TypeScript configuration changed',
217 |         pattern: 'config',
218 |       });
219 |     }
220 | 
221 |     // Medium risk: Environment files
222 |     if (path.includes('.env') || path.includes('environment')) {
223 |       risks.push({
224 |         level: 'medium',
225 |         file: filePath,
226 |         reason: 'Environment configuration changed',
227 |         pattern: 'environment',
228 |       });
229 |     }
230 | 
231 |     // Medium risk: Large refactors
232 |     if (totalChanges > 500) {
233 |       risks.push({
234 |         level: 'medium',
235 |         file: filePath,
236 |         reason: `Large file change (${totalChanges} lines)`,
237 | pattern: 'large-refactor',
238 | });
239 | }
240 |
241 | // Low risk: API routes
242 | if (path.includes('api/') || path.includes('routes/')) {
243 | risks.push({
244 | level: 'low',
245 | file: filePath,
246 | reason: 'API endpoint modified',
247 | pattern: 'api',
248 | });
249 | }
250 |
251 | return risks;
252 | }
253 | }
254 |
255 | // Made with Bob
</content>
</file>
<file><path>packages/cli/src/**tests**/rule-based-analyzer.test.ts</path>
<content lines="1-583">
1 | <<<<<<< HEAD
2 | =======
3 | import { describe, it, expect } from '@jest/globals';
4 | >>>>>>> 486204d (feat: implement PR Readiness Assistant (all 20 issues))
5 | import { RuleBasedAnalyzer } from '../rule-based-analyzer';
6 | import { GitDiff } from '@pr-ready/shared';
7 |
8 | describe('RuleBasedAnalyzer', () => {
9 | let analyzer: RuleBasedAnalyzer;
10 |
11 | beforeEach(() => {
12 | analyzer = new RuleBasedAnalyzer();
13 | });
14 |
15 | describe('categorizeFiles', () => {
16 | <<<<<<< HEAD
17 | it('categorizes test files', () => {
18 | const diff: GitDiff = {
19 | files: [
20 | { path: 'src/app.test.ts', status: 'added', additions: 10, deletions: 0, changes: '' },
21 | { path: 'src/__tests__/utils.test.ts', status: 'added', additions: 5, deletions: 0, changes: '' }
22 | ],
23 | baseBranch: 'main',
24 | headBranch: 'feature',
25 | totalChanges: 15,
26 | additions: 15,
27 | deletions: 0
28 | };
29 |
30 | const result = analyzer.analyze(diff);
31 |  
 32 | expect(result.categories).toContainEqual({
33 | name: 'tests',
34 | files: expect.arrayContaining(['src/app.test.ts', 'src/__tests__/utils.test.ts']),
35 | count: 2
36 | });
37 | });
38 |
39 | it('categorizes frontend files', () => {
40 | const diff: GitDiff = {
41 | files: [
42 | { path: 'src/components/Button.tsx', status: 'modified', additions: 5, deletions: 2, changes: '' },
43 | { path: 'src/styles/main.css', status: 'modified', additions: 3, deletions: 1, changes: '' }
44 | ],
45 | baseBranch: 'main',
46 | headBranch: 'feature',
47 | totalChanges: 11,
48 | additions: 8,
49 | deletions: 3
50 | };
51 |
52 | const result = analyzer.analyze(diff);
53 |  
 54 | const frontend = result.categories.find(c => c.name === 'frontend');
55 | expect(frontend).toBeDefined();
56 | expect(frontend?.count).toBe(2);
57 | });
58 |
59 | it('categorizes config files', () => {
60 | const diff: GitDiff = {
61 | files: [
62 | { path: 'package.json', status: 'modified', additions: 2, deletions: 1, changes: '' },
63 | { path: 'tsconfig.json', status: 'modified', additions: 1, deletions: 0, changes: '' }
64 | ],
65 | baseBranch: 'main',
66 | headBranch: 'feature',
67 | totalChanges: 4,
68 | additions: 3,
69 | deletions: 1
70 | };
71 |
72 | const result = analyzer.analyze(diff);
73 |  
 74 | const config = result.categories.find(c => c.name === 'config');
75 | expect(config?.files).toContain('package.json');
76 | expect(config?.files).toContain('tsconfig.json');
77 | =======
78 | it('should categorize test files', () => {
79 | const diff: GitDiff = {
80 | files: [
81 | { path: 'src/app.test.ts', status: 'added', additions: 10, deletions: 0, changes: '' },
82 | { path: 'src/__tests__/utils.spec.ts', status: 'added', additions: 5, deletions: 0, changes: '' },
83 | ],
84 | baseBranch: 'main',
85 | headBranch: 'feature',
86 | totalChanges: 2,
87 | additions: 15,
88 | deletions: 0,
89 | };
90 |
91 | const result = analyzer.analyze(diff);
92 |
93 | expect(result.categories).toHaveLength(1);
94 | expect(result.categories[0].name).toBe('tests');
95 | expect(result.categories[0].files).toHaveLength(2);
96 | });
97 |
98 | it('should categorize documentation files', () => {
99 | const diff: GitDiff = {
100 | files: [
101 | { path: 'README.md', status: 'modified', additions: 5, deletions: 2, changes: '' },
102 | { path: 'docs/api.md', status: 'added', additions: 100, deletions: 0, changes: '' },
103 | ],
104 | baseBranch: 'main',
105 | headBranch: 'feature',
106 | totalChanges: 2,
107 | additions: 105,
108 | deletions: 2,
109 | };
110 |
111 | const result = analyzer.analyze(diff);
112 |
113 | expect(result.categories).toHaveLength(1);
114 | expect(result.categories[0].name).toBe('docs');
115 | expect(result.categories[0].count).toBe(2);
116 | });
117 |
118 | it('should categorize configuration files', () => {
119 | const diff: GitDiff = {
120 | files: [
121 | { path: 'package.json', status: 'modified', additions: 2, deletions: 1, changes: '' },
122 | { path: 'tsconfig.json', status: 'modified', additions: 1, deletions: 0, changes: '' },
123 | { path: '.eslintrc.json', status: 'added', additions: 20, deletions: 0, changes: '' },
124 | ],
125 | baseBranch: 'main',
126 | headBranch: 'feature',
127 | totalChanges: 3,
128 | additions: 23,
129 | deletions: 1,
130 | };
131 |
132 | const result = analyzer.analyze(diff);
133 |
134 | expect(result.categories).toHaveLength(1);
135 | expect(result.categories[0].name).toBe('config');
136 | expect(result.categories[0].files).toContain('package.json');
137 | });
138 |
139 | it('should categorize frontend files', () => {
140 | const diff: GitDiff = {
141 | files: [
142 | { path: 'src/components/Button.tsx', status: 'added', additions: 50, deletions: 0, changes: '' },
143 | { path: 'src/pages/Home.vue', status: 'modified', additions: 10, deletions: 5, changes: '' },
144 | { path: 'styles/main.css', status: 'modified', additions: 20, deletions: 0, changes: '' },
145 | ],
146 | baseBranch: 'main',
147 | headBranch: 'feature',
148 | totalChanges: 3,
149 | additions: 80,
150 | deletions: 5,
151 | };
152 |
153 | const result = analyzer.analyze(diff);
154 |
155 | expect(result.categories).toHaveLength(1);
156 | expect(result.categories[0].name).toBe('frontend');
157 | });
158 |
159 | it('should categorize backend files', () => {
160 | const diff: GitDiff = {
161 | files: [
162 | { path: 'src/api/users.ts', status: 'added', additions: 100, deletions: 0, changes: '' },
163 | { path: 'src/controllers/auth.ts', status: 'modified', additions: 20, deletions: 10, changes: '' },
164 | { path: 'src/models/User.ts', status: 'added', additions: 50, deletions: 0, changes: '' },
165 | ],
166 | baseBranch: 'main',
167 | headBranch: 'feature',
168 | totalChanges: 3,
169 | additions: 170,
170 | deletions: 10,
171 | };
172 |
173 | const result = analyzer.analyze(diff);
174 |
175 | expect(result.categories).toHaveLength(1);
176 | expect(result.categories[0].name).toBe('backend');
177 | });
178 |
179 | it('should categorize database files', () => {
180 | const diff: GitDiff = {
181 | files: [
182 | { path: 'migrations/001_create_users.sql', status: 'added', additions: 20, deletions: 0, changes: '' },
183 | { path: 'database/schema.sql', status: 'modified', additions: 5, deletions: 2, changes: '' },
184 | ],
185 | baseBranch: 'main',
186 | headBranch: 'feature',
187 | totalChanges: 2,
188 | additions: 25,
189 | deletions: 2,
190 | };
191 |
192 | const result = analyzer.analyze(diff);
193 |
194 | expect(result.categories).toHaveLength(2);
195 | const categoryNames = result.categories.map(c => c.name);
196 | expect(categoryNames).toContain('database');
197 | expect(categoryNames).toContain('migrations');
198 | });
199 |
200 | it('should handle multiple categories', () => {
201 | const diff: GitDiff = {
202 | files: [
203 | { path: 'src/app.ts', status: 'modified', additions: 10, deletions: 5, changes: '' },
204 | { path: 'src/app.test.ts', status: 'added', additions: 20, deletions: 0, changes: '' },
205 | { path: 'README.md', status: 'modified', additions: 5, deletions: 0, changes: '' },
206 | ],
207 | baseBranch: 'main',
208 | headBranch: 'feature',
209 | totalChanges: 3,
210 | additions: 35,
211 | deletions: 5,
212 | };
213 |
214 | const result = analyzer.analyze(diff);
215 |
216 | expect(result.categories.length).toBeGreaterThan(1);
217 | const categoryNames = result.categories.map(c => c.name);
218 | expect(categoryNames).toContain('tests');
219 | expect(categoryNames).toContain('docs');
220 | >>>>>>> 486204d (feat: implement PR Readiness Assistant (all 20 issues))
221 | });
222 | });
223 |
224 | describe('detectTests', () => {
225 | <<<<<<< HEAD
226 | it('detects missing tests when source changed', () => {
227 | const diff: GitDiff = {
228 | files: [
229 | { path: 'src/app.ts', status: 'modified', additions: 10, deletions: 5, changes: '' }
230 | ],
231 | baseBranch: 'main',
232 | headBranch: 'feature',
233 | totalChanges: 15,
234 | additions: 10,
235 | deletions: 5
236 | };
237 |
238 | const result = analyzer.analyze(diff);
239 |  
240 | =======
241 | it('should detect test files', () => {
242 | const diff: GitDiff = {
243 | files: [
244 | { path: 'src/app.ts', status: 'modified', additions: 10, deletions: 5, changes: '' },
245 | { path: 'src/app.test.ts', status: 'added', additions: 20, deletions: 0, changes: '' },
246 | ],
247 | baseBranch: 'main',
248 | headBranch: 'feature',
249 | totalChanges: 2,
250 | additions: 30,
251 | deletions: 5,
252 | };
253 |
254 | const result = analyzer.analyze(diff);
255 |
256 | expect(result.testDetection.hasTests).toBe(true);
257 | expect(result.testDetection.testFiles).toContain('src/app.test.ts');
258 | expect(result.testDetection.sourceFilesChanged).toBe(true);
259 | expect(result.testDetection.missingTests).toBe(false);
260 | });
261 |
262 | it('should flag missing tests when source files changed', () => {
263 | const diff: GitDiff = {
264 | files: [
265 | { path: 'src/app.ts', status: 'modified', additions: 50, deletions: 10, changes: '' },
266 | { path: 'src/utils.ts', status: 'added', additions: 100, deletions: 0, changes: '' },
267 | ],
268 | baseBranch: 'main',
269 | headBranch: 'feature',
270 | totalChanges: 2,
271 | additions: 150,
272 | deletions: 10,
273 | };
274 |
275 | const result = analyzer.analyze(diff);
276 |
277 | >>>>>>> 486204d (feat: implement PR Readiness Assistant (all 20 issues))
278 | expect(result.testDetection.hasTests).toBe(false);
279 | expect(result.testDetection.sourceFilesChanged).toBe(true);
280 | expect(result.testDetection.missingTests).toBe(true);
281 | });
282 |
283 | <<<<<<< HEAD
284 | it('detects tests present', () => {
285 | const diff: GitDiff = {
286 | files: [
287 | { path: 'src/app.ts', status: 'modified', additions: 10, deletions: 5, changes: '' },
288 | { path: 'src/app.test.ts', status: 'modified', additions: 5, deletions: 2, changes: '' }
289 | ],
290 | baseBranch: 'main',
291 | headBranch: 'feature',
292 | totalChanges: 22,
293 | additions: 15,
294 | deletions: 7
295 | };
296 |
297 | const result = analyzer.analyze(diff);
298 |  
299 | expect(result.testDetection.hasTests).toBe(true);
300 | expect(result.testDetection.missingTests).toBe(false);
301 | expect(result.testDetection.testFiles).toContain('src/app.test.ts');
302 | =======
303 | it('should not flag missing tests for non-source changes', () => {
304 | const diff: GitDiff = {
305 | files: [
306 | { path: 'README.md', status: 'modified', additions: 10, deletions: 5, changes: '' },
307 | { path: 'package.json', status: 'modified', additions: 2, deletions: 1, changes: '' },
308 | ],
309 | baseBranch: 'main',
310 | headBranch: 'feature',
311 | totalChanges: 2,
312 | additions: 12,
313 | deletions: 6,
314 | };
315 |
316 | const result = analyzer.analyze(diff);
317 |
318 | expect(result.testDetection.sourceFilesChanged).toBe(false);
319 | expect(result.testDetection.missingTests).toBe(false);
320 | });
321 |
322 | it('should recognize various test file patterns', () => {
323 | const diff: GitDiff = {
324 | files: [
325 | { path: 'src/__tests__/app.ts', status: 'added', additions: 10, deletions: 0, changes: '' },
326 | { path: 'src/utils.spec.ts', status: 'added', additions: 10, deletions: 0, changes: '' },
327 | { path: 'tests/integration.test.js', status: 'added', additions: 10, deletions: 0, changes: '' },
328 | ],
329 | baseBranch: 'main',
330 | headBranch: 'feature',
331 | totalChanges: 3,
332 | additions: 30,
333 | deletions: 0,
334 | };
335 |
336 | const result = analyzer.analyze(diff);
337 |
338 | expect(result.testDetection.testFiles).toHaveLength(3);
339 | expect(result.testDetection.hasTests).toBe(true);
340 | >>>>>>> 486204d (feat: implement PR Readiness Assistant (all 20 issues))
341 | });
342 | });
343 |
344 | describe('detectRisks', () => {
345 | <<<<<<< HEAD
346 | it('flags database migrations as high risk', () => {
347 | const diff: GitDiff = {
348 | files: [
349 | { path: 'migrations/001_add_users.sql', status: 'added', additions: 20, deletions: 0, changes: '' }
350 | ],
351 | baseBranch: 'main',
352 | headBranch: 'feature',
353 | totalChanges: 20,
354 | additions: 20,
355 | deletions: 0
356 | };
357 |
358 | const result = analyzer.analyze(diff);
359 |  
360 | const highRisk = result.risks.find(r => r.level === 'high' && r.pattern === 'migrations/schema');
361 | expect(highRisk).toBeDefined();
362 | expect(highRisk?.reason).toContain('Database schema change');
363 | });
364 |
365 | it('flags auth changes as high risk', () => {
366 | const diff: GitDiff = {
367 | files: [
368 | { path: 'src/auth/login.ts', status: 'modified', additions: 15, deletions: 10, changes: '' }
369 | ],
370 | baseBranch: 'main',
371 | headBranch: 'feature',
372 | totalChanges: 25,
373 | additions: 15,
374 | deletions: 10
375 | };
376 |
377 | const result = analyzer.analyze(diff);
378 |  
379 | const authRisk = result.risks.find(r => r.pattern === 'auth/security');
380 | expect(authRisk?.level).toBe('high');
381 | });
382 |
383 | it('flags large refactors as medium risk', () => {
384 | const diff: GitDiff = {
385 | files: [
386 | { path: 'src/large-file.ts', status: 'modified', additions: 300, deletions: 250, changes: '' }
387 | ],
388 | baseBranch: 'main',
389 | headBranch: 'feature',
390 | totalChanges: 550,
391 | additions: 300,
392 | deletions: 250
393 | };
394 |
395 | const result = analyzer.analyze(diff);
396 |  
397 | const refactorRisk = result.risks.find(r => r.pattern === 'large-refactor');
398 | expect(refactorRisk?.level).toBe('medium');
399 | expect(refactorRisk?.reason).toContain('550 lines');
400 | });
401 |
402 | it('flags package.json changes as high risk', () => {
403 | const diff: GitDiff = {
404 | files: [
405 | { path: 'package.json', status: 'modified', additions: 5, deletions: 2, changes: '' }
406 | ],
407 | baseBranch: 'main',
408 | headBranch: 'feature',
409 | totalChanges: 7,
410 | additions: 5,
411 | deletions: 2
412 | };
413 |
414 | const result = analyzer.analyze(diff);
415 |  
416 | const depRisk = result.risks.find(r => r.pattern === 'dependencies');
417 | expect(depRisk?.level).toBe('high');
418 | expect(depRisk?.reason).toContain('Package dependencies changed');
419 | =======
420 | it('should flag database migrations as high risk', () => {
421 | const diff: GitDiff = {
422 | files: [
423 | { path: 'migrations/001_add_users.sql', status: 'added', additions: 50, deletions: 0, changes: '' },
424 | ],
425 | baseBranch: 'main',
426 | headBranch: 'feature',
427 | totalChanges: 1,
428 | additions: 50,
429 | deletions: 0,
430 | };
431 |
432 | const result = analyzer.analyze(diff);
433 |
434 | expect(result.risks).toHaveLength(1);
435 | expect(result.risks[0].level).toBe('high');
436 | expect(result.risks[0].pattern).toBe('migrations/schema');
437 | });
438 |
439 | it('should flag authentication changes as high risk', () => {
440 | const diff: GitDiff = {
441 | files: [
442 | { path: 'src/auth/login.ts', status: 'modified', additions: 20, deletions: 10, changes: '' },
443 | ],
444 | baseBranch: 'main',
445 | headBranch: 'feature',
446 | totalChanges: 1,
447 | additions: 20,
448 | deletions: 10,
449 | };
450 |
451 | const result = analyzer.analyze(diff);
452 |
453 | const authRisk = result.risks.find(r => r.pattern === 'auth/security');
454 | expect(authRisk).toBeDefined();
455 | expect(authRisk?.level).toBe('high');
456 | });
457 |
458 | it('should flag package.json changes as high risk', () => {
459 | const diff: GitDiff = {
460 | files: [
461 | { path: 'package.json', status: 'modified', additions: 5, deletions: 2, changes: '' },
462 | ],
463 | baseBranch: 'main',
464 | headBranch: 'feature',
465 | totalChanges: 1,
466 | additions: 5,
467 | deletions: 2,
468 | };
469 |
470 | const result = analyzer.analyze(diff);
471 |
472 | const depRisk = result.risks.find(r => r.pattern === 'dependencies');
473 | expect(depRisk).toBeDefined();
474 | expect(depRisk?.level).toBe('high');
475 | });
476 |
477 | it('should flag config changes as medium risk', () => {
478 | const diff: GitDiff = {
479 | files: [
480 | { path: 'webpack.config.js', status: 'modified', additions: 10, deletions: 5, changes: '' },
481 | ],
482 | baseBranch: 'main',
483 | headBranch: 'feature',
484 | totalChanges: 1,
485 | additions: 10,
486 | deletions: 5,
487 | };
488 |
489 | const result = analyzer.analyze(diff);
490 |
491 | const configRisk = result.risks.find(r => r.pattern === 'config');
492 | expect(configRisk).toBeDefined();
493 | expect(configRisk?.level).toBe('medium');
494 | });
495 |
496 | it('should flag large refactors as medium risk', () => {
497 | const diff: GitDiff = {
498 | files: [
499 | { path: 'src/large-file.ts', status: 'modified', additions: 300, deletions: 250, changes: '' },
500 | ],
501 | baseBranch: 'main',
502 | headBranch: 'feature',
503 | totalChanges: 1,
504 | additions: 300,
505 | deletions: 250,
506 | };
507 |
508 | const result = analyzer.analyze(diff);
509 |
510 | const refactorRisk = result.risks.find(r => r.pattern === 'large-refactor');
511 | expect(refactorRisk).toBeDefined();
512 | expect(refactorRisk?.level).toBe('medium');
513 | });
514 |
515 | it('should flag API changes as low risk', () => {
516 | const diff: GitDiff = {
517 | files: [
518 | { path: 'src/api/users.ts', status: 'modified', additions: 20, deletions: 10, changes: '' },
519 | ],
520 | baseBranch: 'main',
521 | headBranch: 'feature',
522 | totalChanges: 1,
523 | additions: 20,
524 | deletions: 10,
525 | };
526 |
527 | const result = analyzer.analyze(diff);
528 |
529 | const apiRisk = result.risks.find(r => r.pattern === 'api');
530 | expect(apiRisk).toBeDefined();
531 | expect(apiRisk?.level).toBe('low');
532 | });
533 |
534 | it('should detect multiple risks for a single file', () => {
535 | const diff: GitDiff = {
536 | files: [
537 | { path: 'src/api/auth.ts', status: 'modified', additions: 300, deletions: 250, changes: '' },
538 | ],
539 | baseBranch: 'main',
540 | headBranch: 'feature',
541 | totalChanges: 1,
542 | additions: 300,
543 | deletions: 250,
544 | };
545 |
546 | const result = analyzer.analyze(diff);
547 |
548 | // Should have both auth (high) and large-refactor (medium) and api (low) risks
549 | expect(result.risks.length).toBeGreaterThanOrEqual(2);
550 | const patterns = result.risks.map(r => r.pattern);
551 | expect(patterns).toContain('auth/security');
552 | expect(patterns).toContain('large-refactor');
553 | });
554 | });
555 |
556 | describe('full analysis', () => {
557 | it('should provide complete analysis', () => {
558 | const diff: GitDiff = {
559 | files: [
560 | { path: 'src/app.ts', status: 'modified', additions: 50, deletions: 20, changes: '' },
561 | { path: 'src/app.test.ts', status: 'added', additions: 100, deletions: 0, changes: '' },
562 | { path: 'package.json', status: 'modified', additions: 2, deletions: 1, changes: '' },
563 | { path: 'README.md', status: 'modified', additions: 10, deletions: 5, changes: '' },
564 | ],
565 | baseBranch: 'main',
566 | headBranch: 'feature',
567 | totalChanges: 4,
568 | additions: 162,
569 | deletions: 26,
570 | };
571 |
572 | const result = analyzer.analyze(diff);
573 |
574 | expect(result.categories.length).toBeGreaterThan(0);
575 | expect(result.testDetection.hasTests).toBe(true);
576 | expect(result.testDetection.missingTests).toBe(false);
577 | expect(result.risks.length).toBeGreaterThan(0);
578 | >>>>>>> 486204d (feat: implement PR Readiness Assistant (all 20 issues))
579 | });
580 | });
581 | });
582 |
583 | // Made with Bob
</content>
</file>
</files>
<environment_details>

# VSCode Visible Files

packages/extension/tsconfig.json

# VSCode Open Tabs

issues/008-openai-llm-provider.md,issues/009-hybrid-analyzer.md,issues/010-smart-truncation.md,issues/011-cache-layer.md,issues/012-test-execution.md,issues/013-reviewer-checklist.md,issues/014-monorepo-detection.md,issues/015-anthropic-provider.md,issues/016-ollama-provider.md,issues/017-vscode-extension-scaffold.md,issues/018-vscode-sidebar-panel.md,issues/019-cli-help-docs.md,issues/020-testing-infrastructure.md,IMPLEMENTATION_PLAN.md,packages/shared/package.json,packages/shared/tsconfig.json,packages/shared/src/index.ts,packages/cli/tsconfig.json,packages/cli/src/output-handler.ts,packages/cli/src/index.ts

# Current Time

Current time in ISO 8601 UTC format: 2026-05-16T06:05:27.165Z
User time zone: Asia/Taipei, UTC+8:00

# Current Cost

$0.01

# Review Exclusions

The following file patterns are excluded from code reviews:

- .vscode/\*\*

# Current Mode

<slug>code</slug>
<name>💻 Code</name>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>
