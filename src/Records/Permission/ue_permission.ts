/**
 * @NScriptName UserEvent Permission
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */


import { EntryPoints } from 'N/types';
import { Permission, PermissionField } from "./Permission";
import { UI, ApprovalStatus, Model } from '../helpers';
import { LeaveRule, LeaveRuleField } from '../LeaveRule/LeaveRule';
import * as runtime from 'N/runtime';


function beforeLoad(context: EntryPoints.UserEvent.beforeLoadContext) {

    if (context.type !== context.UserEventType.CREATE)
        return;

    let permission = new Permission().createFromRecord(context.newRecord);

    let leaveRule = permission.relations
        .leaveRule(Number(permission.getField('subsidiary').value))
        .first(['internalid']);

    if (leaveRule) {
        //permission.getField('vac_rule').value = 
        let subsidiaryRuleId = leaveRule.getField('internalid').value;
        let allowedPermissionHours = new LeaveRule()
            .setRecord(subsidiaryRuleId)
            .getField(LeaveRuleField.PERMISSION_HOURS).value;

        permission.getField('allowed_hours').value = allowedPermissionHours;
        let today = new Date();

        // Previous Approved permissions this month.
        let previousPermissions = new Permission()
            // .where(PermissionField.EMPLOYEE, '==', runtime.getCurrentUser().id)
            .where(PermissionField.STATUS, '==', ApprovalStatus.APPROVED)
            // .where(PermissionField.DATE, 'after', today.setDate(0))
            .find([PermissionField.PERIOD]);

        let takenPeriod = 0;
        if (previousPermissions) {
            for (let i = 0; i < previousPermissions.length; i++) {
                takenPeriod += Model.convertPeriodStrToMins(previousPermissions[i][PermissionField.PERIOD]);
            }
        }

        let reaminingPeriodField = permission.getField(PermissionField.REMAINING_PERIOD);
        if (takenPeriod <= allowedPermissionHours) {
            reaminingPeriodField.value = allowedPermissionHours - takenPeriod;
        }
    }
}

export = {
    beforeLoad: beforeLoad,
}