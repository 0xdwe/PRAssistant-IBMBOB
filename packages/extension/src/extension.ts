import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import {
  GitDiffExtractor,
  RuleBasedAnalyzer,
  PRPacketGenerator,
  ConfigManager,
} from '@pr-ready/cli';
import { PRPanelProvider } from './webview/PRPanelProvider';

let statusBarItem: vscode.StatusBarItem;
let prPanelProvider: PRPanelProvider;

export function activate(context: vscode.ExtensionContext) {
  console.log('PR Ready extension is now active');

  // Check if workspace has .git directory
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    console.log('No workspace folder found');
    return;
  }

  const workspaceRoot = workspaceFolders[0].uri.fsPath;
  const gitPath = path.join(workspaceRoot, '.git');
  
  if (!fs.existsSync(gitPath)) {
    console.log('No .git directory found in workspace');
    return;
  }

  // Register sidebar panel provider
  prPanelProvider = new PRPanelProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      PRPanelProvider.viewType,
      prPanelProvider
    )
  );

  // Create status bar item
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  statusBarItem.text = '$(git-branch) PR Ready';
  statusBarItem.tooltip = 'Click to analyze PR changes';
  statusBarItem.command = 'prReady.analyze';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Register analyze command
  const analyzeCommand = vscode.commands.registerCommand(
    'prReady.analyze',
    async () => {
      await analyzePRChanges(workspaceRoot);
    }
  );
  context.subscriptions.push(analyzeCommand);

  // Register configure command
  const configureCommand = vscode.commands.registerCommand(
    'prReady.configure',
    async () => {
      await configurePRReady(workspaceRoot);
    }
  );
  context.subscriptions.push(configureCommand);
}

async function analyzePRChanges(workspaceRoot: string): Promise<void> {
  try {
    // Show progress notification
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'PR Ready',
        cancellable: false,
      },
      async (progress) => {
        progress.report({ message: 'Extracting git diff...' });

        // Extract git diff
        const diffExtractor = new GitDiffExtractor(workspaceRoot);
        const diff = await diffExtractor.extractDiff({});

        if (diff.files.length === 0) {
          vscode.window.showInformationMessage(
            'No changes detected in the current branch'
          );
          return;
        }

        progress.report({ message: 'Analyzing changes...' });

        // Analyze changes
        const analyzer = new RuleBasedAnalyzer();
        const analysis = await analyzer.analyze(diff);

        progress.report({ message: 'Generating PR packet...' });

        // Generate PR packet
        const generator = new PRPacketGenerator();
        const packet = generator.generate(diff, analysis);

        progress.report({ message: 'Creating output...' });

        // Update sidebar panel
        prPanelProvider.updatePacket(packet);

        // Create output document
        const markdown = formatPRPacket(packet);
        const doc = await vscode.workspace.openTextDocument({
          content: markdown,
          language: 'markdown',
        });
        await vscode.window.showTextDocument(doc);

        vscode.window.showInformationMessage(
          `PR analysis complete: ${diff.files.length} files changed`
        );
      }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    
    // Update sidebar panel with error
    prPanelProvider.showError(errorMessage);
    
    vscode.window.showErrorMessage(`PR Ready analysis failed: ${errorMessage}`);
    console.error('Analysis error:', error);
  }
}

async function configurePRReady(workspaceRoot: string): Promise<void> {
  try {
    const configPath = path.join(workspaceRoot, '.prreadyrc.json');
    const configExists = fs.existsSync(configPath);

    if (configExists) {
      // Open existing config
      const doc = await vscode.workspace.openTextDocument(configPath);
      await vscode.window.showTextDocument(doc);
    } else {
      // Create new config
      const createNew = await vscode.window.showQuickPick(['Yes', 'No'], {
        placeHolder: 'No configuration file found. Create one?',
      });

      if (createNew === 'Yes') {
        const defaultConfig = {
          llm: {
            provider: 'none',
          },
          test: {
            command: 'npm test',
            timeout: 300000,
          },
          output: {
            clipboard: true,
          },
        };

        fs.writeFileSync(
          configPath,
          JSON.stringify(defaultConfig, null, 2),
          'utf-8'
        );

        const doc = await vscode.workspace.openTextDocument(configPath);
        await vscode.window.showTextDocument(doc);
        vscode.window.showInformationMessage(
          'Configuration file created: .prreadyrc.json'
        );
      }
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    vscode.window.showErrorMessage(
      `Failed to configure PR Ready: ${errorMessage}`
    );
    console.error('Configuration error:', error);
  }
}

function formatPRPacket(packet: any): string {
  let markdown = '# PR Analysis\n\n';

  // Summary
  markdown += '## Summary\n\n';
  markdown += `${packet.summary}\n\n`;

  // Metadata
  markdown += '## Metadata\n\n';
  markdown += `- **Base Branch**: ${packet.metadata.baseBranch}\n`;
  markdown += `- **Head Branch**: ${packet.metadata.headBranch}\n`;
  markdown += `- **Total Files**: ${packet.metadata.totalFiles}\n`;
  markdown += `- **Total Changes**: ${packet.metadata.totalChanges}\n`;
  markdown += `- **Generated**: ${packet.metadata.generatedAt}\n\n`;

  // Files Changed
  markdown += '## Files Changed\n\n';
  for (const category of packet.filesChanged) {
    markdown += `### ${category.name} (${category.count})\n\n`;
    for (const file of category.files) {
      markdown += `- ${file}\n`;
    }
    markdown += '\n';
  }

  // Test Status
  markdown += '## Test Status\n\n';
  markdown += `- **Has Tests**: ${packet.testStatus.hasTests ? 'Yes' : 'No'}\n`;
  markdown += `- **Source Files Changed**: ${packet.testStatus.sourceFilesChanged ? 'Yes' : 'No'}\n`;
  markdown += `- **Missing Tests**: ${packet.testStatus.missingTests ? 'Yes' : 'No'}\n`;
  if (packet.testStatus.testFiles.length > 0) {
    markdown += '\n**Test Files**:\n';
    for (const file of packet.testStatus.testFiles) {
      markdown += `- ${file}\n`;
    }
  }
  markdown += '\n';

  // Risks
  if (packet.risks.length > 0) {
    markdown += '## Risk Flags\n\n';
    for (const risk of packet.risks) {
      markdown += `### ${risk.level.toUpperCase()}: ${risk.file}\n\n`;
      markdown += `- **Reason**: ${risk.reason}\n`;
      markdown += `- **Pattern**: ${risk.pattern}\n\n`;
    }
  }

  // Checklist
  markdown += '## Reviewer Checklist\n\n';
  for (const item of packet.checklist) {
    markdown += `- [ ] ${item}\n`;
  }
  markdown += '\n';

  return markdown;
}

export function deactivate() {
  if (statusBarItem) {
    statusBarItem.dispose();
  }
}

// Made with Bob
