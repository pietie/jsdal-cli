"use strict";
var JsDALProject_1 = require("./JsDALProject");
var JsDALConfig = (function () {
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
//# sourceMappingURL=d:/00-Work/Projects/jsDALEditor/jsDAL-CLI/jsdal-cli/jsdal-config/JsDALConfig.js.map