'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {RequestController} from "./controllers/requestController";


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "vscode-restbird" is now active!');

    let requestController = new RequestController();

    context.subscriptions.push(requestController);

  //  context.subscriptions.push(vscode.commands.registerCommand('restbird.request',(document: vscode.TextDocument, range: vscode.Range) =>{
  //      requestController.run(range);
  //  }));

    

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    context.subscriptions.push(vscode.commands.registerCommand('restbird.debugScript', () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        vscode.window.showInformationMessage('Start to run Restbird debug script!');
        requestController.runDebug();
    }));

  //  context.subscriptions.push(vscode.commands.registerCommand('restbird.runScript', () => {
  //      vscode.window.showInformationMessage('Start to run Restbird run script!');
  //      requestController.runRun();
  //  }));
}

// this method is called when your extension is deactivated
export function deactivate() {
}