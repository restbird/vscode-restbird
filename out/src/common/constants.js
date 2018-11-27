'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtensionId = 'Restbird.vscode-restbird';
exports.CommentIdentifiersRegex = /^\s*(#|\/{2})/;
exports.FileVariableDefinitionRegex = /^\s*@([^\s=]+)\s*=\s*(\S+)\s*$/;
exports.RequestVariableDefinitionWithNameRegexFactory = (name, flags) => new RegExp(`^\\s*(?:#{1,}|\\/{2,})\\s+@name\\s+(${name})\\s*$`, flags);
exports.RequestVariableDefinitionRegex = exports.RequestVariableDefinitionWithNameRegexFactory("\\w+", "m");
exports.LineSplitterRegex = /\r?\n/g;
//# sourceMappingURL=constants.js.map