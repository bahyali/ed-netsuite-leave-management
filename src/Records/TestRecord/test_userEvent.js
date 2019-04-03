/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(["require", "exports", "Core/ExceptionHandler"], function (require, exports, ExceptionHandler_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function pageInit(context) {
        try {
            throw 'LOL';
        }
        catch (e) {
            console.log(e);
            new ExceptionHandler_1.ExceptionHandler(e).toConsole();
        }
    }
    exports.pageInit = pageInit;
    function fieldChanged(context) {
    }
    exports.fieldChanged = fieldChanged;
});
