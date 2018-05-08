"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var JsDALProject_1 = require("./JsDALProject");
var JsDALConfig = /** @class */ (function () {
    function JsDALConfig() {
    }
    JsDALConfig.prototype.deserialize = function (src) {
        this.jsDALServerUrl = src.jsDALServerUrl;
        this.OutputPath = src.OutputPath;
        this.ProjectList = [];
        if (src.ProjectList) {
            this.ProjectList = src.ProjectList.map(function (p) {
                var project = new JsDALProject_1.JsDALProject();
                return project.deserialize(p);
            });
        }
        return this;
    };
    return JsDALConfig;
}());
exports.JsDALConfig = JsDALConfig;
var jsDALServerStatus = /** @class */ (function () {
    function jsDALServerStatus() {
    }
    return jsDALServerStatus;
}());
exports.jsDALServerStatus = jsDALServerStatus;
//# sourceMappingURL=F:/00-Work/Projects/jsDALEditor/jsDAL-CLI/jsdal-cli/jsdal-config/JsDALConfig.js.map