"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var JsDALFile = /** @class */ (function () {
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
//# sourceMappingURL=F:/00-Work/Projects/jsDALEditor/jsDAL-CLI/jsdal-cli/jsdal-config/JsDALFile.js.map