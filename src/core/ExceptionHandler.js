/**
 * @module      LeaveManagement
 * @class       ExceptionHandler
 * @description Exception Handler Class customized for SuiteScript 2.0 using TypeScript
 * @author      Mohamed Elshowel
 * @version     1.0.0
 * @repo        https://github.com/bahyali/ed-netsuite-leave-management
 */
define(["require", "exports", "N/log", "N/email", "N/runtime"], function (require, exports, log, email, runtime) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var ExceptionHandler = /** @class */ (function () {
        // Getting the email recipients list from Script Parameters
        // emailRecipients: string[] = .getValue('').toString().replace(/\s/g, '').split(',');
        function ExceptionHandler(err) {
            this.emailRecipients = ['mohamed.elshowel@edigitsconsulting.com'];
            this.subsidiaryName = 'AHK';
            this.handle(err);
            // this.log();
        }
        /** Get the recipients of the Exception Email */
        ExceptionHandler.prototype.getEmailRecipients = function () {
            return this.emailRecipients;
        };
        /** Set the recipients of the Exception Email */
        ExceptionHandler.prototype.setEmailRecipients = function (emailRecipients) {
            this.emailRecipients = emailRecipients;
        };
        /** Get the name of the subsidary */
        ExceptionHandler.prototype.getSubsidiaryName = function () {
            return this.subsidiaryName;
        };
        /** Set the name of the subsidary */
        ExceptionHandler.prototype.setSubsidiaryName = function (subsidiaryName) {
            this.subsidiaryName = subsidiaryName;
        };
        ExceptionHandler.prototype.isJsonString = function (str) {
            try {
                JSON.parse(str);
            }
            catch (e) {
                return false;
            }
            return true;
        };
        ExceptionHandler.prototype.handle = function (err) {
            if (typeof err === 'string') {
                // If the Exception is a JSON string
                // err.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t").replace(/\f/g, "\\f").replace(/\s/g, "\\s");
                if (!this.isJsonString(err))
                    err = {
                        name: null,
                        message: err
                    };
                else
                    err = JSON.parse(err);
            }
            this.code = err.name;
            var errorMsg = "Error Name: " + this.code + " \n Message: " + err.message;
            // function compile message
            if ('type' in err)
                errorMsg += "\n Error Type: " + err.type;
            if (typeof runtime !== 'undefined') {
                errorMsg += "\n User: " + runtime.getCurrentUser().name + " \n Script ID: " + runtime.getCurrentScript().id + " \n\n            Script Deployment ID: " + runtime.getCurrentScript().deploymentId;
            }
            this.message = errorMsg;
            return this;
        };
        ExceptionHandler.prototype.alert = function () {
            alert('Something went wrong,\nPlease contact your system administrator');
            return this;
        };
        ExceptionHandler.prototype.log = function () {
            log.error(this.code, this.message);
            return this;
        };
        ExceptionHandler.prototype.toConsole = function () {
            console.log(this.code, this.message);
            return this;
        };
        ExceptionHandler.prototype.sendEmail = function () {
            email.send.promise({
                subject: "Error at " + this.subsidiaryName + " - ScriptID: " + runtime.getCurrentScript().id,
                author: runtime.getCurrentUser().id,
                recipients: this.emailRecipients,
                body: this.message,
            }).catch(function (ex) {
                if ('message' in ex) {
                    log.error('Sending Email Error', ex.message);
                }
                else {
                    ex = JSON.parse(ex);
                    log.error('Sending Email Error', ex.message);
                }
            });
            return this;
        };
        return ExceptionHandler;
    }());
    exports.ExceptionHandler = ExceptionHandler;
});
