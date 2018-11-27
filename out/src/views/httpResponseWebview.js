'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const dispose_1 = require("../utils/dispose");
const baseWebview_1 = require("./baseWebview");
class HttpResponseWebview extends baseWebview_1.BaseWebview {
    get viewType() {
        return 'rest-response';
    }
    constructor() {
        super();
        // Init response webview map
        this.panelResponses = new Map();
    }
    render(response, column) {
        let panel;
        panel = this.panels[this.panels.length - 1];
        panel.title = `Response(${response.elapsedMillionSeconds}ms)`;
        panel.webview.html = this.getHtmlForWebview(response);
        this.panelResponses.set(panel, response);
        HttpResponseWebview.activePreviewResponse = response;
    }
    dispose() {
        dispose_1.disposeAll(this.panels);
    }
    getHtmlForWebview(response) {
        return `  
        <head>
            <link rel="stylesheet" type="text/css" href="${this.styleFilePath}">

        </head>
        <body>
            <div>
            <a id="scroll-to-top" role="button" aria-label="scroll to top" onclick="scroll(0,0)"><span class="icon"></span></a>
            </div>
            <script type="text/javascript" src="${this.scriptFilePath}" charset="UTF-8"></script>
        </body>`;
    }
}
exports.HttpResponseWebview = HttpResponseWebview;
//# sourceMappingURL=httpResponseWebview.js.map