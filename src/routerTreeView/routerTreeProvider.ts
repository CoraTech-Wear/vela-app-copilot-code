import * as vscode from 'vscode';

export class RouterTreeDataProvider implements vscode.TreeDataProvider<RouterNode> {
  private _onDidChangeTreeData: vscode.EventEmitter<RouterNode | undefined> = new vscode.EventEmitter<RouterNode | undefined>();
  readonly onDidChangeTreeData: vscode.Event<RouterNode | undefined> = this._onDidChangeTreeData.event;

  constructor() {
    // 模拟一些数据，可以根据需要动态变化
    this.routerNodes = [
      new RouterNode('Home', 'root'),
      new RouterNode('About', 'root'),
      new RouterNode('Contact', 'root'),
    ];
  }

  private routerNodes: RouterNode[];

  getTreeItem(element: RouterNode): vscode.TreeItem {
    return {
      label: element.label,
      collapsibleState: vscode.TreeItemCollapsibleState.None,
      command: {
        command: 'myPlugin.openRouterPage',
        arguments: [element.label],
        title: `Open ${element.label} Page`
      }
    };
  }

  getChildren(element?: RouterNode): Thenable<RouterNode[]> {
    if (!element) {
      return Promise.resolve(this.routerNodes);
    }
    return Promise.resolve([]);
  }

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

}

export class RouterNode {
  constructor(public label: string, public parent: string) {}
}
