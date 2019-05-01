/**
 * @NScriptName UserEvent - Vacation Request
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */

import { EntryPoints } from 'N/types';
import { LeaveRequest, RequestField, RelationField, BalanceField } from "./LeaveRequest";
import { ApprovalStatus } from '../helpers';
import { LeaveBalance } from '../LeaveBalance/LeaveBalance';

function beforeLoad(context: EntryPoints.UserEvent.beforeLoadContext) {
    if (context.type !== context.UserEventType.CREATE)
        return;

    let leaveRequest = new LeaveRequest()
        .createFromRecord(context.newRecord);

    let employee = leaveRequest.relations
        .getEmployee(leaveRequest);

    let leaveBalance = employee.relations
        .vacationBalance(employee, new Date().getFullYear())
        .first(['internalid']);

    if (leaveBalance)
        leaveRequest.getField('vac_blc').value = leaveBalance.getField('internalid').value;

    let leaveRule = leaveRequest.relations
        .leaveRule(Number(leaveRequest.getField('subsidiary').value))
        .first(['internalid']);

    if (leaveRule)
        leaveRequest.getField('rule_link').value = leaveRule.getField('internalid').value;

}


function beforeSubmit(context: EntryPoints.UserEvent.beforeSubmitContext) {

    let leaveRequest = new LeaveRequest()
        .createFromRecord(context.newRecord);

    let requestStatus = leaveRequest.getField(RequestField.STATUS).value;

    if (requestStatus == ApprovalStatus.APPROVED) {

        let balanceRecordId = Number(leaveRequest.getField(RelationField.BALANCE).value);

        let leaveBalance = new LeaveBalance().get(balanceRecordId);

        leaveBalance.getField(BalanceField.ANNUAL).value = Number(leaveRequest.getField(BalanceField.ANNUAL).value);
        leaveBalance.getField(BalanceField.TRANSFERRED).value = Number(leaveRequest.getField(BalanceField.TRANSFERRED).value);
        leaveBalance.getField(BalanceField.REPLACEMENT).value = Number(leaveRequest.getField(BalanceField.REPLACEMENT).value);
        leaveBalance.getField(BalanceField.CASUAL).value = Number(leaveRequest.getField(BalanceField.CASUAL).value);
        leaveBalance.getField(BalanceField.SICK).value = Number(leaveRequest.getField(BalanceField.SICK).value);
        leaveBalance.getField(BalanceField.UNPAID).value = Number(leaveRequest.getField(BalanceField.UNPAID).value);    
        
        leaveBalance.save();
    }
}

export = {
    beforeLoad: beforeLoad,
    beforeSubmit: beforeSubmit,
}