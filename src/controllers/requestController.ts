"use strict";

import { EOL } from 'os';
import { OutputChannel, StatusBarAlignment, StatusBarItem, workspace, window } from 'vscode';
import { HttpRequest } from '../models/httpRequest';
import { HttpResponse } from '../models/httpResponse';
import { HttpClient } from '../utils/httpClient';
import { HttpResponseTextDocumentView } from '../views/httpResponseTextDocumentView';
import { Headers } from '../models/base';
import { getSettingConfig, getAPIPath } from '../utils/misc';

const elegantSpinner = require('elegant-spinner');
const spinner = elegantSpinner();

const filesize = require('filesize');


export class RequestController {
    private _durationStatusBarItem: StatusBarItem;
    private _sizeStatusBarItem: StatusBarItem;
    private _httpClient: HttpClient;
    private _interval: NodeJS.Timer;
    private _textDocumentView: HttpResponseTextDocumentView;
    private _outputChannel: OutputChannel;

    public constructor() {
        this._durationStatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
        this._sizeStatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
        this._httpClient = new HttpClient();
     
        this._textDocumentView = new HttpResponseTextDocumentView();
        this._outputChannel = window.createOutputChannel('REST');
    }

    public async runDebug(){
        let path = getAPIPath();
        let config = getSettingConfig();

        if(!path.result){
            window.showErrorMessage(path.message);
            return;
        }

        let host =  'http://127.0.0.1:' + config.port; 
        let headers: Headers = {};
        headers["Authorization"] = "Basic " + config.user + " " + config.pass;
        headers["content-type"] = "application/json";
        
        try{
            let httpRequest : HttpRequest;
            switch (path.caseType){
                case "rest" :{
                    const APIs = await window.showInputBox({
                        validateInput: value =>  /^(api\d;)+$/.test(value) ? '' : 'delimit with ;, e.g. api0;api1;api3',
                        value: path.api + ";",
                        prompt: 'Input API(s) to debug, delimit with ;, \ne.g. api0;api1;api3;'
                    });                   
                    
                    window.showInformationMessage('Start generating debugging rest script ...');
        
                    let url = host + '/v1/rest/run';
                    let rawBody = {
                        casepath: path.casepath,
                        apis: APIs.substr(0, APIs.length-1).split(';'),
                        isdebug: true,
                        local: path.localProjectPath
                    };
                    httpRequest = new HttpRequest("POST", url,headers, JSON.stringify(rawBody), JSON.stringify(rawBody));
                    break;
                }
                case "mock" :{
                    window.showInformationMessage('Start generating debugging mock script ...');
        
                    let url = host + '/v1/mock/start?isdebug=true&project=' + path.casepath + '&local=' + path.localProjectPath;
                   
                    httpRequest = new HttpRequest("GET", url,headers, "","");
                    break;
                }
                case "task" :{
                    window.showInformationMessage('Start generating debugging task script ...');
        
                    let url = host + '/v1/task/start?isdebug=true&task=' + path.casepath + '&local=' + path.localProjectPath;
                   
                    httpRequest = new HttpRequest("GET", url,headers, "","");
                    break;
                }
            }

            let response = await this._httpClient.send(httpRequest);
            if(response.statusCode == 200){

                let obj = JSON.parse(response.body);
                if(obj.code == 0){          
                    if(obj.mainfile){ 
                        const dockerRoot = '/data/restbird/';
                        let idx = obj.mainfile.indexOf(dockerRoot);
                        if(idx != -1){
                            let relativePath = obj.mainfile.substring(dockerRoot.length, obj.mainfile.length);
                            let realPath = path.localProjectPath + "/" + relativePath;

                            workspace.openTextDocument(realPath).then(document => {
                                window.showTextDocument(document, { preserveFocus: false, preview: false });
                        
                            });
                            window.showInformationMessage(`Successfully generated debug file at ${realPath}, \nYou can start debugging your script`);
                            return;  
                        }
                    }else{
                        window.showErrorMessage(`Failed to generate debug files, please check your Restbird docker ersion, Restbird begins to support debug from v3.0 and onwards`)
                    }   
                }
            }
            const activeColumn = window.activeTextEditor.viewColumn;
            this._textDocumentView.render(response, activeColumn);
            window.showErrorMessage('Failed generate debug file, please check error and fix accordingly');  
        }catch (error) {
            if (error.code === 'ETIMEDOUT') {
                error.message = `TIMEOUT. Please check your networking connectivity.\n Details: ${error}. `;
            } else if (error.code === 'ECONNREFUSED') {
                error.message = `Connection is being rejected. The Restbird service isn’t running on this server.\n Details: ${error}.`;
            } else if (error.code === 'ENETUNREACH') {
                error.message = `You don't seem to be connected to a network. Details: ${error}`;
            }

            window.showErrorMessage(error.message);
        }

    }

    public async runRun(){
        let rawBody = '{"casepath":"Box/Token", "apis":["api1"] }';
        let headers: Headers = {};
        headers["Authorization"] = "Basic YWRtaW46YWRtaW4=";
        headers["content-type"] = "application/json";
        let httpRequest = new HttpRequest("POST", "http://127.0.0.1:8080/v1/rest/run",headers, rawBody, rawBody);

        await this.sendRequest(httpRequest);
    }

    private async sendRequest(httpRequest: HttpRequest) : Promise<HttpResponse>  {
        // clear status bar
        this.setSendingProgressStatusText();

        // set http request
        try {
            let response = await this._httpClient.send(httpRequest);

            this.clearSendProgressStatusText();
            this.formatDurationStatusBar(response);

            this.formatSizeStatusBar(response);
            this._sizeStatusBarItem.show();

            try {
                const activeColumn = window.activeTextEditor.viewColumn;
                const previewColumn = activeColumn;//
                   
                this._textDocumentView.render(response, previewColumn);
              
                return response;
            } catch (reason) {
                this._outputChannel.appendLine(reason);
                this._outputChannel.appendLine(reason.stack);
                window.showErrorMessage(reason);
            }

        } catch (error) {

            if (error.code === 'ETIMEDOUT') {
                error.message = `Please check your networking connectivity and your time out in ms according to your configuration 'rest-client.timeoutinmilliseconds'. Details: ${error}. `;
            } else if (error.code === 'ECONNREFUSED') {
                error.message = `Connection is being rejected. The service isn’t running on the server, or incorrect proxy settings in vscode, or a firewall is blocking requests. Details: ${error}.`;
            } else if (error.code === 'ENETUNREACH') {
                error.message = `You don't seem to be connected to a network. Details: ${error}`;
            }
            this.clearSendProgressStatusText();
            this._durationStatusBarItem.text = '';
            this._outputChannel.appendLine(error);
            this._outputChannel.appendLine(error.stack);
            window.showErrorMessage(error.message);
        } 
    }

    public dispose() {
        this._durationStatusBarItem.dispose();
        this._sizeStatusBarItem.dispose();
    }

    private setSendingProgressStatusText() {
        this.clearSendProgressStatusText();
        this._interval = setInterval(() => {
            this._durationStatusBarItem.text = `Waiting ${spinner()}`;
        }, 50);
        this._durationStatusBarItem.tooltip = 'Waiting Response';
        this._durationStatusBarItem.show();
    }

    private clearSendProgressStatusText() {
        clearInterval(this._interval);
        this._sizeStatusBarItem.hide();
    }

    private formatDurationStatusBar(response: HttpResponse) {
        this._durationStatusBarItem.text = ` $(clock) ${response.elapsedMillionSeconds}ms`;
        this._durationStatusBarItem.tooltip = [
            'Breakdown of Duration:',
            `Socket: ${response.timingPhases.wait.toFixed(1)}ms`,
            `DNS: ${response.timingPhases.dns.toFixed(1)}ms`,
            `TCP: ${response.timingPhases.tcp.toFixed(1)}ms`,
            `FirstByte: ${response.timingPhases.firstByte.toFixed(1)}ms`,
            `Download: ${response.timingPhases.download.toFixed(1)}ms`
        ].join(EOL);
    }

    private formatSizeStatusBar(response: HttpResponse) {
        this._sizeStatusBarItem.text = ` $(database) ${filesize(response.bodySizeInBytes + response.headersSizeInBytes)}`;
        this._sizeStatusBarItem.tooltip = [
            'Breakdown of Response Size:',
            `Headers: ${filesize(response.headersSizeInBytes)}`,
            `Body: ${filesize(response.bodySizeInBytes)}`
        ].join(EOL);
    }
}