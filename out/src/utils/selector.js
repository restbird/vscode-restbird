"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
//import { Range, TextEditor } from 'vscode';
const Constants = __importStar(require("../common/constants"));
class Selector {
    static getDelimiterRows(lines) {
        let rows = [];
        for (let index = 0; index < lines.length; index++) {
            if (lines[index].match(/^#{3,}/)) {
                rows.push(index);
            }
        }
        return rows;
    }
    static getRequestVariableDefinitionName(text) {
        const matched = text.match(Constants.RequestVariableDefinitionRegex);
        return matched && matched[1];
    }
    static isCommentLine(line) {
        return Constants.CommentIdentifiersRegex.test(line);
    }
    static isEmptyLine(line) {
        return line.trim() === '';
    }
    static isVariableDefinitionLine(line) {
        return Constants.FileVariableDefinitionRegex.test(line);
    }
}
Selector.responseStatusLineRegex = /^\s*HTTP\/[\d.]+/;
exports.Selector = Selector;
//# sourceMappingURL=selector.js.map