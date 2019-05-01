/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */

import {EntryPoints} from 'N/types';
import {LeaveRequest} from "./LeaveRequest";

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

export = {
    beforeLoad: beforeLoad
}