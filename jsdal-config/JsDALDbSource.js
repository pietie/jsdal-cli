"use strict";
var chalk = require("chalk");
var JsDALFile_1 = require("./JsDALFile");
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
        var dbSourceName = "\t" + chalk.bgCyan.black(dbSource.Name.padRight(5, " "));
        var curCnt = this.JsFiles.length;
        var curFiles = this.JsFiles.map(function (e) { return e.Filename; }).join(",");
        // remove current JS Files that do not exist in new list
        var toRemove = this.JsFiles.filter(function (existing) { return newFiles.find(function (n) { return n.Guid == existing.Guid; }) == null; });
        // filter out those items that need to be removed!
        this.JsFiles = this.JsFiles.filter(function (existing) { return toRemove.indexOf(existing) == -1; });
        // add all new Js Files
        newFiles = newFiles.filter(function (newSrc) { return _this.JsFiles.find(function (existing) { return existing.Guid == newSrc.Guid; }) == null; });
        if (newFiles.length > 0 || toRemove.length > 0) {
            console.log(dbSourceName + chalk.gray("\tCUR files (" + curCnt + "): ") + curFiles);
        }
        if (newFiles.length > 0) {
            console.log(dbSourceName + chalk.green("\tADD files (" + newFiles.length + "): ") + newFiles.map(function (e) { return e.Filename; }).join(","));
        }
        if (toRemove.length > 0) {
            console.log(dbSourceName + chalk.red("\tREM files (" + toRemove.length + "): ") + toRemove.map(function (e) { return e.Filename; }).join(","));
        }
        if (toRemove.length > 0 || newFiles.length > 0) {
            // add extra newline at the end if there was any output above
            console.log("");
        }
        this.JsFiles = this.JsFiles.concat(newFiles);
    };
    return JsDALDbSource;
}());
exports.JsDALDbSource = JsDALDbSource;
//# sourceMappingURL=d:/00-Work/Projects/jsDALEditor/jsDAL-CLI/jsdal/jsdal-config/JsDALDbSource.js.map