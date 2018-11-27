"use strict";
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
const iconv = __importStar(require("iconv-lite"));
const httpRequest_1 = require("../models/httpRequest");
const httpResponse_1 = require("../models/httpResponse");
const httpResponseTimingPhases_1 = require("../models/httpResponseTimingPhases");
const mimeUtility_1 = require("./mimeUtility");
const misc_1 = require("./misc");
const encodeUrl = require('encodeurl');
const request = require('request');
class HttpClient {
    send(httpRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = yield this.prepareOptions(httpRequest);
            let size = 0;
            let headersSize = 0;
            return new Promise((resolve, reject) => {
                // const that = this;
                request(options, function (error, response, body) {
                    if (error) {
                        if (error.message) {
                            if (error.message.startsWith("Header name must be a valid HTTP Token")) {
                                error.message = "Header must be in 'header name: header value' format, "
                                    + "please also make sure there is a blank line between headers and body";
                            }
                        }
                        reject(error);
                        return;
                    }
                    let contentType = misc_1.getHeader(response.headers, 'Content-Type');
                    let encoding;
                    if (contentType) {
                        encoding = mimeUtility_1.MimeUtility.parse(contentType).charset;
                    }
                    if (!encoding) {
                        encoding = "utf8";
                    }
                    const bodyBuffer = Buffer.isBuffer(body) ? body : Buffer.from(body);
                    let bodyString;
                    try {
                        bodyString = iconv.decode(bodyBuffer, encoding);
                    }
                    catch (_a) {
                        if (encoding !== 'utf8') {
                            bodyString = iconv.decode(bodyBuffer, 'utf8');
                        }
                    }
                    // adjust response header case, due to the response headers in request package is in lowercase
                    let headersDic = HttpClient.getResponseRawHeaderNames(response.rawHeaders);
                    let adjustedResponseHeaders = {};
                    for (let header in response.headers) {
                        let adjustedHeaderName = header;
                        if (headersDic[header]) {
                            adjustedHeaderName = headersDic[header];
                            adjustedResponseHeaders[headersDic[header]] = response.headers[header];
                        }
                        adjustedResponseHeaders[adjustedHeaderName] = response.headers[header];
                    }
                    const requestBody = options.body;
                    resolve(new httpResponse_1.HttpResponse(response.statusCode, response.statusMessage, response.httpVersion, adjustedResponseHeaders, bodyString, response.elapsedTime, size, headersSize, bodyBuffer, new httpResponseTimingPhases_1.HttpResponseTimingPhases(response.timingPhases.total, response.timingPhases.wait, response.timingPhases.dns, response.timingPhases.tcp, response.timingPhases.firstByte, response.timingPhases.download), new httpRequest_1.HttpRequest(options.method, options.url, HttpClient.capitalizeHeaderName(response.toJSON().request.headers), Buffer.isBuffer(requestBody) ? fs.createReadStream(requestBody) : requestBody, httpRequest.rawBody)));
                })
                    .on('data', function (data) {
                    size += data.length;
                })
                    .on('response', function (response) {
                    if (response.rawHeaders) {
                        headersSize += response.rawHeaders.map(h => h.length).reduce((a, b) => a + b, 0);
                        headersSize += (response.rawHeaders.length) / 2;
                    }
                });
            });
        });
    }
    prepareOptions(httpRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            const originalRequestBody = httpRequest.body;
            let requestBody;
            if (originalRequestBody) {
                if (typeof originalRequestBody !== 'string') {
                    requestBody = yield this.convertStreamToBuffer(originalRequestBody);
                }
                else {
                    requestBody = originalRequestBody;
                }
            }
            let options = {
                url: encodeUrl(httpRequest.url),
                headers: httpRequest.headers,
                method: httpRequest.method,
                body: requestBody,
                encoding: null,
                time: true,
                timeout: 100000,
                gzip: true,
                followRedirect: true,
                jar: false,
                forever: true
            };
            // set auth to digest if Authorization header follows: Authorization: Digest username password
            let authorization = misc_1.getHeader(options.headers, 'Authorization');
            if (authorization) {
                let start = authorization.indexOf(' ');
                let scheme = authorization.substr(0, start);
                if (scheme === 'Digest' || scheme === 'Basic') {
                    let params = authorization.substr(start).trim().split(' ');
                    let [user, pass] = params;
                    if (user && pass) {
                        options.auth = {
                            user,
                            pass,
                            sendImmediately: scheme === 'Basic'
                        };
                    }
                }
            }
            if (!options.headers) {
                options.headers = httpRequest.headers = {};
            }
            return options;
        });
    }
    convertStreamToBuffer(stream) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const buffers = [];
                stream.on('data', buffer => buffers.push(typeof buffer === 'string' ? Buffer.from(buffer) : buffer));
                stream.on('end', () => resolve(Buffer.concat(buffers)));
                stream.on('error', error => reject(error));
                stream.resume();
            });
        });
    }
    static getResponseRawHeaderNames(rawHeaders) {
        let result = {};
        rawHeaders.forEach(header => {
            result[header.toLowerCase()] = header;
        });
        return result;
    }
    static capitalizeHeaderName(headers) {
        let normalizedHeaders = {};
        if (headers) {
            for (let header in headers) {
                let capitalizedName = header.replace(/([^-]+)/g, h => h.charAt(0).toUpperCase() + h.slice(1));
                normalizedHeaders[capitalizedName] = headers[header];
            }
        }
        return normalizedHeaders;
    }
}
exports.HttpClient = HttpClient;
//# sourceMappingURL=httpClient.js.map