import * as vscode from 'vscode';
import * as path from 'path';

export class ActionsViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(private context: vscode.ExtensionContext) {}

  resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, token: vscode.CancellationToken): void {
    this._view = webviewView;

    // 允许 Webview 执行脚本
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.file(path.join(this.context.extensionPath, 'media'))
      ]
    };

    // 设置 Webview 内容
    webviewView.webview.html = this.getWebviewContent();

    // 在 Webview 中执行 JavaScript
    webviewView.webview.onDidReceiveMessage((message) => {
      switch (message.command) {
        case 'addComponent':
          vscode.window.showInformationMessage('Component added!');
          break;
      }
    });
  }

  private getWebviewContent(): string {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Component Manager</title>
    </head>
    <body>
        <h1>Manage your Components</h1>
        <button onclick="addComponent()">Add New Component</button>
        <script>
            function addComponent() {
                vscode.postMessage({ command: 'addComponent' });
            }
        </script>
    </body>
    </html>`;
  }
}
