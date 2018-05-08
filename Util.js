"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Util = /** @class */ (function () {
    function Util() {
    }
    Util.padRight = function (input, maxLength, padChar) {
        if (padChar === void 0) { padChar = ' '; }
        if (input.length >= maxLength) {
            return input.substring(0, maxLength);
        }
        padChar = padChar.repeat(maxLength - input.length);
        return input + padChar;
    };
    return Util;
}());
exports.Util = Util;
//# sourceMappingURL=F:/00-Work/Projects/jsDALEditor/jsDAL-CLI/jsdal-cli/Util.js.map