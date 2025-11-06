import path from 'path';
import * as vscode from 'vscode';

export class ActionViewPanel {
  private panel: vscode.WebviewPanel | undefined;
  private extensionPath: string;

  constructor(context: vscode.ExtensionContext) {
    this.panel = undefined;
    this.extensionPath = context.extensionPath;
  }

  public createOrShowPanel(): void {
    if (this.panel) {
      this.panel.reveal(vscode.ViewColumn.One);
    } else {
      this.panel = vscode.window.createWebviewPanel(
        'componentManager', // Webview id
        'Component Manager', // Webview title
        vscode.ViewColumn.One, // 编辑器列
        {
          enableScripts: true,
          localResourceRoots: [vscode.Uri.file(path.join(this.extensionPath, 'media'))]
        }
      );

      // 绑定 Webview 内容
      this.panel.webview.html = this.getWebviewContent();
    }
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
        <button onclick="alert('Add Component')">Add New Component</button>
    </body>
    </html>`;
  }
}
