"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chalk = require("chalk");
var JsDALFile_1 = require("./JsDALFile");
var Util_1 = require("../Util");
var console_logger_1 = require("./../console-logger");
var JsDALDbSource = (function () {
    function JsDALDbSource() {
    }
    JsDALDbSource.prototype.deserialize = function (src) {
        this.Name = src.Name;
        this.Guid = src.Guid;
        this.JsFiles = [];
        if (src.JsFiles) {
            this.JsFiles = src.JsFiles.map(function (f) {
                var jsFile = new JsDALFile_1.JsDALFile();
                return jsFile.deserialize(f);
            });
        }
        return this;
    };
    JsDALDbSource.deserializeSingle = function (input) {
        var dbs = new JsDALDbSource();
        dbs.deserialize(input);
        return dbs;
    };
    JsDALDbSource.deserialize = function (input) {
        var ar = [];
        input.forEach(function (e) {
            ar.push(JsDALDbSource.deserializeSingle(e));
        });
        return ar;
    };
    JsDALDbSource.prototype.updateFilesFrom = function (dbSource, newFiles) {
        var _this = this;
        if (!newFiles)
            return;
        if (!this.JsFiles)
            this.JsFiles = [];
        var dbSourceName = "\t"
            + chalk.bgCyan.black(Util_1.Util.padRight(dbSource.Name, 20));
        var curCnt = this.JsFiles.length;
        var curFiles = this.JsFiles.map(function (e) { return e.Filename; }).join(",");
        // remove current JS Files that do not exist in new list
        var toRemove = this.JsFiles.filter(function (existing) { return newFiles.find(function (n) { return n.Guid == existing.Guid; }) == null; });
        // filter out those items that need to be removed!
        this.JsFiles = this.JsFiles.filter(function (existing) { return toRemove.indexOf(existing) == -1; });
        // add all new Js Files
        newFiles = newFiles.filter(function (newSrc) { return _this.JsFiles.find(function (existing) { return existing.Guid == newSrc.Guid; }) == null; });
        if (newFiles.length > 0 || toRemove.length > 0) {
            console_logger_1.ConsoleLog.logExpireBy(dbSourceName + chalk.gray("CUR files (" + curCnt + "): ") + curFiles, 0.3);
        }
        if (newFiles.length > 0) {
            console_logger_1.ConsoleLog.logExpireBy(dbSourceName + chalk.green("ADD files (" + newFiles.length + "): ") + newFiles.map(function (e) { return e.Filename; }).join(","), 0.3);
        }
        if (toRemove.length > 0) {
            console_logger_1.ConsoleLog.logExpireBy(dbSourceName + chalk.red("REM files (" + toRemove.length + "): ") + toRemove.map(function (e) { return e.Filename; }).join(","), 0.3);
        }
        if (toRemove.length > 0 || newFiles.length > 0) {
            // add extra newline at the end if there was any output above
            //console.log("");
        }
        this.JsFiles = this.JsFiles.concat(newFiles);
    };
    return JsDALDbSource;
}());
exports.JsDALDbSource = JsDALDbSource;
//# sourceMappingURL=f:/00-Work/Projects/jsDALEditor/jsDAL-CLI/jsdal-cli/jsdal-config/JsDALDbSource.js.map