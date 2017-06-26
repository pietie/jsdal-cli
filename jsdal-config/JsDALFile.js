"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var JsDALFile = (function () {
    function JsDALFile() {
    }
    JsDALFile.prototype.deserialize = function (src) {
        this.Filename = src.Filename;
        this.Guid = src.Guid;
        this.Version = src.Version;
        return this;
    };
    JsDALFile.prototype.updateFrom = function (existing) {
        this.Filename = existing.Filename;
        this.Version = existing.Version;
    };
    return JsDALFile;
}());
exports.JsDALFile = JsDALFile;
//# sourceMappingURL=f:/00-Work/Projects/jsDALEditor/jsDAL-CLI/jsdal-cli/jsdal-config/JsDALFile.js.map