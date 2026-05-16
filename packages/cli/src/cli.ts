#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { GitDiffExtractor } from './git-diff-extractor';
import { RuleBasedAnalyzer } from './rule-based-analyzer';
import { PRPacketGenerator } from './pr-packet-generator';
import { OutputHandler } from './output-handler';
import { ConfigManager } from './config-manager';

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

      // Generate PR packet
      console.log(chalk.gray('Generating PR packet...'));
      const generator = new PRPacketGenerator();
      const packet = generator.generate(diff, analysis);
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
