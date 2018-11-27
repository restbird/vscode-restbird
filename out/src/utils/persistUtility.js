'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs-extra"));
class PersistUtility {
    static loadRequests() {
        return PersistUtility.deserializeFromFileAsync(PersistUtility.historyFilePath, PersistUtility.emptyHttpRequestItems);
    }
    static clearRequests() {
        return fs.writeJson(PersistUtility.historyFilePath, PersistUtility.emptyHttpRequestItems);
    }
    static ensureCookieFile() {
        fs.ensureFileSync(PersistUtility.cookieFilePath);
    }
    static ensureFileAsync(path) {
        return fs.ensureFile(path);
    }
    static deserializeFromFileAsync(path, defaultValue = null) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield fs.readJson(path);
            }
            catch (_a) {
                yield fs.ensureFile(path);
                return defaultValue;
            }
        });
    }
}
//public static readonly historyFilePath: string = path.join(os.homedir(), Constants.ExtensionFolderName, Constants.HistoryFileName);
// public static readonly cookieFilePath: string = path.join(os.homedir(), Constants.ExtensionFolderName, Constants.CookieFileName);
// public static readonly environmentFilePath: string = path.join(os.homedir(), Constants.ExtensionFolderName, Constants.EnvironmentFileName);
PersistUtility.emptyHttpRequestItems = [];
exports.PersistUtility = PersistUtility;
//# sourceMappingURL=persistUtility.js.map