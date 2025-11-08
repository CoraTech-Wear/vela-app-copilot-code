import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export class ActionsViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(private context: vscode.ExtensionContext) { }

  resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, token: vscode.CancellationToken): void {
    this._view = webviewView;

    // 允许 Webview 执行脚本

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.file(path.join(this.context.extensionPath, 'media', 'aiot-copilot-action-view'))],
    };

    // 设置 Webview 内容
    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // 在 Webview 中执行 JavaScript
    webviewView.webview.onDidReceiveMessage((message) => {
      switch (message.command) {
        case 'addComponent':
          vscode.window.showInformationMessage('Component added!');
          break;
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const mediaPath = path.join(this.context.extensionPath, 'media', 'aiot-copilot-action-view');
    const indexPath = path.join(mediaPath, 'index.html');
    let html = fs.readFileSync(indexPath, 'utf8');

    const baseUri = webview.asWebviewUri(vscode.Uri.file(mediaPath));


    html = html.replace(
      /(<head.*?>)/,
      `$1<base href="${baseUri}/">`
    );

    return html;
  }
}