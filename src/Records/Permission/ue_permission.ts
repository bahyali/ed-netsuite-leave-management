/**
 * @NScriptName UserEvent Permission
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */


import {EntryPoints} from 'N/types';
import {Permission, PermissionField} from "./Permission";
import {UI, ApprovalStatus, Model} from '../helpers';
import {LeaveRule, LeaveRuleField} from '../LeaveRule/LeaveRule';
import * as runtime from 'N/runtime';
import * as format from 'N/format';
import * as log from 'N/log';


function beforeLoad(context: EntryPoints.UserEvent.beforeLoadContext) {

    // Only on create
    if (context.type !== context.UserEventType.CREATE)
        return;

    // Get current Permission
    let permission = new Permission()
        .createFromRecord(context.newRecord);

    // Get current Leave Rule
    let leaveRule = permission.relations
        .leaveRule(Number(permission.getField('subsidiary').value))
        .first(['internalid', LeaveRuleField.PERMISSION_HOURS]);

    // if no Rule Do nothing
    if (!leaveRule)
        log.error({details: "User can't access Rule!", title: "Warning"});


    let allowedPermissionHours = leaveRule
        .getField(LeaveRuleField.PERMISSION_HOURS).value;

    // Fill variables

    // Allowed hours per month
    permission.getField('allowed_hours').value = allowedPermissionHours;

    // Normalize to minutes
    let maxPerMonth = allowedPermissionHours * 60;

    let startDate = format.format({value: startOfMonth(), type: format.Type.DATE});

    let employeeId = permission.getField(PermissionField.EMPLOYEE).value;

    // Previous Approved permissions this month.
    let permissionSearch = new Permission()
        .where(PermissionField.EMPLOYEE, '==', employeeId)
        .where(PermissionField.STATUS, '==', ApprovalStatus.APPROVED)
        .where(PermissionField.DATE, '>=', startDate);

    let previousPermissions = permissionSearch.find(['period_mins']);

    // Store in Minutes
    let takenPeriod = 0;
    if (previousPermissions.length > 0) {
        for (let i = 0; i < previousPermissions.length; i++) {
            takenPeriod += previousPermissions[i]['period_mins'].value;
        }
    }

    let permissionsBalance = maxPerMonth - takenPeriod;

    // set Remaining Balance
    permission.getField(PermissionField.BALANCE).value = permissionsBalance;
    permission.getField(PermissionField.REMAINING_PERIOD).value = Model.convertMinsToText(permissionsBalance);
}

function startOfMonth() {
    let date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

export = {
    beforeLoad: beforeLoad,
}