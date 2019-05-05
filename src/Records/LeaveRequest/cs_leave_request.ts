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


// import runtime from "N/runtime";
import {EntryPoints} from 'N/types';
import * as UIMessage from "N/ui/message";

import {BalanceField, EmployeeField, LeaveRequest, RequestField} from "./LeaveRequest";
import {ApprovalStatus, Model, PeriodFrequentType, UI} from "../helpers";
import {LeaveRuleField} from '../LeaveRule/LeaveRule';
import {LeaveType, LeaveTypeFields} from '../LeaveType/LeaveType';
import {Holiday} from "../Holiday/Holiday";

// Global Variables
let employee;
let leaveBalance;
let leaveType;
let balances;
let leavePeriod: number;
let leaveRequest = new LeaveRequest();
let leaveRule;
let holidays;

// Filling the Balance Columns
Object.keys(BalanceField).forEach(key => leaveRequest.balanceColumns.push(BalanceField[key]));

enum StandardLeaveType {
    ANNUAL = 'annual',
    CASUAL = 'casual',
    SICK = 'sick',
    UNPAID = 'unpaid',
    REPLACEMENT = 'replacement',
    TRANSFERRED = 'transferred',
    CUSTOM = 'custom',
}

// Pushing Custom Validations to record fields
leaveRequest.validation['start'].push(
    (field, model) => {
        return true;
    }
);


function pageInit(context: EntryPoints.Client.pageInitContext) {

    leaveRequest.createFromRecord(context.currentRecord);

    leaveRequest.columns = [
        EmployeeField.EMPLOYEE
    ];


    // set type
    let typeField = leaveRequest.getField(RequestField.TYPE);
    leaveType = leaveRequest.relations.leaveType(leaveRequest)
        .setRecord(typeField.value);

    // get employee balance
    // Inject relationship dependency by hand now till we find a better way
    employee = leaveRequest.relations
        .getEmployee(leaveRequest);
    // OR:
    // employee = runtime.getCurrentUser().id;

    leaveBalance = employee.relations
        .vacationBalance(employee, new Date().getFullYear());

    // Init LeaveRule
    leaveRule = leaveRequest.relations
        .leaveRule(Number(leaveRequest.getField('subsidiary').value)).first();

    holidays = new Holiday()
        .where('isinactive', 'is', 'F')
        .find(['date']);

    balances = leaveBalance.first([
        'annual',
        'replacement',
        'transferred',
        'casual',
        'sick',
        'unpaid',
        'total_regular'
    ]);

    debugger;

    if (balances)
        initCounters(leaveRequest, balances);
    else {
        leaveRequest.getFields([RequestField.TYPE, RequestField.START, RequestField.END]).disable();
        UI.showMessage('Warning', 'No vacation balance for this employee', 0, UIMessage.Type.INFORMATION);
    }
}


function validateField(context: EntryPoints.Client.validateFieldContext) {

    leaveRequest.createFromRecord(context.currentRecord);

    let field = leaveRequest.getField(leaveRequest.removePrefix(context.fieldId));

    let valid = field.validate();

    if (!valid) {
        UI.showMessage(
            'Warning',
            'Field: ' + field._id.replace('_', ' ').toUpperCase() + ' is invalid!'
        );
        return false;
    }

    if (field.value && field._id == RequestField.TYPE) {

        leaveType = leaveRequest.relations
            .leaveType(leaveRequest)
            .setRecord(field.value);

        partDayLeave(leaveType, leaveRequest.getField(RequestField.START).value, leaveRequest.getField(RequestField.END).value);

        if (!leaveType) {
            UI.showMessage(
                'Warning',
                'Vacation doesn\'t exist?'
            );
            return false;
        } else {
            // Empty the Start & End Date Fields
            // leaveRequest.getField(RequestField.START).value = '';
            // leaveRequest.getField(RequestField.END).value = '';

            initCounters(leaveRequest, balances);
            updateCounters();
        }
    } else if (field._id == RequestField.START || field._id == RequestField.END) {
        let type = leaveType.getField(LeaveTypeFields.MAPPING).text.toString().toLowerCase();
        let startDate = leaveRequest.getField(RequestField.START).value;
        let endDate = leaveRequest.getField(RequestField.END).value;

        if (type == StandardLeaveType.CUSTOM && startDate && endDate) {
            valid = calculateCustomLeave(leaveType, startDate, endDate);
        }
    }
    return valid;
}


function fieldChanged(context: EntryPoints.Client.fieldChangedContext) {
    leaveRequest.createFromRecord(context.currentRecord);

    let field = leaveRequest.getField(leaveRequest.removePrefix(context.fieldId));

    if (field.value && field._id == RequestField.TYPE) {

    }
    if (field._id == RequestField.START || field._id == RequestField.END) {

        if (field._id == RequestField.START)
            leavePeriod = calculateVacation(leaveType, field.value, leaveRequest.getField(RequestField.END).value);
        else if (field._id == RequestField.END)
            leavePeriod = calculateVacation(leaveType, leaveRequest.getField(RequestField.START).value, field.value);

        updateCounters();
    }

    if (field._id == RequestField.PART_DAY_LEAVE) {
        let partDayPeriod = Number(leaveRequest.getField(RequestField.PART_DAY_LEAVE).text);
        if (partDayPeriod) {
            leavePeriod = partDayPeriod;
            updateCounters();
        }
    }
}


function saveRecord(context: EntryPoints.Client.saveRecordContext) {
    return true;
}

function calculateVacation(vacationType, start, end) {
    let startDate = new Date(start);
    let endDate = new Date(end);

    if (!startDate || !endDate)
        return 0;

    partDayLeave(vacationType, start, end);

    // Get Vacation Rule to extract the weekend days from it.
    let applyWeekend = leaveRule.getField(LeaveRuleField.APPLY_WEEKEND).value;

    if (applyWeekend) {
        let weekends = <string>leaveRule.getField(LeaveRuleField.WEEKEND_DAYS).value;

        let holidayDates = holidays.map((item) => {
            let date = item.getField('date').value.split('/');
            return new Date(date[2], date[1] - 1, date[0]);
        });

        // Map day ids to day numbers
        let mappedWeekends = weekends.split(',').map(item => {
            if (item == '1')        //Friday
                return 5;
            else if (item == '2')   //Saturday
                return 6;
            else if (item == '3')   //Sunday
                return 0;
        });

        return Model.getWorkingDays(start, end, mappedWeekends, holidayDates)
    }

    return Model.getWorkingDays(startDate, endDate, []);
}


function updateCounters() {
    if (leavePeriod == undefined)
        return false;

    // Update Leave Days
    leaveRequest.getField('leave_days').value = leavePeriod;

    // Update Counter
    let typeMap: string = leaveType.getField('mapping').text.toString().toLowerCase();
    let empBalanceField = balances.getField(typeMap);
    let reqBalanceField = leaveRequest.getField('blc_' + typeMap);

    switch (typeMap) {
        case StandardLeaveType.CUSTOM:

            break;
        case StandardLeaveType.UNPAID:
            reqBalanceField.value = Number(empBalanceField.value) + leavePeriod;
            break;
        case StandardLeaveType.ANNUAL:
            deductRegularVacation();
            break;
        case StandardLeaveType.CASUAL:
            let deductCasualFromAnnual = Boolean(leaveRule
                .getField(LeaveRuleField.DEDUCT_CAUSUAL_FROM_ANNUAL).value);

            if (deductCasualFromAnnual)
                deductRegularVacation();

        default:
            reqBalanceField.value = empBalanceField.value - leavePeriod;

            if (empBalanceField.value - leavePeriod < 0) {
                UI.showMessage('Warning', 'No vacation balance.');
            }
            break;
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

function deductRegularVacation() {
    let annualField = leaveRequest.getField(BalanceField.ANNUAL);
    let transferredField = leaveRequest.getField(BalanceField.TRANSFERRED);
    let replacementField = leaveRequest.getField(BalanceField.REPLACEMENT);

    transferredField.value = balances.transferred.value - leavePeriod;
    if (transferredField.value < 0) {
        replacementField.value = balances.replacement.value - Math.abs(transferredField.value);
        transferredField.value = 0;

        if (replacementField.value < 0) {
            annualField.value = balances.annual.value - Math.abs(replacementField.value);
            replacementField.value = 0;

            if (annualField.value < 0) {
                UI.showMessage('Warning', 'No vacation balance!');
            }
        }
    }
}


function partDayLeave(leaveType, start, end) {
    let startDate = new Date(start);
    let endDate = new Date(end);

    if (leaveType.getField('mapping').text.toString().toLowerCase() == StandardLeaveType.ANNUAL) {
        if (startDate.getTime() == endDate.getTime()) {
            let daysLeave = leaveRequest.getField(RequestField.LEAVE_DAYS);
            daysLeave.value = '';
            daysLeave.visible = false;
            let partdayPeriod = leaveRequest.getField(RequestField.PART_DAY_LEAVE);
            partdayPeriod.text = '1';
            partdayPeriod.disabled = false;
        }
    }
    if (startDate < endDate || !startDate && !endDate) {
        let daysLeave = leaveRequest.getField(RequestField.LEAVE_DAYS);
        daysLeave.value = Model.millisecondsToHuman(endDate.getTime() - startDate.getTime()).days + 1;
        daysLeave.visible = true;
        let partdayPeriod = leaveRequest.getField(RequestField.PART_DAY_LEAVE);
        partdayPeriod.value = '';
        partdayPeriod.disabled = true;
    }
}


function calculateCustomLeave(leaveType: LeaveType, startDate, endDate): boolean {
    let maxAllowedDays = Number(leaveType.getField(LeaveTypeFields.DAYS_LIMIT).value);
    let maxDaysPerRequest = Number(leaveType.getField(LeaveTypeFields.MAX_DAYS_REQUEST).value);
    let frequentValue = Number(leaveType.getField(LeaveTypeFields.FREQUENT_VALUE).value);
    let frequentTypeText = leaveType.getField(LeaveTypeFields.FREQUENT_TYPE).text.toLowerCase();
    leavePeriod = Model.millisecondsToHuman(new Date(endDate).getTime() - new Date(startDate).getTime()).days + 1;

    if (maxDaysPerRequest && leavePeriod > maxDaysPerRequest)
        return false;

    let requestDate = new Date(leaveRequest.getField(RequestField.REQUEST_DATE).value.toString());
    let previousApprovedRequests = new LeaveRequest()
        .where(EmployeeField.EMPLOYEE, '==', leaveRequest.getField(EmployeeField.EMPLOYEE).value)
        .where(RequestField.TYPE, '==', leaveRequest.getField(RequestField.TYPE).value)
        .where(RequestField.STATUS, '==', ApprovalStatus.APPROVED);

    if (frequentValue && frequentTypeText) {
        if (frequentTypeText == PeriodFrequentType.Days) {
            requestDate.setDate(requestDate.getDate() - frequentValue)
            previousApprovedRequests.where(RequestField.START, 'after', Model.toNSDateString(requestDate));

        } else if (frequentTypeText == PeriodFrequentType.Months) {
            requestDate.setDate(1);
            requestDate.setMonth(requestDate.getMonth() - frequentValue);
            previousApprovedRequests.where(RequestField.START, 'after', Model.toNSDateString(requestDate));

        } else if (frequentTypeText == PeriodFrequentType.Years) {
            requestDate.setDate(1);
            requestDate.setMonth(0);
            requestDate.setFullYear(requestDate.getFullYear() - frequentValue);
            previousApprovedRequests.where(RequestField.START, 'after', Model.toNSDateString(requestDate));
        }

        let previousLeaveDays = previousApprovedRequests.find([RequestField.LEAVE_DAYS]);
        if (frequentTypeText == PeriodFrequentType.Lifetime) {
            if (previousLeaveDays && previousLeaveDays.length >= frequentValue)
                return false;
        }

        if (previousLeaveDays && previousLeaveDays.length) {
            let totalPreviousLeaves = 0;
            for (let i = 0; i < previousLeaveDays.length; i++) {
                totalPreviousLeaves += Number(previousLeaveDays[i][RequestField.LEAVE_DAYS]);
            }
            if (totalPreviousLeaves >= maxAllowedDays)
                return false;
        }
        //if(previousLeaveDays[''] >=  maxAllowedDays)
        //return false;
    }
    return true;
}