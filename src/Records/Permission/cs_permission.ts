/**
 * @NScriptName ClientScript Permission
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */


import {EntryPoints} from 'N/types';
import * as format from 'N/format';
import * as runtime from 'N/runtime';
import {Permission, PermissionField} from "./Permission";
import {ApprovalStatus, Model, PeriodFrequentType, UI} from "../helpers";
import {Field} from "../../Core/Model/Field";

let valid = true;

function pageInit(context: EntryPoints.Client.pageInitContext) {
    let permission = new Permission().createFromRecord(context.currentRecord);
    let balance = permission.getField(PermissionField.BALANCE).value;
    permission.getField(PermissionField.REMAINING_PERIOD).value = Model.convertMinsToText(<number>balance);
}

function validateField(context: EntryPoints.Client.validateFieldContext) {

    let permission = new Permission().createFromRecord(context.currentRecord);

    let field = permission.getField(permission.removePrefix(context.fieldId));

    if ((field._id == PermissionField.FROM || field._id == PermissionField.TO) && field.value.toString()) {
        let balance = <number>permission.getField(PermissionField.BALANCE).value;

        let requestPeriod = calculatePeriod(
            permission.getField(PermissionField.FROM).value,
            permission.getField(PermissionField.TO).value);

        if (!balance || requestPeriod > balance) {
            UI.showMessage('Warning', 'Do not have enough period for permission');
            return false;
        }

        permission.getField(PermissionField.PERIOD).value = Model.convertMinsToText(requestPeriod);
        permission.getField(PermissionField.USED_PERIOD).value = requestPeriod;

        if (requestPeriod) {
            let remainingBalance = balance - requestPeriod;
            permission.getField(PermissionField.REMAINING_PERIOD).value = Model.convertMinsToText(remainingBalance);
        }

    }
    return true;
}

function saveRecord(context: EntryPoints.Client.saveRecordContext) {
    let permission = new Permission().createFromRecord(context.currentRecord);
    return isValid(permission);
}

// Business Logic
function calculatePeriod(from, to) {
    if (!from || !to)
        return 0;

    return Model.millisecondsToHuman(to.getTime() - from.getTime()).minutes;
}

function isValid(permission: Permission) {
    return permission.getField(PermissionField.BALANCE).value > 0;
}

export = {
    pageInit: pageInit,
    validateField: validateField,
    // fieldChanged: fieldChanged,
    saveRecord: saveRecord
}

