var padLeft = String.padLeft;
var padRight = String.padRight;
if (typeof String.prototype.padLeft !== 'function') {
    (function (String, Array, ceil) {
        function padLeft(maxLength /*, fillString*/) {
            var string = String(this), fillString = arguments.length < 2 ? ' ' : String(arguments[1]), stringLength = string.length, diffLength = maxLength - stringLength;
            return diffLength < 1 ? string : Array(ceil(diffLength / fillString.length) + 1).join(fillString).slice(0, diffLength) + string;
        }
        if (typeof Object.defineProperty === 'function') {
            Object.defineProperty(this, 'padLeft', { writable: true, enumerable: false, configurable: true, value: padLeft });
        }
        else {
            this.padLeft = padLeft;
        }
    }.call(String.prototype, String, Array, Math.ceil));
    padLeft = String.prototype.padLeft;
}
if (typeof String.prototype.padRight !== 'function') {
    (function (String, Array, ceil) {
        function padRight(maxLength /*, fillString*/) {
            var string = String(this), fillString = arguments.length < 2 ? ' ' : String(arguments[1]), stringLength = string.length, diffLength = maxLength - stringLength;
            return diffLength < 1 ? string : string + Array(ceil(diffLength / fillString.length) + 1).join(fillString).slice(0, diffLength);
        }
        if (typeof Object.defineProperty === 'function') {
            Object.defineProperty(this, 'padRight', { writable: true, enumerable: false, configurable: true, value: padRight });
        }
        else {
            this.padRight = padRight;
        }
    }.call(String.prototype, String, Array, Math.ceil));
}
//# sourceMappingURL=d:/00-Work/Projects/jsDALEditor/jsDAL-CLI/jsdal-cli/polyfills.js.map