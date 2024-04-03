const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
function getWebviewContent(webview, extensionUri) {
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(extensionUri, "media", "vscode.css")
    );
    return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Bearer Webview</title>
        <link href="${styleVSCodeUri}" rel="stylesheet" />
      </head>
      <body>
        <div>
          <label for="targetPath">Select target:</label>
          <select id="targetPath" style="margin-bottom: 5px">
            <option value="currentFile">Current File</option>
            <option value="currentFolder">Current Folder</option>
            <option value="projectFolder">Project Folder</option>
          </select>
          <button id="scan">Scan</button>
        </div>
        <div>
          <ul id="data"></ul>
        </div>
        <script>
          (function () {
            const vscode = acquireVsCodeApi();
            const scan = document.getElementById("scan");
            scan.addEventListener("click", () => {
              const selectedTarget = document.getElementById("targetPath").value;
              vscode.postMessage({ command: "scan", targetPath: selectedTarget });
            });
          })();
          (function () {
            const ul = document.getElementById("data");
            window.addEventListener('message', event => {
                const message = event.data;
              if (message.command === "data") {
                ul.innerHTML = message.data?.HIGH?.map(
                  (e) => "<li>"+e?.name+"</li>"
                )
              }
            });
          })();
        </script>
      </body>
    </html>
    `;
  }
  
module.exports = { getWebviewContent };
