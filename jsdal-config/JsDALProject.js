"use strict";
var chalk = require("chalk");
var JsDALDbSource_1 = require("./JsDALDbSource");
var JsDALProject = (function () {
    function JsDALProject() {
    }
    JsDALProject.prototype.deserialize = function (src) {
        this.Name = src.Name;
        this.Guid = src.Guid;
        this.Sources = [];
        if (src.Sources) {
            this.Sources = src.Sources.map(function (s) {
                var dbSource = new JsDALDbSource_1.JsDALDbSource();
                return dbSource.deserialize(s);
            });
        }
        return this;
    };
    JsDALProject.prototype.updateFrom = function (newDBSources) {
        var _this = this;
        if (!newDBSources)
            return;
        if (!this.Sources)
            this.Sources = [];
        var curSourceCnt = this.Sources.length;
        var curSources = this.Sources.map(function (e) { return e.Name; }).join(",");
        // remove current DB Sources that do not exist in new list
        var toRemove = this.Sources.filter(function (existing) { return newDBSources.find(function (n) { return n.Guid == existing.Guid; }) == null; });
        // filter out those items that need to be removed!
        this.Sources = this.Sources.filter(function (existing) { return toRemove.indexOf(existing) == -1; });
        // add all new DB sources
        newDBSources = newDBSources.filter(function (newSrc) { return _this.Sources.find(function (existing) { return existing.Guid == newSrc.Guid; }) == null; });
        var projName = chalk.bgBlue.yellow(this.Name.padRight(5, " "));
        if (toRemove.length > 0 || newDBSources.length > 0) {
            console.log(projName + chalk.gray("\tCUR sources (" + curSourceCnt + "): ") + curSources);
        }
        if (newDBSources.length > 0) {
            console.log(projName + chalk.green("\tADD sources (" + newDBSources.length + "): ") + newDBSources.map(function (e) { return e.Name; }).join(","));
        }
        if (toRemove.length > 0) {
            console.log(projName + chalk.red("\tREM sources (" + toRemove.length + "): ") + toRemove.map(function (e) { return e.Name; }).join(","));
        }
        if (toRemove.length > 0 || newDBSources.length > 0) {
            // add extra newline at the end if there was any output above
            console.log("");
        }
        this.Sources = this.Sources.concat(newDBSources);
    };
    return JsDALProject;
}());
exports.JsDALProject = JsDALProject;
//# sourceMappingURL=d:/00-Work/Projects/jsDALEditor/jsDAL-CLI/jsdal/jsdal-config/JsDALProject.js.map