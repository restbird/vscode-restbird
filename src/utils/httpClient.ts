"use strict";

import * as fs from 'fs-extra';
import * as iconv from 'iconv-lite';
import { Stream } from 'stream';
import { Headers } from '../models/base';
import { HttpRequest } from '../models/httpRequest';
import { HttpResponse } from '../models/httpResponse';
import { HttpResponseTimingPhases } from '../models/httpResponseTimingPhases';
import { MimeUtility } from './mimeUtility';
import { getHeader } from './misc';

const encodeUrl = require('encodeurl');

const request = require('request');

export class HttpClient {

    public async send(httpRequest: HttpRequest): Promise<HttpResponse> {
        const options = await this.prepareOptions(httpRequest);

        let size = 0;
        let headersSize = 0;
        return new Promise<HttpResponse>((resolve, reject) => {
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

                let contentType = getHeader(response.headers, 'Content-Type');
                let encoding: string;
                if (contentType) {
                    encoding = MimeUtility.parse(contentType).charset;
                }

                if (!encoding) {
                    encoding = "utf8";
                }

                const bodyBuffer: Buffer = Buffer.isBuffer(body) ? body : Buffer.from(body);
                let bodyString: string;
                try {
                    bodyString = iconv.decode(bodyBuffer, encoding);
                } catch {
                    if (encoding !== 'utf8') {
                        bodyString = iconv.decode(bodyBuffer, 'utf8');
                    }
                }

                // adjust response header case, due to the response headers in request package is in lowercase
                let headersDic = HttpClient.getResponseRawHeaderNames(response.rawHeaders);
                let adjustedResponseHeaders: Headers = {};
                for (let header in response.headers) {
                    let adjustedHeaderName = header;
                    if (headersDic[header]) {
                        adjustedHeaderName = headersDic[header];
                        adjustedResponseHeaders[headersDic[header]] = response.headers[header];
                    }
                    adjustedResponseHeaders[adjustedHeaderName] = response.headers[header];
                }

                const requestBody = options.body;

                resolve(new HttpResponse(
                    response.statusCode,
                    response.statusMessage,
                    response.httpVersion,
                    adjustedResponseHeaders,
                    bodyString,
                    response.elapsedTime,
                    size,
                    headersSize,
                    bodyBuffer,
                    new HttpResponseTimingPhases(
                        response.timingPhases.total,
                        response.timingPhases.wait,
                        response.timingPhases.dns,
                        response.timingPhases.tcp,
                        response.timingPhases.firstByte,
                        response.timingPhases.download
                    ),
                    new HttpRequest(
                        options.method,
                        options.url,
                        HttpClient.capitalizeHeaderName(response.toJSON().request.headers),
                        Buffer.isBuffer(requestBody) ? fs.createReadStream(requestBody) : requestBody,
                        httpRequest.rawBody
                    )));
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
    }

    private async prepareOptions(httpRequest: HttpRequest): Promise<{ [key: string]: any }> {
        const originalRequestBody = httpRequest.body;
        let requestBody: string | Buffer;
        if (originalRequestBody) {
            if (typeof originalRequestBody !== 'string') {
                requestBody = await this.convertStreamToBuffer(originalRequestBody);
            } else {
                requestBody = originalRequestBody;
            }
        }

        let options: any = {
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
        let authorization = getHeader(options.headers, 'Authorization');
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
    }

    private async convertStreamToBuffer(stream: Stream): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            const buffers: Buffer[] = [];
            stream.on('data', buffer => buffers.push(typeof buffer === 'string' ? Buffer.from(buffer) : buffer));
            stream.on('end', () => resolve(Buffer.concat(buffers)));
            stream.on('error', error => reject(error));
            (<any>stream).resume();
        });
    }

   
    private static getResponseRawHeaderNames(rawHeaders: string[]): Headers {
        let result: Headers = {};
        rawHeaders.forEach(header => {
            result[header.toLowerCase()] = header;
        });
        return result;
    }

    private static capitalizeHeaderName(headers: Headers): Headers {
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
