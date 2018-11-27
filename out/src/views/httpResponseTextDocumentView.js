'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = require("os");
const vscode_1 = require("vscode");
const responseFormatUtility_1 = require("../utils/responseFormatUtility");
class HttpResponseTextDocumentView {
    constructor() {
    }
    render(response, column) {
        const content = this.getTextDocumentContent(response);
        const language = 'http';
        vscode_1.workspace.openTextDocument({ language, content }).then(document => {
            vscode_1.window.showTextDocument(document, { viewColumn: column, preserveFocus: false, preview: false });
        });
    }
    getTextDocumentContent(response) {
        let content = '';
        const responseContentType = response.getHeader('content-type');
        const prefix = os_1.EOL;
        content += `${prefix}${responseFormatUtility_1.ResponseFormatUtility.formatBody(response.body, responseContentType, true)}`;
        return content;
    }
}
exports.HttpResponseTextDocumentView = HttpResponseTextDocumentView;
//# sourceMappingURL=httpResponseTextDocumentView.js.map