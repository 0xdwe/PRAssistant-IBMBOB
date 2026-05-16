import * as vscode from 'vscode';
import { GitDiffExtractor } from '@pr-ready/cli/dist/git-diff-extractor';
import { RuleBasedAnalyzer } from '@pr-ready/cli/dist/rule-based-analyzer';
import { PRPacketGenerator } from '@pr-ready/cli/dist/pr-packet-generator';
import { OpenAIProvider } from '@pr-ready/cli/dist/openai-provider';
import { LLMConfig } from '@pr-ready/shared';

export function activate(context: vscode.ExtensionContext) {
	console.log('PR Ready extension is now active!');

	// Create output channel for logging
	const outputChannel = vscode.window.createOutputChannel('PR Ready');

	let disposable = vscode.commands.registerCommand('prReady.analyze', async () => {
		try {
			outputChannel.clear();
			outputChannel.show();
			outputChannel.appendLine('🔍 Starting PR analysis...\n');

			// Get workspace folder
			const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
			if (!workspaceFolder) {
				vscode.window.showErrorMessage('No workspace folder open');
				return;
			}

			// Get configuration
			const config = vscode.workspace.getConfiguration('prReady');
			const llmProvider = config.get<string>('llm.provider', 'none');
			const llmBaseURL = config.get<string>('llm.baseURL', '');
			const llmModel = config.get<string>('llm.model', 'gpt-4');
			const llmApiKey = config.get<string>('llm.apiKey', '');

			outputChannel.appendLine(`Configuration:`);
			outputChannel.appendLine(`  LLM Provider: ${llmProvider}`);
			outputChannel.appendLine(`  Base URL: ${llmBaseURL}`);
			outputChannel.appendLine(`  Model: ${llmModel}\n`);

			// Extract git diff
			outputChannel.appendLine('Extracting git diff...');
			const diffExtractor = new GitDiffExtractor();
			const diff = await diffExtractor.extractDiff({
				baseBranch: 'origin/main',
				cwd: workspaceFolder.uri.fsPath
			});

			outputChannel.appendLine(`✓ Found ${diff.files.length} changed file(s)\n`);

			// Analyze with rule-based analyzer
			outputChannel.appendLine('Analyzing changes...');
			const analyzer = new RuleBasedAnalyzer();
			const analysis = analyzer.analyze(diff);

			outputChannel.appendLine(`✓ Categorized into ${analysis.categories.length} categories`);
			outputChannel.appendLine(`✓ Detected ${analysis.testDetection.testFiles.length} test file(s)`);
			outputChannel.appendLine(`✓ Found ${analysis.risks.length} risk flag(s)\n`);

			// LLM analysis if enabled
			let llmAnalysis = null;
			if (llmProvider && llmProvider !== 'none') {
				try {
					outputChannel.appendLine(`Analyzing with ${llmProvider}...`);
					
					const llmConfig: LLMConfig = {
						provider: llmProvider as any,
						baseURL: llmBaseURL,
						model: llmModel,
						apiKey: llmApiKey,
						timeout: 30000
					};

					if (llmProvider === 'openai') {
						const provider = new OpenAIProvider(llmConfig);
						llmAnalysis = await provider.analyze(diff);
						outputChannel.appendLine('✓ LLM analysis complete\n');
					} else {
						outputChannel.appendLine(`⚠️  Provider '${llmProvider}' not yet implemented\n`);
					}
				} catch (error) {
					const errorMessage = error instanceof Error ? error.message : 'Unknown error';
					outputChannel.appendLine(`⚠️  LLM analysis failed: ${errorMessage}\n`);
					vscode.window.showWarningMessage(`LLM analysis failed: ${errorMessage}`);
				}
			}

			// Generate PR packet
			outputChannel.appendLine('Generating PR packet...');
			const generator = new PRPacketGenerator();
			const packet = generator.generate(diff, analysis, llmAnalysis);
			const markdown = generator.generateMarkdown(packet);

			outputChannel.appendLine('✓ PR packet generated\n');

			// Show in new document
			const doc = await vscode.workspace.openTextDocument({
				content: markdown,
				language: 'markdown'
			});
			await vscode.window.showTextDocument(doc);

			// Copy to clipboard
			await vscode.env.clipboard.writeText(markdown);
			
			outputChannel.appendLine('✨ Done! PR packet opened and copied to clipboard.');
			vscode.window.showInformationMessage('PR analysis complete! Results opened and copied to clipboard.');

		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			outputChannel.appendLine(`\n❌ Error: ${errorMessage}`);
			vscode.window.showErrorMessage(`PR analysis failed: ${errorMessage}`);
		}
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(outputChannel);
}

export function deactivate() {}

// Made with Bob
