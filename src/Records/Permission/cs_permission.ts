/**
 * @NScriptName ClientScript Permission
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */


import { EntryPoints } from 'N/types';
import { Permission, PermissionField } from "./Permission";
import { ApprovalStatus, Model, PeriodFrequentType, UI } from "../helpers";


function validateField(context: EntryPoints.Client.validateFieldContext) {
    debugger;
    let permission = new Permission().createFromRecord(context.currentRecord);

    let field = permission.getField(permission.removePrefix(context.fieldId));

    if (field._id == PermissionField.FROM || field._id == PermissionField.TO) {
        let remainingPeriodField = permission.getField(PermissionField.REMAINING_PERIOD);
        let remainingPeriod = Model.convertPeriodStrToMins(remainingPeriodField.value);
        let requestPeriod = calculatePeriod(permission);
        
        if (!remainingPeriod || requestPeriod > remainingPeriod) {
            UI.showMessage('Warning', 'Do not have enough period for permission');
            return false;
        }

        permission.getField(PermissionField.PERIOD).value = Model.convertMinsToText(requestPeriod);
        permission.getField(PermissionField.REMAINING_PERIOD).value = Model.convertMinsToText(remainingPeriod - requestPeriod);        
    }
    return true;
}

export = {
    // pageInit: pageInit,
    validateField: validateField,
    // fieldChanged: fieldChanged,
    // saveRecord: saveRecord
}


function calculatePeriod(permission: Permission) {
    let from = new Date(permission.getField(PermissionField.FROM).value.toString());
    let to = new Date(permission.getField(PermissionField.TO).value.toString());

    return Model.millisecondsToHuman(to.getTime() - from.getTime()).minutes;
}