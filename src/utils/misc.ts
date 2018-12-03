"use strict";

import * as crypto from 'crypto';
import { Headers } from '../models/base';
import {window, workspace} from 'vscode';
import * as pathutil from 'path';


export function getHeader(headers: Headers, name: string): string {
    if (!headers || !name) {
        return null;
    }

    const headerName = Object.keys(headers).find(h => h.toLowerCase() === name.toLowerCase());
    return headerName && headers[headerName];
}

export function hasHeader(headers: Headers, name: string): boolean {
    return !!(headers && name && Object.keys(headers).some(h => h.toLowerCase() === name.toLowerCase()));
}

export function calculateMD5Hash(text: string | Buffer): string {
    return crypto.createHash('md5').update(text).digest('hex');
}

export function isJSONString(text: string): boolean {
    try {
        JSON.parse(text);
        return true;
    } catch {
        return false;
    }
}

export function getSettingConfig(): {port: string; user:string; pass:string} {

    let port: string;
    let user: string;
    let pass: string;

    const editor = window.activeTextEditor;
    const resource = editor.document.uri;
    const global = workspace.getConfiguration('global', resource);
    port = global.get('serverPort');

    const credential = workspace.getConfiguration('credential', resource);
    user = credential.get('username');
    pass = credential.get('password');


    return { port, user, pass };
}

export function getCaseType(path: string): {caseType: string; path: string; result: boolean; message: string} {
    let caseType: string;
    let result: boolean;
    let message: string;
    result = true;
    // const restPathStart = '/restbird/projects/rest/';
    // const mockPathStart = '/restbird/projects/mock/';
    // const taskPathStart = '/restbird/projects/task/';
    const restPathStart = pathutil.join('projects','rest');
    const mockPathStart = pathutil.join('projects','mock');
    const taskPathStart = pathutil.join('projects','task');


    let idx = path.indexOf(restPathStart);
    if(idx != -1){
        caseType = "rest";
        path = path.substring(idx + restPathStart.length + 1);

        return{caseType, path, result, message};
    }else{
        let idx = path.indexOf(mockPathStart);
        if(idx != -1){
            caseType = "mock";
            path = path.substring(idx + mockPathStart.length + 1);

            return{caseType, path, result, message};
        }else{
            let idx = path.indexOf(taskPathStart);
            if(idx != -1){
                caseType = "task";
                path = path.substring(idx + taskPathStart.length + 1);
    
                return{caseType, path, result, message};
            }
        }
    }
    result = false;
    message = "unsupported debug case type";
    return{caseType, path, result, message};
}

export function getAPIPath(): {caseType: string; casepath: string; api:string; localProjectPath:string; result: boolean; message: string} {

    let caseType: string;
    let casepath: string;
    let api: string;
    let localProjectPath: string;
    let result: boolean;
    let message: string;

 
    const editor = window.activeTextEditor;

    const resource = editor.document.uri;
    if (resource.scheme === 'file') {
        //const restbirdPathStart = '/restbird/projects/' ;
        const restbirdPathStart = pathutil.join('projects') ;
        let path = resource.fsPath;
        let pathObj = pathutil.parse(path);
        let idx = pathObj.dir.indexOf(restbirdPathStart);
        if(idx != -1){
            localProjectPath = path.substring(0, idx-1);
            let caseInfo = getCaseType(resource.fsPath);
            if(caseInfo.result){
                caseType = caseInfo.caseType;
                path = caseInfo.path;
                const pathReg = /(\\*)+api\d/;
                var matchArray = pathReg.exec(caseInfo.path);
                if(matchArray != null){
  
                    api = matchArray[0];
    
                    let splitArray = path.split(pathReg);
                    casepath = splitArray[0];
                    if(casepath.endsWith(pathutil.sep)){
                        casepath = casepath.substring(0, casepath.length-1);
                    }
                    result = true;
                    return { caseType, casepath, api, localProjectPath, result, message };
                }else{ 
                    // if(caseType == "mock"){
                    //     const mockTaskPathEnd = '/mocktask.go';
                    //     let idx = path.indexOf(mockTaskPathEnd);
                    //     if(idx != -1){
                    //         casepath = path.substring(0, idx);
                    //         result = true;
                    //         return{caseType, casepath, api, localProjectPath, result, message};
                    //     }
                    // }else 
                    if(caseType = "task"){
                        const mockTaskPathEnd = 'task.go';
                        const taskfilename = 'task';
                        if(pathObj.name == taskfilename){
                            let idx = path.indexOf(mockTaskPathEnd);
                            if(idx != -1){
                                casepath = path.substring(0, idx-1);
                                result = true;
                                return{caseType, casepath, api, localProjectPath, result, message};
                            }else{
                                const mockTaskPathPyEnd = 'task.py';
                                let idx = path.indexOf(mockTaskPathPyEnd);
                                if(idx != -1){
                                    casepath = path.substring(0, idx-1);
                                    result = true;
                                    return{caseType, casepath, api, localProjectPath, result, message};
                                }
                            }
                        }
                    }
                }

            }else{
                result = false;
                message = caseInfo.message;
                return { caseType, casepath, api, localProjectPath, result, message };
            }
        }
      
    }
    result = false;
    message = "Not a valid restbird project: " + resource.fsPath;
   
    return { caseType, casepath, api, localProjectPath, result, message };
}


