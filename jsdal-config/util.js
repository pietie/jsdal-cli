"use strict";
var Util = (function () {
    function Util() {
    }
    Util.padRight = function (input, maxLength, padChar) {
        if (padChar === void 0) { padChar = ' '; }
        if (input.length >= maxLength) {
            return input.substring(0, maxLength);
        }
        padChar.repeat(maxLength - input.length);
        return input + padChar;
    };
    return Util;
}());
exports.Util = Util;
//# sourceMappingURL=d:/00-Work/Projects/jsDALEditor/jsDAL-CLI/jsdal-cli/jsdal-config/util.js.map