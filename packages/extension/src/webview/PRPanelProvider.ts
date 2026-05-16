import * as vscode from 'vscode';
import * as path from 'path';
import { PRPacket } from '@pr-ready/shared';

export class PRPanelProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'prReady.prPanel';
  private _view?: vscode.WebviewView;
  private _currentPacket?: PRPacket;
  private _error?: string;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage((data) => {
      switch (data.type) {
        case 'copy':
          this._handleCopy(data.content);
          break;
        case 'runAnalysis':
          vscode.commands.executeCommand('prReady.analyze');
          break;
      }
    });
  }

  public updatePacket(packet: PRPacket) {
    this._currentPacket = packet;
    this._error = undefined;
    if (this._view) {
      this._view.webview.postMessage({
        type: 'update',
        packet: packet,
      });
    }
  }

  public showError(error: string) {
    this._error = error;
    this._currentPacket = undefined;
    if (this._view) {
      this._view.webview.postMessage({
        type: 'error',
        error: error,
      });
    }
  }

  private _handleCopy(content: string) {
    vscode.env.clipboard.writeText(content).then(() => {
      vscode.window.showInformationMessage('Copied to clipboard');
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'src', 'webview', 'style.css')
    );
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'src', 'webview', 'script.js')
    );

    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <link href="${styleUri}" rel="stylesheet">
  <title>PR Ready</title>
</head>
<body>
  <div id="app">
    <div id="empty-state" class="state-container">
      <div class="icon">📋</div>
      <h2>No PR Analysis Yet</h2>
      <p>Run "PR Ready: Analyze Changes" to generate a PR packet</p>
      <button class="action-button" onclick="runAnalysis()">Analyze Changes</button>
    </div>
    <div id="error-state" class="state-container" style="display: none;">
      <div class="icon">⚠️</div>
      <h2>Analysis Failed</h2>
      <p id="error-message"></p>
      <button class="action-button" onclick="runAnalysis()">Try Again</button>
    </div>
    <div id="content" style="display: none;">
      <div class="header">
        <h1>PR Analysis</h1>
        <button class="copy-button copy-all" onclick="copyAll()">
          <span class="icon">📋</span> Copy All
        </button>
      </div>
      
      <div class="section" id="summary-section">
        <div class="section-header">
          <h2>Summary</h2>
          <button class="copy-button" onclick="copySection('summary')">
            <span class="icon">📋</span> Copy
          </button>
        </div>
        <div class="section-content" id="summary-content"></div>
      </div>

      <div class="section" id="metadata-section">
        <div class="section-header">
          <h2>Metadata</h2>
        </div>
        <div class="section-content metadata" id="metadata-content"></div>
      </div>

      <div class="section" id="files-section">
        <div class="section-header">
          <h2>Files Changed</h2>
          <button class="copy-button" onclick="copySection('files')">
            <span class="icon">📋</span> Copy
          </button>
        </div>
        <div class="section-content" id="files-content"></div>
      </div>

      <div class="section" id="tests-section">
        <div class="section-header">
          <h2>Test Status</h2>
          <button class="copy-button" onclick="copySection('tests')">
            <span class="icon">📋</span> Copy
          </button>
        </div>
        <div class="section-content" id="tests-content"></div>
      </div>

      <div class="section" id="risks-section">
        <div class="section-header">
          <h2>Risk Flags</h2>
          <button class="copy-button" onclick="copySection('risks')">
            <span class="icon">📋</span> Copy
          </button>
        </div>
        <div class="section-content" id="risks-content"></div>
      </div>

      <div class="section" id="checklist-section">
        <div class="section-header">
          <h2>Reviewer Checklist</h2>
          <button class="copy-button" onclick="copySection('checklist')">
            <span class="icon">📋</span> Copy
          </button>
        </div>
        <div class="section-content" id="checklist-content"></div>
      </div>
    </div>
  </div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// Made with Bob
