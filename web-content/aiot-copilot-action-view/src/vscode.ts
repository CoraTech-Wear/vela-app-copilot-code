// @ts-ignore
export const vscode = typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : {
  postMessage: () => console.warn('VSCode API not available'),
  setState: () => {},
  getState: () => ({}),
};

export function sendMessage(type: string, data?: any) {
  vscode.postMessage({ type, data });
}

export function onMessage(handler: (msg: any) => void) {
  window.addEventListener('message', (event) => handler(event.data));
}
