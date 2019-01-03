'use strict';

import { EOL } from 'os';
import { ViewColumn, window, workspace } from 'vscode';
import { HttpResponse } from '../models/httpResponse';
import { ResponseFormatUtility } from '../utils/responseFormatUtility';

export class HttpResponseTextDocumentView {

    public constructor() {
    }

    public render(response: HttpResponse, column: ViewColumn) {
        const content = this.getTextDocumentContent(response);
        const language = 'http';
        workspace.openTextDocument({ language, content }).then(document => {
           window.showTextDocument(document, { viewColumn: column, preserveFocus: false, preview: false });
      
        });
    }

    private getTextDocumentContent(response: HttpResponse): string {
        let content = 'Status Code: ' + response.statusCode.toString();
       
        const responseContentType = response.getHeader('content-type');
        const prefix = EOL;
        content += `${prefix}${ResponseFormatUtility.formatBody(response.body, responseContentType, true)}`;

        return content;
    }
}