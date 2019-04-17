import * as log from 'N/log';
import * as email from 'N/email';
import * as runtime from 'N/runtime';

interface ExceptionHandlerInterface {
    /** @member code in Exception (title/name) - ex: `errorMsg.name` */
    code: string;
    /** @member message in Exception. */
    message: string;
    /** @member stack in Exception - for more details */
    stack: string;

    /** Handle the Exception. */
    handle(err: any): this;
    /** Alert the logged in user with that "something went wrong!" */
    alert(): this;
    /** Log the Exception/Error Message to the NetSuite system notes */
    log(): this;
    /** Log the Exception/Error Message to the browser's console for debugging purposes */
    toConsole(): this;
    /** Send an email from the current logged in user to the system administrator or consultant */
    sendEmail(): this;
}


class ExceptionHandler implements ExceptionHandlerInterface {

    private emailRecipients: string[] = ['mohamed.elshowel@edigitsconsulting.com'];
    private subsidiaryName: string = 'AHK';
    code: string;
    message: string;
    stack: string;

    // Getting the email recipients list from Script Parameters
    // emailRecipients: string[] = .getValue('').toString().replace(/\s/g, '').split(',');

    constructor(err: any) {
        this.handle(err);
        // this.log();
    }

    /** Get the recipients of the Exception Email */
    getEmailRecipients(): string[]{
        return this.emailRecipients;
    }

    /** Set the recipients of the Exception Email */
    setEmailRecipients(emailRecipients: string[]){
        this.emailRecipients = emailRecipients;
    }

    /** Get the name of the subsidary */
    getSubsidiaryName(): string{
        return this.subsidiaryName;
    }

    /** Set the name of the subsidary */
    setSubsidiaryName(subsidiaryName: string){
        this.subsidiaryName = subsidiaryName;
    }


    isJsonString(str: string) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    handle(err: any) {

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
        let errorMsg: string = `Error Name: ${this.code} \n Message: ${err.message}`;

        // function compile message
        if ('type' in err)
            errorMsg += `\n Error Type: ${err.type}`;

        if (typeof runtime !== 'undefined') {
            errorMsg += `\n User: ${runtime.getCurrentUser().name} \n Script ID: ${runtime.getCurrentScript().id} \n
            Script Deployment ID: ${runtime.getCurrentScript().deploymentId}`
        }

        this.message = errorMsg;
        return this;
    }

    alert() {
        alert('Something went wrong,\nPlease contact your system administrator');
        return this;
    }

    log() {
        log.error(this.code, this.message);
        return this;
    }

    toConsole() {
        console.log(this.code, this.message);
        return this;
    }

    sendEmail() {
        
        email.send.promise({
            subject: `Error at ${this.subsidiaryName} - ScriptID: ${runtime.getCurrentScript().id}`,
            author: runtime.getCurrentUser().id,
            recipients: this.emailRecipients,
            body: this.message,
        }).catch(function (ex) {
            if ('message' in ex) {
                log.error('Sending Email Error', ex.message);
            } else {
                ex = JSON.parse(ex);
                log.error('Sending Email Error', ex.message)
            }
        });
        return this;
    }
}

export { ExceptionHandler };