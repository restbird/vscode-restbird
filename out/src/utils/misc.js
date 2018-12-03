"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = __importStar(require("crypto"));
const vscode_1 = require("vscode");
const pathutil = __importStar(require("path"));
function getHeader(headers, name) {
    if (!headers || !name) {
        return null;
    }
    const headerName = Object.keys(headers).find(h => h.toLowerCase() === name.toLowerCase());
    return headerName && headers[headerName];
}
exports.getHeader = getHeader;
function hasHeader(headers, name) {
    return !!(headers && name && Object.keys(headers).some(h => h.toLowerCase() === name.toLowerCase()));
}
exports.hasHeader = hasHeader;
function calculateMD5Hash(text) {
    return crypto.createHash('md5').update(text).digest('hex');
}
exports.calculateMD5Hash = calculateMD5Hash;
function isJSONString(text) {
    try {
        JSON.parse(text);
        return true;
    }
    catch (_a) {
        return false;
    }
}
exports.isJSONString = isJSONString;
function getSettingConfig() {
    let port;
    let user;
    let pass;
    const editor = vscode_1.window.activeTextEditor;
    const resource = editor.document.uri;
    const global = vscode_1.workspace.getConfiguration('global', resource);
    port = global.get('serverPort');
    const credential = vscode_1.workspace.getConfiguration('credential', resource);
    user = credential.get('username');
    pass = credential.get('password');
    return { port, user, pass };
}
exports.getSettingConfig = getSettingConfig;
function getCaseType(path) {
    let caseType;
    let result;
    let message;
    result = true;
    // const restPathStart = '/restbird/projects/rest/';
    // const mockPathStart = '/restbird/projects/mock/';
    // const taskPathStart = '/restbird/projects/task/';
    const restPathStart = pathutil.join('projects', 'rest');
    const mockPathStart = pathutil.join('projects', 'mock');
    const taskPathStart = pathutil.join('projects', 'task');
    let idx = path.indexOf(restPathStart);
    if (idx != -1) {
        caseType = "rest";
        path = path.substring(idx + restPathStart.length + 1);
        return { caseType, path, result, message };
    }
    else {
        let idx = path.indexOf(mockPathStart);
        if (idx != -1) {
            caseType = "mock";
            path = path.substring(idx + mockPathStart.length + 1);
            return { caseType, path, result, message };
        }
        else {
            let idx = path.indexOf(taskPathStart);
            if (idx != -1) {
                caseType = "task";
                path = path.substring(idx + taskPathStart.length + 1);
                return { caseType, path, result, message };
            }
        }
    }
    result = false;
    message = "unsupported debug case type";
    return { caseType, path, result, message };
}
exports.getCaseType = getCaseType;
function getAPIPath() {
    let caseType;
    let casepath;
    let api;
    let localProjectPath;
    let result;
    let message;
    const editor = vscode_1.window.activeTextEditor;
    const resource = editor.document.uri;
    if (resource.scheme === 'file') {
        //const restbirdPathStart = '/restbird/projects/' ;
        const restbirdPathStart = pathutil.join('projects');
        let path = resource.fsPath;
        let pathObj = pathutil.parse(path);
        let idx = pathObj.dir.indexOf(restbirdPathStart);
        if (idx != -1) {
            localProjectPath = path.substring(0, idx - 1);
            let caseInfo = getCaseType(resource.fsPath);
            if (caseInfo.result) {
                caseType = caseInfo.caseType;
                path = caseInfo.path;
                const pathReg = /(\\*)+api\d/;
                var matchArray = pathReg.exec(caseInfo.path);
                if (matchArray != null) {
                    api = matchArray[0];
                    let splitArray = path.split(pathReg);
                    casepath = splitArray[0];
                    if (casepath.endsWith(pathutil.sep)) {
                        casepath = casepath.substring(0, casepath.length - 1);
                    }
                    result = true;
                    return { caseType, casepath, api, localProjectPath, result, message };
                }
                else {
                    // if(caseType == "mock"){
                    //     const mockTaskPathEnd = '/mocktask.go';
                    //     let idx = path.indexOf(mockTaskPathEnd);
                    //     if(idx != -1){
                    //         casepath = path.substring(0, idx);
                    //         result = true;
                    //         return{caseType, casepath, api, localProjectPath, result, message};
                    //     }
                    // }else 
                    if (caseType = "task") {
                        const mockTaskPathEnd = 'task.go';
                        const taskfilename = 'task';
                        if (pathObj.name == taskfilename) {
                            let idx = path.indexOf(mockTaskPathEnd);
                            if (idx != -1) {
                                casepath = path.substring(0, idx - 1);
                                result = true;
                                return { caseType, casepath, api, localProjectPath, result, message };
                            }
                            else {
                                const mockTaskPathPyEnd = 'task.py';
                                let idx = path.indexOf(mockTaskPathPyEnd);
                                if (idx != -1) {
                                    casepath = path.substring(0, idx - 1);
                                    result = true;
                                    return { caseType, casepath, api, localProjectPath, result, message };
                                }
                            }
                        }
                    }
                }
            }
            else {
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
exports.getAPIPath = getAPIPath;
//# sourceMappingURL=misc.js.map