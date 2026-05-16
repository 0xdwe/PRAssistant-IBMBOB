#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { GitDiffExtractor } from './git-diff-extractor';
import { RuleBasedAnalyzer } from './rule-based-analyzer';
import { PRPacketGenerator } from './pr-packet-generator';
import { OutputHandler } from './output-handler';
import { ConfigManager } from './config-manager';
<<<<<<< HEAD
import { OpenAIProvider } from './openai-provider';
import { LLMConfig } from '@pr-ready/shared';
=======
import { TestExecutor } from './test-executor';
import { MonorepoDetector } from './monorepo-detector';
import { TestResult, MonorepoDetection } from '@pr-ready/shared';
>>>>>>> ca3a4f3 (feat: implement monorepo detection (issue 014))

const program = new Command();

program
  .name('pr-ready')
  .description('Automated PR readiness analysis tool')
  .version('0.1.0')
  .option('--base <branch>', 'Base branch to compare against (default: auto-detect)')
  .option('--head <branch>', 'Head branch with changes (default: current)')
  .option('--llm <provider>', 'LLM provider: openai|anthropic|ollama|none (default: none)')
  .option('--test', 'Run tests and include results')
  .option('--no-cache', 'Skip cache lookup')
  .option('--config <path>', 'Custom config file path')
  .option('--output <path>', 'Custom output file path')
  .option('--no-clipboard', 'Skip clipboard copy')
  .action(async (options) => {
    try {
      console.log(chalk.blue('🔍 Analyzing PR readiness...\n'));

      // Load configuration
      const configManager = new ConfigManager();
      let config = await configManager.loadConfig();
      
      // Apply CLI flags (they override config)
      const cliConfig: any = {};
      if (options.llm) cliConfig.llm = { provider: options.llm };
      if (options.output) cliConfig.output = { ...config.output, file: options.output };
      if (options.clipboard === false) cliConfig.output = { ...config.output, clipboard: false };
      
      config = configManager.applyCliFlags(config, cliConfig);
      configManager.validateConfig(config);

      // Extract git diff
      console.log(chalk.gray('Extracting git diff...'));
      const diffExtractor = new GitDiffExtractor();
      const diff = await diffExtractor.extractDiff({
        baseBranch: options.base,
        headBranch: options.head,
      });

      console.log(chalk.green(`✓ Found ${diff.files.length} changed file(s)\n`));

      // Analyze with rule-based analyzer
      console.log(chalk.gray('Analyzing changes...'));
      const analyzer = new RuleBasedAnalyzer();
      const analysis = analyzer.analyze(diff);

      console.log(chalk.green(`✓ Categorized into ${analysis.categories.length} categories`));
      console.log(chalk.green(`✓ Detected ${analysis.testDetection.testFiles.length} test file(s)`));
      console.log(chalk.green(`✓ Found ${analysis.risks.length} risk flag(s)\n`));

<<<<<<< HEAD
      // LLM analysis if enabled
      let llmAnalysis = null;
      if (config.llm?.provider && config.llm.provider !== 'none') {
        try {
          console.log(chalk.gray(`Analyzing with ${config.llm.provider}...`));
          
          const llmConfig: LLMConfig = {
            provider: config.llm.provider,
            baseURL: config.llm.baseURL || 'https://rqhse4n.9router.com/v1',
            apiKey: config.llm.apiKey,
            model: config.llm.model || 'gpt-4',
            timeout: 30000,
          };

          if (config.llm.provider === 'openai') {
            const provider = new OpenAIProvider(llmConfig);
            llmAnalysis = await provider.analyze(diff);
            console.log(chalk.green('✓ LLM analysis complete\n'));
          } else {
            console.log(chalk.yellow(`⚠️  Provider '${config.llm.provider}' not yet implemented\n`));
          }
        } catch (error) {
          if (error instanceof Error) {
            console.log(chalk.yellow(`⚠️  LLM analysis failed: ${error.message}\n`));
          } else {
            console.log(chalk.yellow('⚠️  LLM analysis failed with unknown error\n'));
          }
        }
=======
      // Detect monorepo structure
      console.log(chalk.gray('Detecting monorepo structure...'));
      const monorepoDetector = new MonorepoDetector(process.cwd(), config);
      const changedFilePaths = diff.files.map(f => f.path);
      const monorepoDetection = await monorepoDetector.detectAffectedPackages(changedFilePaths);
      
      if (monorepoDetection.isMonorepo && monorepoDetection.affectedPackages.length > 0) {
        console.log(chalk.green(`✓ Detected ${monorepoDetection.type} monorepo`));
        console.log(chalk.green(`✓ Affected packages: ${monorepoDetection.affectedPackages.join(', ')}\n`));
      } else if (monorepoDetection.isMonorepo) {
        console.log(chalk.green(`✓ Detected ${monorepoDetection.type} monorepo (no packages affected)\n`));
      } else {
        console.log(chalk.gray('✓ Not a monorepo\n'));
      }

      // Run tests if --test flag is provided
      let testResults: TestResult | undefined;
      if (options.test) {
        console.log(chalk.gray('Running tests...'));
        try {
          const testExecutor = new TestExecutor();
          const testCommand = config.test?.command || 'npm test';
          const testTimeout = config.test?.timeout || 300000;
          
          testResults = await testExecutor.executeTests(testCommand, testTimeout);
          
          if (testResults.passed) {
            console.log(chalk.green(`✓ All tests passed (${testResults.passedTests}/${testResults.totalTests})`));
          } else {
            console.log(chalk.red(`✗ Tests failed (${testResults.failedTests}/${testResults.totalTests} failed)`));
          }
        } catch (error) {
          console.error(chalk.red(`✗ Test execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
          if (!options.force) {
            process.exit(1);
          }
        }
        console.log('');
>>>>>>> ca3a4f3 (feat: implement monorepo detection (issue 014))
      }

      // Generate PR packet
      console.log(chalk.gray('Generating PR packet...'));
      const generator = new PRPacketGenerator();
<<<<<<< HEAD
      const packet = generator.generate(diff, analysis, llmAnalysis);
=======
      const packet = generator.generate(diff, analysis, testResults, monorepoDetection);
>>>>>>> ca3a4f3 (feat: implement monorepo detection (issue 014))
      const markdown = generator.generateMarkdown(packet);

      console.log(chalk.green('✓ PR packet generated\n'));

      // Output results
      const outputHandler = new OutputHandler();
      const outputOptions = {
        file: config.output?.file || '.pr-ready.md',
        clipboard: config.output?.clipboard ?? true,
      };
      await outputHandler.output(markdown, outputOptions);

      console.log(chalk.green('\n✨ Done! Your PR is ready for review.'));

      // Show warnings if any
      if (analysis.testDetection.missingTests) {
        console.log(chalk.yellow('\n⚠️  Warning: No test files modified despite source code changes'));
      }

      const highRisks = analysis.risks.filter(r => r.level === 'high');
      if (highRisks.length > 0) {
        console.log(chalk.yellow(`\n⚠️  Warning: ${highRisks.length} high-risk change(s) detected`));
      }

      // Exit with error if tests failed
      if (testResults && !testResults.passed) {
        console.log(chalk.red('\n❌ Tests failed. Please fix failing tests before submitting PR.'));
        process.exit(1);
      }

    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red(`\n❌ Error: ${error.message}`));
      } else {
        console.error(chalk.red('\n❌ An unexpected error occurred'));
      }
      process.exit(1);
    }
  });

program.parse();

// Made with Bob
