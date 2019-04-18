/**
 * @NScriptName ClientScript Vacation Request
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

import { EntryPoints } from 'N/types';
import { LeaveRequest, EmployeeFields, RequestFields, BalanceFields } from "../LeaveRequest/LeaveRequest";
import * as UIMessage from 'N/ui/message';

let leaveRequest = new LeaveRequest();


function pageInit(context: EntryPoints.Client.pageInitContext) {

}

function validateField(context: EntryPoints.Client.validateFieldContext) {
    return true
}

function fieldChanged(context: EntryPoints.Client.fieldChangedContext) {

}

function saveRecord(context: EntryPoints.Client.saveRecordContext) {
    return true;
}

export = {
    pageInit: pageInit,
    validateField: validateField,
    fieldChanged: fieldChanged,
    saveRecord: saveRecord,
}