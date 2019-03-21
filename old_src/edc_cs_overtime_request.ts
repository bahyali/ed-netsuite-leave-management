/**
 * @NScriptName ClientScript Overtime Request
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

import { EntryPoints } from 'N/types';
import runtime = require('N/runtime');
import search = require('N/search');
import record = require('N/record');
import serverWidget = require('N/ui/serverWidget');
import redirect = require('N/redirect');
import { request } from '@hitc/netsuite-types/N/http';


//Shared Variables
var currentUser = runtime.getCurrentUser();
var standardHourRate = 0;
var morningHourRate = 0;
var nightHourRate = 0;
var holidayHourRate = 0;
var maxAllowedHours = 0;
// Validation Variables
var wasApproved;
var hasData;

export function pageInit(context: EntryPoints.Client.pageInitContext) {

    var empId = currentUser.id;
    var overtimeReq = context.currentRecord;
    var thisYear = new Date().getFullYear();

    if (context.mode == 'create') {
        var employee = search.lookupFields({
            type: search.Type.EMPLOYEE,
            id: empId.toString(),
            columns: ['title', 'supervisor', 'subsidiary']  // title = JobTitle
        });
        overtimeReq.setValue('custrecord_edc_overtime_req_jobtitle', employee.title);
        overtimeReq.setValue('custrecord_edc_overtime_req_year', thisYear);
        overtimeReq.setValue('custrecord_edc_overtime_req_subsidiary', employee.subsidiary[0].value);

        // Giving the Administrator ONLY the role to change the Employee        // 3 = Administrator Role
        var roleCanRequest = runtime.getCurrentScript().getParameter({ name: 'custscript_edc_vac_req_role_sp' });
        if (currentUser.role == 3 || currentUser.role == roleCanRequest) {
            overtimeReq.getField({ fieldId: 'custrecord_edc_overtime_req_emp' }).isDisabled = false;
        }

        if (currentUser.role == 3 || currentUser.id == employee.supervisor[0].value || currentUser.role == roleCanRequest) {
            overtimeReq.getField({ fieldId: 'custrecord_edc_overtime_req_status' }).isDisabled = false;
        }

    } else if (context.mode = 'edit') {

        // var empId = overtimeReq.getValue('custrecord_edc_overtime_req_emp');
        var supervisor = overtimeReq.getValue('custrecord_edc_overtime_req_supervisor');
        var reqStatus = overtimeReq.getValue('custrecord_edc_overtime_req_status');
        // Get the Overtime Hours Rates
        var subsidiary = overtimeReq.getValue('custrecord_edc_overtime_req_subsidiary');
        overtimeReq.setValue('custrecord_edc_overtime_req_subsidiary', subsidiary);

        // Make Vacation Status Mandatory
        overtimeReq.getField({ fieldId: 'custrecord_edc_overtime_req_status' }).isMandatory = true;

        // Giving the Administrator & Employee's Supervisor ONLY the access to Approve/Reject the request (If it isn't already approved)
        if ((currentUser.role == 3 || currentUser.id == supervisor) && reqStatus != 2) {    // 3 = Administrator Role
            overtimeReq.getField({ fieldId: 'custrecord_edc_overtime_req_status' }).isDisabled = false;
        }

        // Disable Editing for the record if it's approved
        if (reqStatus == 2 || reqStatus == 3) {          // 2 = Approved || 3 = Rejected
            overtimeReq.getField({ fieldId: 'custrecord_edc_overtime_req_status' }).isDisabled = true;
            overtimeReq.getField({ fieldId: 'custrecord_edc_overtime_req_type' }).isDisabled = true;
            overtimeReq.getField({ fieldId: 'custrecord_edc_overtime_req_date' }).isDisabled = true;
            overtimeReq.getField({ fieldId: 'custrecord_edc_overtime_req_memo' }).isDisabled = true;
            overtimeReq.getField({ fieldId: 'custrecord_edc_overtime_req_period' }).isDisabled = true;
            alert('Warning!\nApproved & Rejected Requests cannot be edited!');
            wasApproved = true;
            return;
        }
    }
}




export function fieldChanged(context: EntryPoints.Client.fieldChangedContext) {

    var overtimeReq = context.currentRecord;
    // Getting the selected Employee  
    var empId = overtimeReq.getValue('custrecord_edc_overtime_req_emp');

    // When Choosing/Changing the Employee
    if (context.fieldId == 'custrecord_edc_overtime_req_emp') {

        // Setting the Employee's Basic Data
        var thisEmployee = search.lookupFields({
            type: search.Type.EMPLOYEE,
            id: empId.toString(),
            columns: ['title', 'subsidiary', 'supervisor', 'department']
        });

        var jobTitle = thisEmployee.title;
        var subsidiary = (thisEmployee.subsidiary.length) ? thisEmployee.subsidiary[0].value : '';
        var supervisor = (thisEmployee.supervisor.length) ? thisEmployee.supervisor[0].value : '';
        var department = (thisEmployee.department.length) ? thisEmployee.department[0].value : '';

        overtimeReq.setValue('custrecord_edc_overtime_req_jobtitle', jobTitle);
        overtimeReq.setValue('custrecord_edc_overtime_req_subsidiary', subsidiary);
        overtimeReq.setValue('custrecord_edc_overtime_req_department', department);
        overtimeReq.setValue('custrecord_edc_overtime_req_supervisor', supervisor);
    }


    // Getting the Overtime Hours Rates based on the Subsidiary
    if (context.fieldId == 'custrecord_edc_overtime_req_subsidiary') {

        var empSubsidiary = Number(overtimeReq.getValue('custrecord_edc_overtime_req_subsidiary'));
        var thisYear = new Date().getFullYear();

        if (!empSubsidiary) {
            alert('Error: This Employee doesn\'t have a subsidiary and cannot request an overtime request');
            hasData = false;
            return false;
        } else hasData = true;

        var rulesSearch = search.create({
            type: 'customrecord_edc_overtime_rule',
            filters: [
                search.createFilter({
                    name: 'custrecord_edc_overtime_rule_year',
                    operator: search.Operator.CONTAINS,
                    values: thisYear,
                }),
                search.createFilter({
                    name: 'custrecord_edc_overtime_rule_subsidiary',
                    operator: search.Operator.ANYOF,
                    values: empSubsidiary
                })],
            columns: [
                'custrecord_edc_overtime_rule_standard',
                'custrecord_edc_overtime_rule_morning',
                'custrecord_edc_overtime_rule_night',
                'custrecord_edc_overtime_rule_holiday',
                'custrecord_edc_overtime_rule_max_hours']
        }).run().getRange({ start: 0, end: 1 });

        if (rulesSearch[0]) {
            standardHourRate = Number(rulesSearch[0].getValue('custrecord_edc_overtime_rule_standard'));
            morningHourRate = Number(rulesSearch[0].getValue('custrecord_edc_overtime_rule_morning'));
            nightHourRate = Number(rulesSearch[0].getValue('custrecord_edc_overtime_rule_night'));
            holidayHourRate = Number(rulesSearch[0].getValue('custrecord_edc_overtime_rule_holiday'));
            maxAllowedHours = Number(rulesSearch[0].getValue('custrecord_edc_overtime_rule_max_hours'));
            hasData = true;
        } else {
            alert('Error: The Employee\'s subsidiary doesn\'t have an Overtime Rule for this year');
            hasData = false;
        }
    }


    if (context.fieldId == 'custrecord_edc_overtime_req_morning_hour' || context.fieldId == 'custrecord_edc_overtime_req_night_hour' ||
        context.fieldId == 'custrecord_edc_overtime_req_holiday_hour') {

        var standardHours = Number(overtimeReq.getValue('custrecord_edc_overtime_req_std_hour'));
        var morningHours = Number(overtimeReq.getValue('custrecord_edc_overtime_req_morning_hour'));
        var nightHours = Number(overtimeReq.getValue('custrecord_edc_overtime_req_night_hour'));
        var holidayHours = Number(overtimeReq.getValue('custrecord_edc_overtime_req_holiday_hour'));

        // Calculate Overtime Hours with their Rates (Based on Overtime Rules)
        var morningHoursCalc = morningHours * morningHourRate;
        var nightHoursCalc = nightHours * nightHourRate;
        var holidayHoursCalc = holidayHours * holidayHourRate;

        // Total Over time Calculations
        var spentHours = morningHours + nightHours + holidayHours;
        overtimeReq.setValue('custrecord_edc_overtime_req_spent_hours', spentHours);

        var totalOvertimeHours = morningHoursCalc + nightHoursCalc + holidayHoursCalc;
        overtimeReq.setValue('custrecord_edc_overtime_req_total_hours', totalOvertimeHours);

        var dayOvertime  = totalOvertimeHours / standardHourRate;
        var overtimeDays = Math.floor(4 * (totalOvertimeHours / 8)) / 4;
        overtimeReq.setValue('custrecord_edc_overtime_req_days_count', overtimeDays);
    }
}



export function saveRecord(context: EntryPoints.Client.saveRecordContext) {

    var overtimeReq = context.currentRecord;
    var reqStatus = overtimeReq.getValue('custrecord_edc_overtime_req_status');

    if (!wasApproved && hasData) {         // There is no errors
        // Reset the Request Date & Time to the Time Now! 
        if (reqStatus == 1 || !reqStatus) {       // 1 = Pending Approval
            var now = new Date();
            overtimeReq.setValue('custrecord_edc_overtime_req_request_date', now);
            overtimeReq.setValue('custrecord_edc_overtime_req_request_time', now);
            overtimeReq.setValue('custrecord_edc_overtime_req_status', 1);

        } else if (reqStatus == 2) {    // Approved

            var empId = Number(overtimeReq.getValue('custrecord_edc_overtime_req_emp'));
            var overtimeDays = Number(overtimeReq.getValue('custrecord_edc_overtime_req_days_count'));
            var thisYear = new Date().getFullYear();
            // Getting the Employee's vacations balance
            var empVacs = search.create({
                type: 'customrecord_edc_emp_vac_balance',
                filters: [
                    search.createFilter({
                        name: 'custrecord_edc_vac_balance_emp_name',
                        operator: search.Operator.ANYOF,
                        values: empId
                    }),
                    search.createFilter({
                        name: 'custrecord_edc_vac_balance_year',
                        operator: search.Operator.CONTAINS,
                        values: thisYear
                    })],
                columns: ['custrecord_edc_vac_balance_overtime_days']
            });

            // Get the Previous Employee's Overtime Days Balance
            var empOvertimeBalnce = empVacs.run().getRange({ start: 0, end: 1 })[0];
            if (empOvertimeBalnce) {
                var previousOvertimeDays = Number(empOvertimeBalnce.getValue('custrecord_edc_vac_balance_overtime_days'));
                var newOvertimeDaysBalance = previousOvertimeDays + overtimeDays;

                var empVacBalanceRecord = record.load({
                    type: 'customrecord_edc_emp_vac_balance',
                    id: empOvertimeBalnce.id,         // The Emplooyee's Vacations Balance ID
                    isDynamic: true,
                });

                empVacBalanceRecord.setValue('custrecord_edc_vac_balance_overtime_days', newOvertimeDaysBalance);
                empVacBalanceRecord.save();

            } else {
                alert('Error!\nThis employee Doesn\'t have vacations balance record');
                return false;
            }


        }
        return true;

    } else {
        if (wasApproved) alert('Error!\nApproved & Rejected Requests cannot be saved!');
        else alert('Error Missing Data!\n Cannot submit the request due to Overtime Rules missing data');
        return false;
    }
}