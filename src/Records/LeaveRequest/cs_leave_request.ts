/**
 * @NScriptName ClientScript Vacation Request
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

/*
todo set [frequency.. etc] configurations from Vacation Type
todo get & set configuration From Vacation Rule
 */

import {EntryPoints} from 'N/types';
import {LeaveRequest, EmployeeFields, RequestFields, BalanceFields} from "./LeaveRequest";
import {UI, Model} from "../helpers";

let employee;
let leaveBalance;
let leaveType;
let leaveRequest = new LeaveRequest();
let balances;
let vacationSpan;

let balancesMap = {
    1: 'annual',
    2: 'transferred',
    3: 'replacement',
    4: 'casual',
    5: 'sick',
    6: 'total_regular',
    7: 'unpaid'
};

leaveRequest.validation['start'].push(
    (field, model) => {
        return true;
    }
);

function pageInit(context: EntryPoints.Client.pageInitContext) {
    let leaveRequest = new LeaveRequest();

    leaveRequest.columns = [
        EmployeeFields.EMPLOYEE
    ];

    leaveRequest.createFromRecord(context.currentRecord);

    // set type
    let field = leaveRequest.getField('type');
    leaveType = leaveRequest.relations.leaveType(leaveRequest)
        .setRecord(<number>field.value);

    // get employee balance
    // Inject relationship dependency by hand now till we find a better way
    employee = leaveRequest.relations
        .getEmployee(leaveRequest);

    leaveBalance = employee.relations
        .vacationBalance(employee, '2019');

    balances = leaveBalance
        .first([
            'annual',
            'transferred',
            'replacement',
            'casual',
            'sick',
            'total_regular',
            'unpaid'
        ]);

    if (!balances)
        UI.showMessage('Warning', 'No vacation balance!');
    else
        initCounters(leaveRequest, balances);

}

function validateField(context: EntryPoints.Client.validateFieldContext) {
    leaveRequest = new LeaveRequest()
        .createFromRecord(context.currentRecord);

    let field = leaveRequest.getField(leaveRequest.removePrefix(context.fieldId));

    let valid = field.validate();

    if (!valid)
        UI.showMessage(
            'Warning',
            'Field' + context.fieldId + 'is not valid!'
        );

    if (field._id == RequestFields.TYPE && field.value) {
        leaveType = leaveRequest.relations
            .leaveType(leaveRequest)
            .setRecord(<number>field.value);

        if (!leaveType) {
            UI.showMessage(
                'Warning',
                'Vacation doesn\'t exist?'
            );
            return false;
        } else {
            initCounters(leaveRequest, balances);
            updateCounters();
        }
    }

    return valid;
}

function fieldChanged(context: EntryPoints.Client.fieldChangedContext) {
    leaveRequest = new LeaveRequest()
        .createFromRecord(context.currentRecord);

    let field = leaveRequest.getField(leaveRequest.removePrefix(context.fieldId));

    if (field._id == RequestFields.START || field._id == RequestFields.END) {

        if (field._id == RequestFields.START)
            vacationSpan = calculateVacation(leaveType, field.value, leaveRequest.getField(RequestFields.END).value);
        else if (field._id == RequestFields.END)
            vacationSpan = calculateVacation(leaveType, leaveRequest.getField(RequestFields.START).value, field.value);

        updateCounters();

        console.log(vacationSpan);
    }
}

function saveRecord(context: EntryPoints.Client.saveRecordContext) {
    return true;
}

function calculateVacation(vacationType, start, end) {
    let date1 = new Date(end);
    let date2 = new Date(start);

    if (!date1 || !date2)
        return;

    return Model.getWorkingDays(date2, date1);
}

function updateCounters() {

    if (vacationSpan == undefined)
        return false;

    // Update Leave Days
    leaveRequest.getField('leave_days').value = vacationSpan;

    // Update Counter
    let fieldId = leaveType.getField('mapping').value;
    let balance = balances.getField(balancesMap[fieldId]);
    let counter = leaveRequest.getField('blc_' + balancesMap[fieldId]);
    counter.value = balance.value - vacationSpan;

    if (balance.value - vacationSpan < 0) {
        UI.showMessage(
            'Warning',
            'No vacation balance.'
        );
    }
}

function initCounters(leaveRequest, balance) {
    let prefix = 'blc_';
    let fields = balance.getFields(balance.columns);

    fields.forEach(function (field) {
        let $field = leaveRequest.getField(prefix + field._id);
        $field.value = field.value;
    });
}

export = {
    pageInit: pageInit,
    validateField: validateField,
    fieldChanged: fieldChanged,
    saveRecord: saveRecord
}