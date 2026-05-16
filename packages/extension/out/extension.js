"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const cli_1 = require("@pr-ready/cli");
const PRPanelProvider_1 = require("./webview/PRPanelProvider");
let statusBarItem;
let prPanelProvider;
function activate(context) {
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
    prPanelProvider = new PRPanelProvider_1.PRPanelProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(PRPanelProvider_1.PRPanelProvider.viewType, prPanelProvider));
    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.text = '$(git-branch) PR Ready';
    statusBarItem.tooltip = 'Click to analyze PR changes';
    statusBarItem.command = 'prReady.analyze';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
    // Register analyze command
    const analyzeCommand = vscode.commands.registerCommand('prReady.analyze', async () => {
        await analyzePRChanges(workspaceRoot);
    });
    context.subscriptions.push(analyzeCommand);
    // Register configure command
    const configureCommand = vscode.commands.registerCommand('prReady.configure', async () => {
        await configurePRReady(workspaceRoot);
    });
    context.subscriptions.push(configureCommand);
}
async function analyzePRChanges(workspaceRoot) {
    try {
        // Show progress notification
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'PR Ready',
            cancellable: false,
        }, async (progress) => {
            progress.report({ message: 'Extracting git diff...' });
            // Extract git diff
            const diffExtractor = new cli_1.GitDiffExtractor(workspaceRoot);
            const diff = await diffExtractor.extractDiff({});
            if (diff.files.length === 0) {
                vscode.window.showInformationMessage('No changes detected in the current branch');
                return;
            }
            progress.report({ message: 'Analyzing changes...' });
            // Analyze changes
            const analyzer = new cli_1.RuleBasedAnalyzer();
            const analysis = await analyzer.analyze(diff);
            progress.report({ message: 'Generating PR packet...' });
            // Generate PR packet
            const generator = new cli_1.PRPacketGenerator();
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
            vscode.window.showInformationMessage(`PR analysis complete: ${diff.files.length} files changed`);
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        // Update sidebar panel with error
        prPanelProvider.showError(errorMessage);
        vscode.window.showErrorMessage(`PR Ready analysis failed: ${errorMessage}`);
        console.error('Analysis error:', error);
    }
}
async function configurePRReady(workspaceRoot) {
    try {
        const configPath = path.join(workspaceRoot, '.prreadyrc.json');
        const configExists = fs.existsSync(configPath);
        if (configExists) {
            // Open existing config
            const doc = await vscode.workspace.openTextDocument(configPath);
            await vscode.window.showTextDocument(doc);
        }
        else {
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
                fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), 'utf-8');
                const doc = await vscode.workspace.openTextDocument(configPath);
                await vscode.window.showTextDocument(doc);
                vscode.window.showInformationMessage('Configuration file created: .prreadyrc.json');
            }
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        vscode.window.showErrorMessage(`Failed to configure PR Ready: ${errorMessage}`);
        console.error('Configuration error:', error);
    }
}
function formatPRPacket(packet) {
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
function deactivate() {
    if (statusBarItem) {
        statusBarItem.dispose();
    }
}
// Made with Bob
//# sourceMappingURL=extension.js.map