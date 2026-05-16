import * as vscode from 'vscode';
import { GitDiffExtractor, RuleBasedAnalyzer, PRPacketGenerator } from '@pr-ready/cli';

export function activate(context: vscode.ExtensionContext) {
  console.log('PR Ready extension activated');

  const disposable = vscode.commands.registerCommand('prReady.analyze', async () => {
    try {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder open');
        return;
      }

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'PR Ready',
          cancellable: false,
        },
        async (progress) => {
          progress.report({ message: 'Extracting git diff...' });

          const diffExtractor = new GitDiffExtractor(workspaceFolder.uri.fsPath);
          const diff = await diffExtractor.extractDiff({});

          if (diff.files.length === 0) {
            vscode.window.showInformationMessage('No changes detected');
            return;
          }

          progress.report({ message: 'Analyzing changes...' });

          const analyzer = new RuleBasedAnalyzer();
          const analysis = await analyzer.analyze(diff);

          progress.report({ message: 'Generating PR packet...' });

          const generator = new PRPacketGenerator();
          const packet = generator.generate(diff, analysis);
          const markdown = generator.generateMarkdown(packet);

          const doc = await vscode.workspace.openTextDocument({
            content: markdown,
            language: 'markdown',
          });
          await vscode.window.showTextDocument(doc);

          await vscode.env.clipboard.writeText(markdown);

          vscode.window.showInformationMessage(
            `PR analysis complete: ${diff.files.length} files changed`
          );
        }
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      vscode.window.showErrorMessage(`PR Ready failed: ${errorMessage}`);
      console.error('Analysis error:', error);
    }
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}

// Made with Bob
