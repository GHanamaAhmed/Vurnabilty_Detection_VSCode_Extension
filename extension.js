const { parseBearerOutput } = require("./parser");

const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const { getWebviewContent } = require("./webView");
function executeCommand(command, callback) {
  const exec = require("child_process").exec;
  return exec(command, (error, stdout, stderr) => {
    callback(stdout);
  });
}
function activate(context) {
  vscode.window.showInformationMessage("Bearer extension activated");

  let disposable = vscode.commands.registerCommand(
    "extension.showBearerWebView",
    () => {
      vscode.window.showInformationMessage("Showing Bearer webview");

      const panel = vscode.window.createWebviewPanel(
        "bearerWebView",
        "Bearer Webview",
        vscode.ViewColumn.One,
        {
          enableScripts: true, // Enable scripts in the webview
        }
      );

      // Get the path to the extension's directory
      const extensionPath =
        vscode.extensions.getExtension("ghanama.analytique").extensionPath;

      // Construct the path to the bearer executable
      const bearerPath = path.join(extensionPath, "bearer");

      panel.webview.html = getWebviewContent(
        panel.webview,
        context.extensionUri
      );

      panel.webview.onDidReceiveMessage(
        (message) => {
          vscode.window.showInformationMessage(
            `Received message from webview: ${message?.targetPath}`
          );
          if (message.command === "scan") {
            vscode.window.showInformationMessage("Executing scan command");
            let targetPath = message.targetPath;
            switch (targetPath) {
              case "currentFile":
                targetPath = vscode.window.activeTextEditor.document.uri.fsPath;
                break;
              case "currentFolder":
                targetPath = path.dirname(
                  vscode.window.activeTextEditor.document.uri.fsPath
                );
                break;
              case "projectFolder":
                if (vscode.workspace.workspaceFolders) {
                  targetPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
                } else {
                  vscode.window.showErrorMessage(
                    "No workspace is currently opened."
                  );
                  return;
                }
                break;
              default:
                break;
            }
            // Create a new terminal
            vscode.window.showInformationMessage(targetPath);
            // const terminal = vscode.window.createTerminal(`Bearer Terminal`);
            // let terminalOutput = "";
            // terminal.sendText( `${bearerPath} scan "${targetPath}"`);
            // terminal.show();
            executeCommand(`${bearerPath} scan "${targetPath}"`, (output) => {
              const lines = output.split(require("os").EOL);
              if (lines[lines.length - 1] === "") {
                lines.pop();
              }

              // Store the output in a variable
              let bearerOutput = lines.join("\n"); // Join lines back with newlines

              // Optional: Write to file if needed
              // fs.writeFile("file.txt", bearerOutput, (err) => {
              //   // ... (handle errors)
              // });

              // Do something with the bearerOutput variable
              const dataParce = parseBearerOutput(bearerOutput);
              panel.webview.postMessage({ command: "data", data: dataParce });
              console.log("Bearer CLI output:", dataParce);
              // You can use the bearerOutput variable for further processing
              // or send it back to the webview using vscode.postMessage
            });
          }
        },
        undefined,
        context.subscriptions
      );
    }
  );

  context.subscriptions.push(disposable);
}

function deactivate() {
  vscode.window.showInformationMessage("Bearer extension deactivated");
}

module.exports = {
  activate,
  deactivate,
};
