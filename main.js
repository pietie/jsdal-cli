"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var jsDALServerApi_1 = require("./jsDALServerApi");
var jsdal_config_1 = require("./jsdal-config");
var path = require("path");
var fs = require("fs");
var crypto = require("crypto");
var async = require("async");
var chalk = require("chalk");
var shelljs = require("shelljs");
var util_1 = require("./util");
var Main = (function () {
    function Main() {
    }
    Main.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var main;
            return __generator(this, function (_a) {
                main = new Main();
                main.main();
                return [2 /*return*/];
            });
        });
    };
    Main.prototype.enumerateJsDalFiles = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var folder, configs;
                        return __generator(this, function (_a) {
                            folder = './';
                            configs = [];
                            fs.readdir(folder, function (err, files) {
                                var jsDALFiles = files.filter(function (f) { return f.endsWith(".jsDAL"); });
                                console.log(chalk.grey("Found (" + jsDALFiles.length + ") .jsDAL file(s) in the current directory."));
                                jsDALFiles.forEach(function (filePath) {
                                    try {
                                        var data = fs.readFileSync(filePath, "utf8");
                                        var config = new jsdal_config_1.JsDALConfig().deserialize(JSON.parse(data));
                                        config.ConfigFilePath = path.resolve(filePath);
                                        console.log("\t" + chalk.green(filePath) + " (" + chalk.bgWhite.blue(config.jsDALServerUrl) + ")");
                                        configs.push(config);
                                    }
                                    catch (e) {
                                        console.log(chalk.red("Failed to JSON.parse \"" + filePath + "\" with error:"));
                                        console.log(chalk.red(e.toString()));
                                    }
                                });
                                resolve(configs);
                            });
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    Main.prototype.main = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var _a, e_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = this;
                        return [4 /*yield*/, this.enumerateJsDalFiles()];
                    case 1:
                        _a.configs = _b.sent();
                        // TODO: Retrieve project list from server!!!?
                        async.forEach(this.configs, function (conf) {
                            jsDALServerApi_1.jsDALServerApi.getProjects(conf.jsDALServerUrl).then(function (r) {
                                // TODO: update config from here
                                console.info("RESP!!!", r.data);
                            });
                            setInterval(function () {
                                // TODO: setInterval is a bad idea
                                _this.processConfig(conf);
                            }, 2000);
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _b.sent();
                        console.error(e_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Main.prototype.processConfig = function (conf) {
        // clear the screen
        //!process.stdout.write('\x1B[2J\x1B[0f');
        var _this = this;
        async.forEach(conf.ProjectList, function (project) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, jsDALServerApi_1.jsDALServerApi.GetDbSourcesOnly(conf.jsDALServerUrl, project.Guid).then(function (r) {
                            if (r.statusCode == 404 /*NOT FOUND*/) {
                                // TODO: Project not found, remove?
                                return;
                            }
                            var dbSourceObjects = jsdal_config_1.JsDALDbSource.deserialize(r.data);
                            project.updateFrom(dbSourceObjects);
                        }).catch(function (e) {
                            if (e.code == 'ECONNREFUSED') {
                                console.info("Failed to connect!", conf.jsDALServerUrl);
                            }
                            else {
                                console.dir(e);
                                console.log("***" + e.toString());
                            }
                        })];
                    case 1:
                        _a.sent();
                        /////////////////////////////////////////////
                        // Check DB sources for output file changes
                        {
                            /*
                            var sourceToCheck = this.configs.map(c=>c.ProjectList) // project each config's Project list
                                        .reduce((p1,p2)=>p1.concat(p2)) // combine all the different Project lists (across all configs) into a *single* array
                                        .map(p=>p.Sources) // project only the sources property
                                        .reduce((p1,p2)=>p1.concat(p2)); // combine all sources to check into one flat array
                
                            //console.log("sourceToCheck:", sourceToCheck.length, sourceToCheck)
                            */
                            conf.ProjectList.forEach(function (proj) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.processDbSources(conf, proj)];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); });
                        }
                        //////////////////////////////////////////
                        // Check output files for version changes
                        {
                            if (conf.OutputPath) {
                                conf.ProjectList.forEach(function (p) {
                                    p.Sources.forEach(function (dbSource) {
                                        _this.processJsFiles(conf, p, dbSource);
                                    });
                                });
                            }
                        }
                        return [2 /*return*/];
                }
            });
        }); });
    };
    // look for new or deleted JsFile children
    Main.prototype.processDbSources = function (config, project) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, async.forEach(project.Sources, function (source) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: 
                                //! RoutineCacheStore.Instance.UpdateDbSource(this.Config.jsDALServerUrl, source.Guid);
                                // fetch list of output files from jsDAL Server
                                return [4 /*yield*/, jsDALServerApi_1.jsDALServerApi.GetOutputFiles(config.jsDALServerUrl, source.Guid).then(function (r) {
                                        if (r.statusCode == 404 /*NOT FOUND*/) {
                                            // DB Source not found and is no longer valid
                                            // TODO: REMOVE REMOVE REMOVE
                                            //!sourcesToRemove.Add(source);
                                            console.log("TODO: DB Source not found, remove....", source);
                                            return;
                                        }
                                        source.updateFilesFrom(source, r.data);
                                    }).catch(function (e) { return console.log(e.toString()); })];
                                case 1:
                                    //! RoutineCacheStore.Instance.UpdateDbSource(this.Config.jsDALServerUrl, source.Guid);
                                    // fetch list of output files from jsDAL Server
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    Main.prototype.processJsFiles = function (config, project, dbSource) {
        dbSource.JsFiles.forEach(function (jsFile) {
            try {
                var version = jsFile.Version;
                var projectPath = path.dirname(config.ConfigFilePath);
                var targetDir_1 = path.join(projectPath, config.OutputPath, project.Name, dbSource.Name);
                var targetFilePath_1 = path.join(targetDir_1, jsFile.Filename);
                var etag = null;
                if (fs.existsSync(targetFilePath_1)) {
                    //console.log("already exists, do md5 checking!!!");
                    var md5 = crypto.createHash('md5');
                    var fileData = fs.readFileSync(targetFilePath_1);
                    md5.update(fileData);
                    etag = '"' + md5.digest('hex') + '"';
                }
                // attempt to download a new version of the file
                jsDALServerApi_1.jsDALServerApi.DownloadJsFile(config.jsDALServerUrl, jsFile.Guid, version, false, etag).then(function (r) {
                    try {
                        jsFile.Version = r.version;
                        if (!fs.existsSync(targetDir_1)) {
                            try {
                                shelljs.mkdir('-p', targetDir_1);
                            }
                            catch (e) {
                                console.log(chalk.red(e.toString()));
                            }
                        }
                        fs.writeFileSync(targetFilePath_1, r.data, 'utf8');
                        var prefix_1 = "" + chalk.bgCyan.black(util_1.Util.padRight(dbSource.Name, 15));
                        console.log(prefix_1 + chalk.green("File written %s (%s bytes) and version %s"), path.relative('./', targetFilePath_1), r.data.length, r.version);
                        // TODO: move into separate function?
                        jsDALServerApi_1.jsDALServerApi.DownloadTypeScriptDefinition(config.jsDALServerUrl, jsFile.Guid).then(function (r) {
                            if (r.data) {
                                var tsdFilePath = path.join(targetDir_1, jsFile.Filename.substr(0, jsFile.Filename.lastIndexOf('.')) + '.d.ts');
                                fs.writeFileSync(tsdFilePath, r.data, 'utf8');
                                console.log(prefix_1 + chalk.green("File written %s (%s bytes)"), path.relative('./', tsdFilePath), r.data.length);
                            }
                        });
                        var tsdCommonFilePath_1 = path.join(targetDir_1, "jsDAL.common.d.ts");
                        if (!fs.existsSync(tsdCommonFilePath_1) || fs.statSync(tsdCommonFilePath_1).size == 0) {
                            jsDALServerApi_1.jsDALServerApi.DownloadCommonTypeScriptDefinitions(config.jsDALServerUrl).then(function (tsdCommon) {
                                fs.writeFileSync(tsdCommonFilePath_1, tsdCommon, 'utf8');
                                console.log(prefix_1 + ("Output file written: \"" + path.parse(tsdCommonFilePath_1).name + "\" (" + tsdCommon.length + " bytes)"));
                                //!SessionLog.Info("Output file written: \"{0}\" ({1} bytes)", new FileInfo(tsdCommonFilePath).Name, tsdCommon.Length);
                            });
                        }
                    }
                    catch (e) {
                        console.log("\twrite failed!", e.toString());
                    }
                }).catch(function (err) {
                    if (err.statusCode == 304 /*notModified*/) {
                        // file has not been modified, nothing to do here...
                        return;
                    }
                    else if (err.statusCode == 404 /*NotFound*/) {
                        console.log("TODO: jsFile not found..clean up local stores!..delete file etc", err);
                        return;
                    }
                    else if (err.statusCode == 412 /*PreconditionFailed*/) {
                        console.log(err);
                        return;
                    }
                    else {
                        console.log("!!!error!, statusCode: ", err);
                    }
                });
            }
            catch (e) {
                console.log(chalk.red(e.toString()));
            }
        });
        /*
            Parallel.ForEach(jsFiles, new ParallelOptions() { MaxDegreeOfParallelism = 4, CancellationToken = this.CancellationTokenSource.Token }, (jsFile) =>
            {
                try
                {
    
                    *var data = jsDALServerApi.DownloadJsFile(this.Config.jsDALServerUrl, jsFile.Guid, version, false, etag, out notModified, out notFound, out newVersion);
    
                    *if (notModified) return;
    
                    if (notFound)
                    {
                        // jsFile no longer exists on the DAL Server, remove local file if it exists
                        if (File.Exists(targetFilePath))
                        {
                            try
                            {
                                File.Delete(targetFilePath);
                            }
                            catch (Exception ex)
                            {
                                SessionLog.Exception(ex);
                            }
                        }
    
                        var tsdFilePath = Path.Combine(targetDir, jsFile.Filename.Substring(0, jsFile.Filename.LastIndexOf('.')) + ".d.ts");
    
                        if (File.Exists(tsdFilePath))
                        {
                            try
                            {
                                File.Delete(tsdFilePath);
                            }
                            catch (Exception ex)
                            {
                                SessionLog.Exception(ex);
                            }
    
                        }
    
                        SessionLog.Info("r02: jsFile {0} ({1}) not found in DB Source {2} ({3}). Removing from project and deleting local file.", jsFile.Filename, jsFile.Guid, dbSource.Name, dbSource.Guid);
    
    
                        var b = dbSource.Files.Remove(jsFile);
    
                        return;
                    }
     
            });
        */
    };
    return Main;
}());
exports.Main = Main;
//# sourceMappingURL=f:/00-Work/Projects/jsDALEditor/jsDAL-CLI/jsdal-cli/main.js.map