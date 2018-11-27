"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = require("os");
const vscode_1 = require("vscode");
const httpRequest_1 = require("../models/httpRequest");
const httpClient_1 = require("../utils/httpClient");
const httpResponseTextDocumentView_1 = require("../views/httpResponseTextDocumentView");
const misc_1 = require("../utils/misc");
const elegantSpinner = require('elegant-spinner');
const spinner = elegantSpinner();
const filesize = require('filesize');
class RequestController {
    constructor() {
        this._durationStatusBarItem = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Left);
        this._sizeStatusBarItem = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Left);
        this._httpClient = new httpClient_1.HttpClient();
        this._textDocumentView = new httpResponseTextDocumentView_1.HttpResponseTextDocumentView();
        this._outputChannel = vscode_1.window.createOutputChannel('REST');
    }
    runDebug() {
        return __awaiter(this, void 0, void 0, function* () {
            let path = misc_1.getAPIPath();
            let config = misc_1.getSettingConfig();
            if (!path.result) {
                vscode_1.window.showErrorMessage(path.message);
                return;
            }
            let host = 'http://127.0.0.1:' + config.port;
            let headers = {};
            headers["Authorization"] = "Basic " + config.user + " " + config.pass;
            headers["content-type"] = "application/json";
            try {
                let httpRequest;
                switch (path.caseType) {
                    case "rest": {
                        const APIs = yield vscode_1.window.showInputBox({
                            validateInput: value => /^(api\d;)+$/.test(value) ? '' : 'delimit with ;, e.g. api0;api1;api3',
                            value: path.api + ";",
                            prompt: 'Input API(s) to debug, delimit with ;, \ne.g. api0;api1;api3;'
                        });
                        vscode_1.window.showInformationMessage('Start generating debugging rest script ...');
                        let url = host + '/v1/rest/run';
                        let rawBody = {
                            casepath: path.casepath,
                            apis: APIs.substr(0, APIs.length - 1).split(';'),
                            isdebug: true,
                            local: path.localProjectPath
                        };
                        httpRequest = new httpRequest_1.HttpRequest("POST", url, headers, JSON.stringify(rawBody), JSON.stringify(rawBody));
                        break;
                    }
                    case "mock": {
                        vscode_1.window.showInformationMessage('Start generating debugging mock script ...');
                        let url = host + '/v1/mock/start?isdebug=true&project=' + path.casepath + '&local=' + path.localProjectPath;
                        httpRequest = new httpRequest_1.HttpRequest("GET", url, headers, "", "");
                        break;
                    }
                    case "task": {
                        vscode_1.window.showInformationMessage('Start generating debugging task script ...');
                        let url = host + '/v1/task/start?isdebug=true&task=' + path.casepath + '&local=' + path.localProjectPath;
                        httpRequest = new httpRequest_1.HttpRequest("GET", url, headers, "", "");
                        break;
                    }
                }
                let response = yield this._httpClient.send(httpRequest);
                if (response.statusCode == 200) {
                    let obj = JSON.parse(response.body);
                    if (obj.code == 0) {
                        if (obj.mainfile) {
                            const dockerRoot = '/data/restbird/';
                            let idx = obj.mainfile.indexOf(dockerRoot);
                            if (idx != -1) {
                                let relativePath = obj.mainfile.substring(dockerRoot.length, obj.mainfile.length);
                                let realPath = path.localProjectPath + "/" + relativePath;
                                vscode_1.workspace.openTextDocument(realPath).then(document => {
                                    vscode_1.window.showTextDocument(document, { preserveFocus: false, preview: false });
                                });
                                vscode_1.window.showInformationMessage(`Successfully generated debug file at ${realPath}, \nYou can start debugging your script`);
                                return;
                            }
                        }
                        else {
                            vscode_1.window.showErrorMessage(`Failed to generate debug files, please check your Restbird docker ersion, Restbird begins to support debug from v3.0 and onwards`);
                        }
                    }
                }
                const activeColumn = vscode_1.window.activeTextEditor.viewColumn;
                this._textDocumentView.render(response, activeColumn);
                vscode_1.window.showErrorMessage('Failed generate debug file, please check error and fix accordingly');
            }
            catch (error) {
                if (error.code === 'ETIMEDOUT') {
                    error.message = `TIMEOUT. Please check your networking connectivity.\n Details: ${error}. `;
                }
                else if (error.code === 'ECONNREFUSED') {
                    error.message = `Connection is being rejected. The Restbird service isn’t running on this server.\n Details: ${error}.`;
                }
                else if (error.code === 'ENETUNREACH') {
                    error.message = `You don't seem to be connected to a network. Details: ${error}`;
                }
                vscode_1.window.showErrorMessage(error.message);
            }
        });
    }
    runRun() {
        return __awaiter(this, void 0, void 0, function* () {
            let rawBody = '{"casepath":"Box/Token", "apis":["api1"] }';
            let headers = {};
            headers["Authorization"] = "Basic YWRtaW46YWRtaW4=";
            headers["content-type"] = "application/json";
            let httpRequest = new httpRequest_1.HttpRequest("POST", "http://127.0.0.1:8080/v1/rest/run", headers, rawBody, rawBody);
            yield this.sendRequest(httpRequest);
        });
    }
    sendRequest(httpRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            // clear status bar
            this.setSendingProgressStatusText();
            // set http request
            try {
                let response = yield this._httpClient.send(httpRequest);
                this.clearSendProgressStatusText();
                this.formatDurationStatusBar(response);
                this.formatSizeStatusBar(response);
                this._sizeStatusBarItem.show();
                try {
                    const activeColumn = vscode_1.window.activeTextEditor.viewColumn;
                    const previewColumn = activeColumn; //
                    this._textDocumentView.render(response, previewColumn);
                    return response;
                }
                catch (reason) {
                    this._outputChannel.appendLine(reason);
                    this._outputChannel.appendLine(reason.stack);
                    vscode_1.window.showErrorMessage(reason);
                }
            }
            catch (error) {
                if (error.code === 'ETIMEDOUT') {
                    error.message = `Please check your networking connectivity and your time out in ms according to your configuration 'rest-client.timeoutinmilliseconds'. Details: ${error}. `;
                }
                else if (error.code === 'ECONNREFUSED') {
                    error.message = `Connection is being rejected. The service isn’t running on the server, or incorrect proxy settings in vscode, or a firewall is blocking requests. Details: ${error}.`;
                }
                else if (error.code === 'ENETUNREACH') {
                    error.message = `You don't seem to be connected to a network. Details: ${error}`;
                }
                this.clearSendProgressStatusText();
                this._durationStatusBarItem.text = '';
                this._outputChannel.appendLine(error);
                this._outputChannel.appendLine(error.stack);
                vscode_1.window.showErrorMessage(error.message);
            }
        });
    }
    dispose() {
        this._durationStatusBarItem.dispose();
        this._sizeStatusBarItem.dispose();
    }
    setSendingProgressStatusText() {
        this.clearSendProgressStatusText();
        this._interval = setInterval(() => {
            this._durationStatusBarItem.text = `Waiting ${spinner()}`;
        }, 50);
        this._durationStatusBarItem.tooltip = 'Waiting Response';
        this._durationStatusBarItem.show();
    }
    clearSendProgressStatusText() {
        clearInterval(this._interval);
        this._sizeStatusBarItem.hide();
    }
    formatDurationStatusBar(response) {
        this._durationStatusBarItem.text = ` $(clock) ${response.elapsedMillionSeconds}ms`;
        this._durationStatusBarItem.tooltip = [
            'Breakdown of Duration:',
            `Socket: ${response.timingPhases.wait.toFixed(1)}ms`,
            `DNS: ${response.timingPhases.dns.toFixed(1)}ms`,
            `TCP: ${response.timingPhases.tcp.toFixed(1)}ms`,
            `FirstByte: ${response.timingPhases.firstByte.toFixed(1)}ms`,
            `Download: ${response.timingPhases.download.toFixed(1)}ms`
        ].join(os_1.EOL);
    }
    formatSizeStatusBar(response) {
        this._sizeStatusBarItem.text = ` $(database) ${filesize(response.bodySizeInBytes + response.headersSizeInBytes)}`;
        this._sizeStatusBarItem.tooltip = [
            'Breakdown of Response Size:',
            `Headers: ${filesize(response.headersSizeInBytes)}`,
            `Body: ${filesize(response.bodySizeInBytes)}`
        ].join(os_1.EOL);
    }
}
exports.RequestController = RequestController;
//# sourceMappingURL=requestController.js.map