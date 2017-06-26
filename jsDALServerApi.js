"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var http = require("http");
var URL = require("url");
var jsDALServerApi = (function () {
    function jsDALServerApi() {
    }
    jsDALServerApi.fetchFromApi = function (serverUrl, apiPath, method, autoParseJson, headers) {
        if (method === void 0) { method = "GET"; }
        if (autoParseJson === void 0) { autoParseJson = true; }
        return new Promise(function (resolve, reject) {
            var url = URL.parse(serverUrl);
            var options = {
                host: url.hostname,
                port: parseInt(url.port),
                path: apiPath,
                method: method,
                headers: __assign({ 'Content-Type': 'application/json' }, headers)
            };
            //var prot = options.port == 443 ? https : http;
            var prot = http;
            var req = prot.request(options, function (res) {
                var output = '';
                var sc = res.statusCode;
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    output += chunk;
                });
                res.on('end', function () {
                    try {
                        var obj = output;
                        if (autoParseJson)
                            obj = JSON.parse(output);
                        resolve({ data: obj, statusCode: sc, headers: res.headers });
                    }
                    catch (ex) {
                        console.log("Failed to parse as JSON...");
                        console.log(output);
                    }
                });
            });
            req.on('error', function (err) {
                reject(err);
            });
            req.end();
        });
    };
    jsDALServerApi.getProjects = function (serverUrl) {
        return jsDALServerApi.fetchFromApi(serverUrl, "/api/jsdal/projects");
    };
    jsDALServerApi.GetDbSourcesOnly = function (serverUrl, projectGuid) {
        return jsDALServerApi.fetchFromApi(serverUrl, "/api/jsdal/dbsources?projectGuid=" + projectGuid);
    };
    jsDALServerApi.GetOutputFiles = function (serverUrl, dbSourceGuid) {
        return jsDALServerApi.fetchFromApi(serverUrl, "/api/jsdal/files?dbSourceGuid=" + dbSourceGuid);
    };
    jsDALServerApi.DownloadJsFile = function (serverUrl, jsFileGuid, version, minified, etag) {
        var headers = {};
        if (etag) {
            headers["If-None-Match"] = etag;
        }
        return new Promise(function (resolve, reject) {
            jsDALServerApi.fetchFromApi(serverUrl, "/api/js/" + jsFileGuid + "?v=" + version + "&min=" + minified, "GET", false, headers).then(function (r) {
                if (r.statusCode == 200) {
                    var newVersion = version;
                    if (r.headers && r.headers['jsfver']) {
                        newVersion = parseInt(r.headers['jsfver']);
                    }
                    resolve({ data: r.data, version: newVersion });
                }
                else {
                    reject(r);
                }
                return r;
            }).catch(function (e) {
                reject(e);
            });
        });
    };
    jsDALServerApi.DownloadTypeScriptDefinition = function (serverUrl, jsFileGuid) {
        return new Promise(function (resolve, reject) {
            jsDALServerApi.fetchFromApi(serverUrl, "/api/js/" + jsFileGuid + "?&min=false&tsd=true&v=0", "GET", false).then(function (r) {
                if (r.statusCode == 200) {
                    resolve({ data: r.data });
                }
                else {
                    reject(r);
                }
                return r;
            }).catch(function (e) {
                reject(e);
            });
        });
    };
    jsDALServerApi.DownloadCommonTypeScriptDefinitions = function (serverUrl) {
        return jsDALServerApi.fetchFromApi(serverUrl, "/api/tsd/common", 'GET', false).then(function (r) { return r.data; });
    };
    return jsDALServerApi;
}());
exports.jsDALServerApi = jsDALServerApi;
//# sourceMappingURL=f:/00-Work/Projects/jsDALEditor/jsDAL-CLI/jsdal-cli/jsDALServerApi.js.map