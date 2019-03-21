/**
 * @NScriptName ClientScript My Vacation Requests (Employees' Requests for Vacations)
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

import { EntryPoints } from 'N/types';
import search = require('N/search');
import record = require('N/record');
import runtime = require('N/runtime');
import serverWidget = require('N/ui/serverWidget');
import redirect = require('N/redirect');
import { request } from '@hitc/netsuite-types/N/http';

//************************//
runtime.Permission.CREATE;
runtime.getCurrentUser().getPermission({ name: '' });
var tomorrow = new Date(new Date().setDate(new Date().getDate() + 1));
//************************//


//Shared Variables
var currentUser = runtime.getCurrentUser();
// Employee's Basic Information
var empBalance_id;
var jobTitle;
var subsidiary;
var supervisor;
var department;
// Employee's Balance
var transferredBalance = 0;
var annualBalance = 0;
var replacementBalance = 0;
var casualBalance = 0;
var sickBalance = 0;
var unpaidBalance = 0;
var totalRegularBalance = 0;
// Additional Configurations
var acceptPastDates;
var casualFromAnnual_bool = false;
var weekendDeduction_bool = false;
// Validation Checks
var preventSaving;
var hasBalance;
var wasApproved;



export function pageInit(context: EntryPoints.Client.pageInitContext) {

    

    // Hiding the 'List' and 'Search' Links from the Employee Center.
    if (currentUser.roleCenter == 'EMPLOYEE') {
        document.getElementById('NS_MENU_ID0-item0').setAttribute('style', 'display:none');
        document.getElementById('NS_MENU_ID0-item1').setAttribute('style', 'display:none');
    }

    empId = currentUser.id;
    var vacRequest = context.currentRecord;
    var thisYear = new Date().getFullYear();
    var editorRole = runtime.getCurrentScript().getParameter({ name: 'custscript_btrip_editor_role' });

    // Member function for setting values into the Current Request Record Fields
    function setVacFieldsValues(vacBalanceArr) {
        vacRequest.setValue('custrecord_edc_vac_req_blc_transferred', vacBalanceArr[0]);        // blc = Balance
        vacRequest.setValue('custrecord_edc_vac_req_blc_annual', vacBalanceArr[1]);
        vacRequest.setValue('custrecord_edc_vac_req_blc_replacement', vacBalanceArr[2]);
        vacRequest.setValue('custrecord_edc_vac_req_blc_casual', vacBalanceArr[3]);
        vacRequest.setValue('custrecord_edc_vac_req_blc_sick', vacBalanceArr[4]);
        vacRequest.setValue('custrecord_edc_vac_req_blc_unpaid', vacBalanceArr[5]);
        vacRequest.setValue('custrecord_edc_vac_req_blc_total_regular', vacBalanceArr[6]);
    }


    try {
        // Checking whether the vacation type accept past dates
        var supervisor = vacRequest.getValue('custrecord_edc_vac_req_supervisor');
        var vacType = vacRequest.getValue('custrecord_edc_vac_req_type');
        if (vacType) {
            acceptPastDates = Boolean(search.lookupFields({
                type: 'customrecord_edc_vac_type',
                id: vacType.toString(),
                columns: ['custrecord_edc_vac_type_accept_past_date']
            }).custrecord_edc_vac_type_accept_past_date);
        }



        if (context.mode == 'create') {
            vacRequest.setValue('custrecord_edc_vac_req_year', thisYear);

            if (currentUser.roleCenter != 'EMPLOYEE') {
                // Getting current Record ID from the current URL
                var recordId = Number(document.URL.split('rectype=')[1].split('&')[0]);
                var rolesSearch = search.create({
                    type: 'customrecord_edc_roles_management',
                    filters: [search.createFilter({
                        name: 'custrecord_edc_role_mng_record_type',
                        operator: search.Operator.ANYOF,
                        values: recordId,
                    })],
                    columns: ['custrecord_edc_role_mng_roles_list']
                }).run().getRange({ start: 0, end: 1 });

                var accessRoles = [3];             // 3 = Administrator Role
                if (rolesSearch[0]) {
                    accessRoles = rolesSearch[0].getValue('custrecord_edc_role_mng_roles_list').toString().split(',');
                }

                for (var i = 0; i < accessRoles.length; i++) {
                    if (currentUser.role == 3 || currentUser.role == accessRoles[i]) {
                        vacRequest.getField({ fieldId: 'custrecord_edc_vac_req_emp_name' }).isDisabled = false;

                        var employee = search.lookupFields({
                            type: search.Type.EMPLOYEE,
                            id: empId.toString(),
                            columns: ['title']  // title = JobTitle
                        });
                        vacRequest.setValue('custrecord_edc_btrip_jobtitle', employee.title);
                        break;
                    }
                }
            }

            //Get Employee's Data
            hasBalance = getEmpData(empId);

            var vacBalanceArr = [];
            vacBalanceArr[0] = transferredBalance;
            vacBalanceArr[1] = annualBalance;
            vacBalanceArr[2] = replacementBalance;
            vacBalanceArr[3] = casualBalance;
            vacBalanceArr[4] = sickBalance;
            vacBalanceArr[5] = unpaidBalance;
            vacBalanceArr[6] = totalRegularBalance;
            setVacFieldsValues(vacBalanceArr);

        } else if (context.mode = 'edit') {

            var empId = vacRequest.getValue('custrecord_edc_vac_req_emp_name');
            var vacStatus = vacRequest.getValue('custrecord_edc_vac_req_status');
            var vacStartDate = vacRequest.getValue('custrecord_edc_vac_req_start');
            var vacEndDate = vacRequest.getValue('custrecord_edc_vac_req_end');

            // Giving the Administrator & Employee's Supervisor ONLY the access to Approve/Reject the request (If it isn't already approved)
            if ((currentUser.role == 3 || currentUser.id == supervisor) && vacStatus != 2) {
                vacRequest.getField({ fieldId: 'custrecord_edc_vac_req_status' }).isDisabled = false;
                // If the Current User is an Admin ,but not the Employee who requested the vacation, make 'Vacation Type' unchangeable
                if (currentUser.id != empId) {
                    vacRequest.getField({ fieldId: 'custrecord_edc_vac_req_type' }).isDisabled = true;
                    vacRequest.getField({ fieldId: 'custrecord_edc_vac_req_start' }).isDisabled = true;
                    vacRequest.getField({ fieldId: 'custrecord_edc_vac_req_end' }).isDisabled = true;
                    return;
                } else {                                                                                           // 1 = Annual
                    if (new Date(vacStartDate.toString()).getTime() === new Date(vacEndDate.toString()).getTime() && vacType == 1) {
                        vacRequest.setValue('custrecord_edc_vac_req_leave_days', 0);
                        vacRequest.getField({ fieldId: 'custrecord_edc_vac_req_leave_partday' }).isDisabled = false;
                        vacRequest.getField({ fieldId: 'custrecord_edc_vac_req_leave_days' }).isVisible = false;
                    }
                }
            }

            // Disable Editing for the record if it's approved
            if (vacStatus == 2 || vacStartDate == 3) {          // 2 = Approved ID & 3 = Rejected (in the list)
                vacRequest.getField({ fieldId: 'custrecord_edc_vac_req_emp_name' }).isDisabled = true;
                vacRequest.getField({ fieldId: 'custrecord_edc_vac_req_status' }).isDisabled = true;
                vacRequest.getField({ fieldId: 'custrecord_edc_vac_req_type' }).isDisabled = true;
                vacRequest.getField({ fieldId: 'custrecord_edc_vac_req_start' }).isDisabled = true;
                vacRequest.getField({ fieldId: 'custrecord_edc_vac_req_end' }).isDisabled = true;
                vacRequest.getField({ fieldId: 'custrecord_edc_vac_req_leave_partday' }).isDisabled = true;
                alert('Warning!\nApproved & Rejected Requests cannot be edited!');
                wasApproved = true;
                return;
            }

            getEmpData(empId);      // Get Employee's Data
            var vacPartDay = vacRequest.getValue('custrecord_edc_vac_req_leave_partday');
            var vacDaysCount = vacRequest.getValue('custrecord_edc_vac_req_leave_days');
            var vacBalanceArr = deductVacations(vacPartDay, vacDaysCount, vacType, empId, vacStartDate);
            setVacFieldsValues(vacBalanceArr);
        }
    } catch (err) {
        alert('Something went wrong,\nPlease contact your system administrator');
        var ex = err.toJSON();
        var errorMsg = 'Error: ' + ex.name + '\n' + 'Message: ' + ex.message;
        log.error(ex.name, errorMsg);
    }
}



export function fieldChanged(context: EntryPoints.Client.fieldChangedContext) {

    var vacRequest = context.currentRecord;
    // Member function for setting values into the Current Request Record Fields
    function setVacFieldsValues(vacBalanceArr) {
        vacRequest.setValue('custrecord_edc_vac_req_blc_transferred', vacBalanceArr[0]);        // blc = Balance
        vacRequest.setValue('custrecord_edc_vac_req_blc_annual', vacBalanceArr[1]);
        vacRequest.setValue('custrecord_edc_vac_req_blc_replacement', vacBalanceArr[2]);
        vacRequest.setValue('custrecord_edc_vac_req_blc_casual', vacBalanceArr[3]);
        vacRequest.setValue('custrecord_edc_vac_req_blc_sick', vacBalanceArr[4]);
        vacRequest.setValue('custrecord_edc_vac_req_blc_unpaid', vacBalanceArr[5]);
        vacRequest.setValue('custrecord_edc_vac_req_blc_total_regular', vacBalanceArr[6]);
    }



    try {
        // When Choosing/Changing the Employee
        if (context.fieldId == 'custrecord_edc_vac_req_emp_name') {
            // Getting the selected Employee  
            var empId = vacRequest.getValue('custrecord_edc_vac_req_emp_name');
            getEmpData(empId);      //Getting Basic Employee's Vacations Balance

            // Setting the Employee's Basic Data
            var thisEmployee = search.lookupFields({
                type: search.Type.EMPLOYEE,
                id: empId.toString(),
                columns: ['title', 'subsidiary', 'supervisor', 'department']
            });

            jobTitle = thisEmployee.title;
            subsidiary = (thisEmployee.subsidiary.length) ? thisEmployee.subsidiary[0].value : thisEmployee.subsidiary;
            supervisor = (thisEmployee.supervisor.length) ? thisEmployee.supervisor[0].value : thisEmployee.supervisor;
            department = (thisEmployee.department.length) ? thisEmployee.department[0].value : thisEmployee.department;

            vacRequest.setValue('custrecord_edc_vac_req_jobtitle', jobTitle);
            vacRequest.setValue('custrecord_edc_vac_req_subsidiary', subsidiary);
            vacRequest.setValue('custrecord_edc_vac_req_department', department);
            vacRequest.setValue('custrecord_edc_vac_req_supervisor', supervisor);
            vacRequest.setValue('custrecord_edc_vac_req_start', '');           // Free Start Date
            vacRequest.setValue('custrecord_edc_vac_req_end', '');             // Free End Date
            vacRequest.setValue('custrecord_edc_vac_req_leave_partday', '');   // Free Hours Count
            vacRequest.setValue('custrecord_edc_vac_req_leave_days', 0);       // Free Days Count
            vacRequest.getField({ fieldId: 'custrecord_edc_vac_req_leave_partday' }).isDisabled = true;
            vacRequest.getField({ fieldId: 'custrecord_edc_vac_req_leave_days' }).isVisible = true;

            var vacBalanceArr = [];
            vacBalanceArr[0] = transferredBalance;
            vacBalanceArr[1] = annualBalance;
            vacBalanceArr[2] = replacementBalance;
            vacBalanceArr[3] = casualBalance;
            vacBalanceArr[4] = sickBalance;
            vacBalanceArr[5] = unpaidBalance;
            vacBalanceArr[6] = totalRegularBalance;
            setVacFieldsValues(vacBalanceArr);
        }


        // When Changing the Number of Vacation Type - or - Number of Vacation Days
        if (context.fieldId == 'custrecord_edc_vac_req_type' || context.fieldId == 'custrecord_edc_vac_req_leave_days') {
            var empId = vacRequest.getValue('custrecord_edc_vac_req_emp_name');
            var vacStartDate = vacRequest.getValue('custrecord_edc_vac_req_start');
            var vacEndDate = vacRequest.getValue('custrecord_edc_vac_req_end');
            var vacType = vacRequest.getValue('custrecord_edc_vac_req_type');
            var requestDate = vacRequest.getValue('custrecord_edc_vac_req_date');

            // Checking whether the vacation type accept past dates
            if (context.fieldId == 'custrecord_edc_vac_req_type') {
                acceptPastDates = Boolean(search.lookupFields({
                    type: 'customrecord_edc_vac_type',
                    id: vacType.toString(),
                    columns: ['custrecord_edc_vac_type_accept_past_date']
                }).custrecord_edc_vac_type_accept_past_date);
            }

            if (vacStartDate && vacEndDate) {
                if (vacType) {
                    if (!acceptPastDates) {
                        if (requestDate > vacStartDate) {
                            alert('You cannot request a vacation in the past!');
                            vacRequest.setValue('custrecord_edc_vac_req_start', '');
                            return false;
                        }
                    }

                    if (vacType == 1 && new Date(vacStartDate).getTime() == new Date(vacEndDate).getTime()) {
                        vacRequest.setText('custrecord_edc_vac_req_leave_partday', '1');
                        vacRequest.getField({ fieldId: 'custrecord_edc_vac_req_leave_partday' }).isDisabled = false;
                        vacRequest.getField({ fieldId: 'custrecord_edc_vac_req_leave_days' }).isVisible = false;
                    } else {
                        vacRequest.setValue('custrecord_edc_vac_req_leave_partday', '');
                        vacRequest.getField({ fieldId: 'custrecord_edc_vac_req_leave_partday' }).isDisabled = true;
                        vacRequest.getField({ fieldId: 'custrecord_edc_vac_req_leave_days' }).isVisible = true;
                    }
                    var vacPartDay = Number(vacRequest.getText('custrecord_edc_vac_req_leave_partday'));
                    var vacDaysCount = Number(vacRequest.getValue('custrecord_edc_vac_req_leave_days'));
                    // Deduct the vacation from the its balance depending on its Type
                    var updatedVacBalance = deductVacations(vacPartDay, vacDaysCount, vacType, empId, vacEndDate);
                    setVacFieldsValues(updatedVacBalance);
                } else {
                    alert('You should select a Vacation Type');
                    return false;
                }
            }
        }


        if (context.fieldId == 'custrecord_edc_vac_req_leave_partday') {
            var vacType = vacRequest.getValue('custrecord_edc_vac_req_type');
            var vacPartDay = Number(vacRequest.getText('custrecord_edc_vac_req_leave_partday'));
            var empId = vacRequest.getValue('custrecord_edc_vac_req_emp_name');
            var vacStartDate = vacRequest.getValue('custrecord_edc_vac_req_start');

            var updatedVacBalance = deductVacations(vacPartDay, 0, vacType, empId, vacStartDate);
            setVacFieldsValues(updatedVacBalance);
        }

        // When Changing the Start/End Date
        if (context.fieldId == 'custrecord_edc_vac_req_start' || context.fieldId == 'custrecord_edc_vac_req_end') {

            var empId = vacRequest.getValue('custrecord_edc_vac_req_emp_name');
            var requestDate = vacRequest.getValue('custrecord_edc_vac_req_date');
            var vacStartDate = vacRequest.getValue('custrecord_edc_vac_req_start');
            var vacEndDate = vacRequest.getValue('custrecord_edc_vac_req_end');
            var vacType = vacRequest.getValue('custrecord_edc_vac_req_type');

            if (vacType) {
                // Checking if the request not in the past
                if (context.fieldId == 'custrecord_edc_vac_req_start' && vacStartDate) {
                    if (!acceptPastDates) {
                        if (requestDate > vacStartDate) {
                            alert('You cannot request a vacation in the past!');
                            vacRequest.setValue('custrecord_edc_vac_req_start', '');
                            vacRequest.setValue('custrecord_edc_vac_req_end', '');
                            return false;
                        }
                    }
                }


                if (vacStartDate && vacEndDate) {
                    // Calculating the No. of Vacation Days
                    if (vacStartDate <= vacEndDate) {
                        var vacDaysCount = 0;

                        // If the Start Date is the End Date, Allow the user to add Part-Day Vacation [Regual Vacs Only]
                        if (new Date(vacStartDate).getTime() == new Date(vacEndDate).getTime() && vacType == 1) {
                            vacRequest.setText('custrecord_edc_vac_req_leave_partday', '1');
                            vacRequest.getField({ fieldId: 'custrecord_edc_vac_req_leave_partday' }).isDisabled = false;
                            vacRequest.getField({ fieldId: 'custrecord_edc_vac_req_leave_days' }).isVisible = false;
                        } else {
                            vacRequest.setValue('custrecord_edc_vac_req_leave_partday', '');
                            vacRequest.getField({ fieldId: 'custrecord_edc_vac_req_leave_partday' }).isDisabled = true;
                            vacRequest.getField({ fieldId: 'custrecord_edc_vac_req_leave_days' }).isVisible = true;
                        }
                        vacDaysCount = ((new Date(vacEndDate) - new Date(vacStartDate)) / 86400000) + 1;

                        if (vacDaysCount && weekendDeduction_bool) {
                            vacDaysCount = deductWeekends(vacDaysCount, vacStartDate, subsidiary);
                        }
                        vacRequest.setValue('custrecord_edc_vac_req_leave_days', vacDaysCount);
                        var updatedVacBalance = deductVacations('', vacDaysCount, vacType, empId, vacStartDate);
                        setVacFieldsValues(updatedVacBalance);

                    } else {
                        alert('Start Date cannot be later than End Date!');
                        vacRequest.setValue('custrecord_edc_vac_req_end', '');
                        return false;
                    }
                }
            } else alert('Please select the vacation type first');
        }
    } catch (err) {
        alert('Something went wrong,\nPlease contact your system administrator');
        try {
            var ex = err.toJSON();
        } catch (error) {
            error.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t").replace(/\f/g, "\\f");
            var ex = JSON.parse(error);
        } finally {
            var errorMsg = 'Error: ' + ex.name + '\n' + 'Message: ' + ex.message;
            log.error(ex.name, errorMsg);
        }
    }
}



export function saveRecord(context: EntryPoints.Client.saveRecordContext) {
    try {
        var vacRequest = context.currentRecord;
        var vacStatus = vacRequest.getValue('custrecord_edc_vac_req_status');

        // var requestDate = vacRequest.getValue('custrecord_edc_vac_req_date');
        // var timeNow = new Date();
        // if (timeNow.getTime() !== requestDate.getTime()) {
        //     alert('Request Date has changed \nPlease Refresh the page and try again');
        //     return false;
        // }

        if (!preventSaving && hasBalance && !wasApproved) {         // There is no errors
            if (vacStatus == 2) {   // 2 = Approved
                // Getting the remaining Annual & Casual Vacations
                var currentTransferred = vacRequest.getValue('custrecord_edc_vac_req_blc_transferred');
                var currentAnnual = vacRequest.getValue('custrecord_edc_vac_req_blc_annual');
                var currentCasual = vacRequest.getValue('custrecord_edc_vac_req_blc_casual');
                var currentSick = vacRequest.getValue('custrecord_edc_vac_req_blc_sick');
                var currentReplacement = vacRequest.getValue('custrecord_edc_vac_req_blc_replacement');
                var currentUnpaid = vacRequest.getValue('custrecord_edc_vac_req_blc_unpaid');
                var thisYear = new Date().getFullYear();

                // Getting the Selected Employee to get the Record ID for that Employee in Vacations Table
                var empId = vacRequest.getValue('custrecord_edc_vac_req_emp_name');

                if (!empBalance_id) {
                    var empVacations = search.create({
                        type: 'customrecord_edc_emp_vac_balance',
                        filters: [
                            search.createFilter({
                                name: 'custrecord_edc_vac_balance_emp_name',
                                operator: search.Operator.ANYOF,
                                values: Number(empId)
                            }),
                            search.createFilter({
                                name: 'custrecord_edc_vac_balance_year',
                                operator: search.Operator.CONTAINS,
                                values: thisYear
                            })]
                    }).run().getRange({ start: 0, end: 1 });

                    empBalance_id = empVacations[0].id;
                }

                var empVacRecord = record.load({
                    type: 'customrecord_edc_emp_vac_balance',
                    id: empBalance_id,
                    isDynamic: true
                });

                empVacRecord.setValue('custrecord_edc_vac_balance_transferred', currentTransferred);
                empVacRecord.setValue('custrecord_edc_vac_balance_casual', currentCasual);
                empVacRecord.setValue('custrecord_edc_vac_balance_annual', currentAnnual);
                empVacRecord.setValue('custrecord_edc_vac_balance_sick', currentSick);
                empVacRecord.setValue('custrecord_edc_vac_balance_replacement', currentReplacement);
                empVacRecord.setValue('custrecord_edc_vac_balance_unpaid', currentUnpaid);
                empVacRecord.setValue('custrecord_edc_vac_balance_total_regular',
                    Number(currentAnnual) + Number(currentTransferred) + Number(currentReplacement));   //Total

                empVacRecord.save();
            }                       // Reset the Request Date & Time to the Time Now! 
            else if (vacStatus == 1 && currentUser.id == empId) {       // 1 = Pending Approval
                var now = new Date();
                vacRequest.setValue('custrecord_edc_vac_req_date', now);
                vacRequest.setValue('custrecord_edc_vac_req_time', now);
            }
            return true;

        } else if (wasApproved) {
            alert('Warning!\nApproved & Rejected Requests cannot be edited!');
            return false;
        } else {
            alert('Please Check the Start Date, End Date, Vacation Type' +
                '\nand Having enough Vacation Balance before submitting the Request');
            return false;
        }
    } catch (err) {
        alert('Something went wrong,\nPlease contact your system administrator');
        var ex = err.toJSON();
        var errorMsg = 'Error: ' + ex.name + '\n' + 'Message: ' + ex.message;
        log.error(ex.name, errorMsg);
    }
}





// ========================================= [ Helper Functions ] =========================================

// Get Employee's Vacations Balance and Configurations
function getEmpData(empId) {
    // ================= Load the Selected Employee Vacations Balance ============
    var thisYear = new Date().getFullYear();
    var empVacationsSearch = search.create({
        type: 'customrecord_edc_emp_vac_balance',
        filters: [
            search.createFilter({
                name: 'custrecord_edc_vac_balance_emp_name',
                operator: search.Operator.ANYOF,
                values: Number(empId)
            }),
            search.createFilter({
                name: 'custrecord_edc_vac_balance_year',
                operator: search.Operator.CONTAINS,
                values: thisYear
            })],
        columns: [
            search.createColumn({ name: 'custrecord_edc_vac_balance_jobtitle' }),
            search.createColumn({ name: 'custrecord_edc_vac_balance_subsidiary' }),
            search.createColumn({ name: 'custrecord_edc_vac_balance_department' }),
            search.createColumn({ name: 'custrecord_edc_vac_balance_supervisor' }),

            search.createColumn({ name: 'custrecord_edc_vac_balance_transferred' }),
            search.createColumn({ name: 'custrecord_edc_vac_balance_annual' }),
            search.createColumn({ name: 'custrecord_edc_vac_balance_casual' }),
            search.createColumn({ name: 'custrecord_edc_vac_balance_sick' }),
            search.createColumn({ name: 'custrecord_edc_vac_balance_replacement' }),
            search.createColumn({ name: 'custrecord_edc_vac_balance_unpaid' }),
            search.createColumn({ name: 'custrecord_edc_vac_balance_total_regular' }),

            search.createColumn({ name: 'custrecord_edc_vac_balance_casual_cb' }),
            search.createColumn({ name: 'custrecord_edc_vac_balance_weekends_cb' }),
            search.createColumn({ name: 'custrecord_edc_vac_balance_weekends_list' }),
        ]
    });

    var empVacBalance = empVacationsSearch.run().getRange({
        start: 0,
        end: 1
    });

    if (empVacBalance[0]) {
        empBalance_id = empVacBalance[0].id;
        jobTitle = empVacBalance[0].getValue('custrecord_edc_vac_balance_jobtitle');
        subsidiary = Number(empVacBalance[0].getValue('custrecord_edc_vac_balance_subsidiary'));
        department = Number(empVacBalance[0].getValue('custrecord_edc_vac_balance_department'));
        supervisor = Number(empVacBalance[0].getValue('custrecord_edc_vac_balance_supervisor'));

        transferredBalance = Number(empVacBalance[0].getValue('custrecord_edc_vac_balance_transferred'));
        annualBalance = Number(empVacBalance[0].getValue('custrecord_edc_vac_balance_annual'));
        casualBalance = Number(empVacBalance[0].getValue('custrecord_edc_vac_balance_casual'));
        sickBalance = Number(empVacBalance[0].getValue('custrecord_edc_vac_balance_sick'));
        replacementBalance = Number(empVacBalance[0].getValue('custrecord_edc_vac_balance_replacement'));
        unpaidBalance = Number(empVacBalance[0].getValue('custrecord_edc_vac_balance_unpaid'));
        totalRegularBalance = Number(empVacBalance[0].getValue('custrecord_edc_vac_balance_total_regular'));

        casualFromAnnual_bool = Boolean(empVacBalance[0].getValue('custrecord_edc_vac_balance_casual_cb'));
        weekendDeduction_bool = Boolean(empVacBalance[0].getValue('custrecord_edc_vac_balance_weekends_cb'));
        // weekendsList = Array(empVacBalance[0].getValue('custrecord_edc_vac_balance_weekends_list'));  // Array

        hasBalance = true;
        return true;
    } else {
        alert('Error: This Employee doesn\'t have vacations balance');
        transferredBalance = 0;
        annualBalance = 0;
        casualBalance = 0;
        sickBalance = 0;
        replacementBalance = 0;
        unpaidBalance = 0;
        totalRegularBalance = 0;

        hasBalance = false;
        return false;
    }
}



// Deducting Weekends from Vacation Days to get the Net Vacation Days
function deductWeekends(totalVacNo, vacStartDate, empSubsidiary) {

    var subsidiaryVacRule = search.create({
        type: 'customrecord_edc_vac_rule',
        filters: [
            search.createFilter({
                name: 'custrecord_edc_vac_rule_subsidiary',
                operator: search.Operator.ANYOF,
                values: Number(empSubsidiary)
            }),
            search.createFilter({
                name: 'custrecord_edc_vac_rule_year',
                operator: search.Operator.CONTAINS,
                values: new Date().getFullYear().toString(),
            })],
        columns: ['custrecord_edc_vac_rule_weekend_days']
    }).run().getRange({ start: 0, end: 1 });

    if (!subsidiaryVacRule[0]) {
        alert('This Employee\'s subsidiary does not have a vacation rule for this year,\nPlease contact your system administrator');
        return totalVacNo;
    } else {

        var weekendsArray = subsidiaryVacRule[0].getText('custrecord_edc_vac_rule_weekend_days').split(',');
        var netVacDaysNo = totalVacNo;
        
        for (var i = 0; i <= totalVacNo - 1; i++) {

            var vacDay = new Date(vacStartDate);
            vacDay.setDate(new Date(vacStartDate).getDate() + i);

            for (var j = 0; j < weekendsArray.length; j++) {

                if (weekendsArray[j] == 'Friday') {
                    if (vacDay.getDay() == 5) {     // 5 = Friday
                        netVacDaysNo--;
                    }
                } else if (weekendsArray[j] == 'Saturday') {
                    if (vacDay.getDay() == 6) {     // 6 = Saturday
                        netVacDaysNo--;
                    }
                } else if (weekendsArray[j] == 'Sunday') {
                    if (vacDay.getDay() == 0) {     // 0 = Sunday
                        netVacDaysNo--;
                    }
                }
            }
        }
        return netVacDaysNo;
    }
}



// Deduct the Vacation Days From Annual/Causal/Unused Vacations
function deductVacations(vacPartDay, vacDaysCount, vacType, empId, vacStartDate) {

    // Return Members
    var updatedVacBalance = [];
    var newTransBlc = transferredBalance;
    var newAnnualBlc = annualBalance;
    var newReplaceBlc = replacementBalance;
    var newCasualBlc = casualBalance;
    var newSickBlc = sickBalance;
    var newUnpaidBlc = unpaidBalance;
    // Member Variables
    var remainingBalance = 0;
    preventSaving = false;

    // Get the the actual vacation type from the Standard Vacation Types depending on the selected one
    var stdVacType = search.lookupFields({              // stdVacType = Standard Vacation Type
        type: 'customrecord_edc_vac_type',
        id: vacType.toString(),
        columns: ['custrecord_edc_vac_type_mapping']
    }).custrecord_edc_vac_type_mapping[0].text;


    if (stdVacType == 'Annual') {

        if (vacPartDay) {
            vacDaysCount = Number(vacPartDay);
        }

        // If the Employee has Transferred Vacations Balance Deduct the New Requested Vacation from them FIRST
        if (transferredBalance > 0) {
            remainingBalance = transferredBalance - vacDaysCount;
            // If still having transferred Vacations Balance, save the rest
            if (remainingBalance >= 0) {
                newTransBlc = remainingBalance;
                hasBalance = true;
            } else {
                newTransBlc = 0;
                newAnnualBlc += remainingBalance;
                if (newAnnualBlc < 0) {
                    alert('Sorry, This Employee Doesn\'t Have Enough Annual Vacations Balance');
                    hasBalance = false;
                } else {
                    hasBalance = true;
                }
            }
        } else {
            // Deduct from the Annual Vacations
            remainingBalance = annualBalance - vacDaysCount;
            if (remainingBalance >= 0) {
                newAnnualBlc = remainingBalance;
                hasBalance = true;
            } else {
                alert('Sorry, This Employee Doesn\'t Have Enough Annual Vacations Balance');
                hasBalance = false;
            }
        }

    } else if (stdVacType == 'Casual') {

        var remainingAnnual = annualBalance;
        remainingBalance = casualBalance - vacDaysCount;

        // Deduct Casual Vacations from Annual & Casual Vacations Balance
        if (casualFromAnnual_bool) {
            remainingAnnual -= vacDaysCount;
        }

        if (remainingBalance >= 0 && remainingAnnual >= 0) {
            newCasualBlc = remainingBalance;
            newAnnualBlc = remainingAnnual;
            hasBalance = true;
        } else {
            alert('Sorry, This Employee Doesn\'t Have Enough Casual Vacations Balance');
            hasBalance = false;
            newAnnualBlc = casualFromAnnual_bool ? 0 : annualBalance;
        }

    } else if (stdVacType == 'Sick') {
        remainingBalance = sickBalance - vacDaysCount;
        if (remainingBalance >= 0) {
            newSickBlc = remainingBalance;
            hasBalance = true;
        } else {
            alert('Sorry, This Employee Doesn\'t Have Enough Sick Vacations Balance');
            hasBalance = false;
        }
    } else if (stdVacType == 'Transferred') {
        remainingBalance = transferredBalance - vacDaysCount;
        if (remainingBalance >= 0) {
            newTransBlc = remainingBalance;
            hasBalance = true;
        } else {
            alert('Sorry, This Employee Doesn\'t Have Enough Transferred Vacations Balance');
            hasBalance = false;
        }

    } else if (stdVacType == 'Replacement') {
        remainingBalance = replacementBalance - vacDaysCount;
        if (remainingBalance >= 0) {
            newReplaceBlc = remainingBalance;
            hasBalance = true;
        } else {
            alert('Sorry, This Employee Doesn\'t Have Enough Replacement Vacations Balance');
            hasBalance = false;
        }
    } else if (stdVacType == 'Unpaid') {
        newUnpaidBlc += vacDaysCount;
        hasBalance = true;

    } else if (stdVacType == 'Custom') {

        // Get the Custom Vacation Types Configurations 
        var vacTypeConfig = search.lookupFields({
            type: 'customrecord_edc_vac_type',
            id: vacType.toString(),
            columns: ['custrecord_edc_vac_type_days_limit', 'custrecord_edc_vac_type_max_days_request',
                'custrecord_edc_vac_type_freq_type', 'custrecord_edc_vac_type_freq_value', 'name']
        });
        // Vacation Types Defines
        var typeName = vacTypeConfig.name;
        var typeLimit = Number(vacTypeConfig.custrecord_edc_vac_type_days_limit);
        var typeMaxDaysPerRequest = Number(vacTypeConfig.custrecord_edc_vac_type_max_days_request);
        var typeFrequentValue = Number(vacTypeConfig.custrecord_edc_vac_type_freq_value);
        var typeFrequentItem;
        var typeFrequentType;
        var typeFreqTypeText;

        if (typeFrequentValue) {
            typeFrequentItem = vacTypeConfig.custrecord_edc_vac_type_freq_type[0];
            typeFrequentType = (typeFrequentItem) ? typeFrequentItem.value : '';
            typeFreqTypeText = (typeFrequentItem) ? typeFrequentItem.text : '';
        }
        var consumedDaysCount = 0;
        var isLimitExceeded;

        // Checking if this VacDaysCount exceeded the Limit Days (In this Request)
        if (typeLimit < vacDaysCount) {

            alert('Limit Exceeded!\nThe maximum number of days allowed for ' + typeName + ' is ' + typeLimit + ' days');
            isLimitExceeded = true;
            hasBalance = false;
        }

        // Checking if this VacDaysCount exceeded the Max. allowed days per request.
        if (typeMaxDaysPerRequest && (typeMaxDaysPerRequest < vacDaysCount) && !isLimitExceeded) {

            alert('Limit Exceeded!\nThe maximum number of days allowed for ' + typeName + ' is ' + typeMaxDaysPerRequest + ' days per request');
            isLimitExceeded = true;
            hasBalance = false;
        }


        if (typeFrequentValue && !isLimitExceeded) {

            var frequent_StartDate = new Date(vacStartDate);
            if (typeFrequentType == 1) {          // 1 = Days
                frequent_StartDate.setDate(vacStartDate.getDate() - typeFrequentValue);

            } else if (typeFrequentType == 2) {    // 2 = Months
                frequent_StartDate.setMonth(vacStartDate.getMonth() - typeFrequentValue);
                frequent_StartDate.setDate(1);

            } else if (typeFrequentType == 3) {    // 3 = Years
                frequent_StartDate.setFullYear(vacStartDate.getFullYear() - typeFrequentValue);
                frequent_StartDate.setMonth(0);     // 0 = January
                frequent_StartDate.setDate(1);
            } else if (typeFreqTypeText == 'Lifetime') {
                frequent_StartDate = new Date('1/1/1900');
            }
            var freqDateStr = (frequent_StartDate.getMonth() + 1) + '/' + frequent_StartDate.getDate() + '/' + frequent_StartDate.getFullYear();

            var customTypeSearch = search.create({
                type: 'customrecord_edc_vac_request',
                filters: [
                    search.createFilter({
                        name: 'custrecord_edc_vac_req_emp_name',
                        operator: search.Operator.ANYOF,
                        values: Number(empId)
                    }),
                    search.createFilter({
                        name: 'custrecord_edc_vac_req_type',
                        operator: search.Operator.ANYOF,
                        values: vacType
                    }),
                    search.createFilter({
                        name: 'custrecord_edc_vac_req_status',
                        operator: search.Operator.ANYOF,
                        values: 2          // 2 = Approved
                    }),
                    search.createFilter({
                        name: 'custrecord_edc_vac_req_end',
                        operator: search.Operator.NOTBEFORE,
                        values: freqDateStr
                    })
                ],
                columns: ['custrecord_edc_vac_req_leave_days', 'custrecord_edc_vac_req_year']
            }).run().getRange({ start: 0, end: 99 });

            var vacRequestTimes = 0;
            for (var i = 0; i < customTypeSearch.length; i++) {
                consumedDaysCount += Number(customTypeSearch[i].getValue('custrecord_edc_vac_req_leave_days'));
                vacRequestTimes++;
            }
            consumedDaysCount += vacDaysCount;

            if (consumedDaysCount > typeLimit) {
                if (typeFreqTypeText == 'Lifetime') {
                    alert('Limit Exceeded!\nYou have requested ' + typeName + ' ' + typeFrequentValue + ' times before');
                } else {           // Any Frequent Type Except 'Lifetime' type
                    alert('Limit Exceeded!\nYou have requested a similar vacation in the last ' + typeFrequentValue + ' ' + typeFreqTypeText);
                }
                hasBalance = false;
            } else if (vacRequestTimes >= typeFrequentValue) {
                alert('Limit Exceeded!\nYou have requested ' + typeName + ' ' + vacRequestTimes + ' times before');
                hasBalance = false;
            } else {
                hasBalance = true;
            }
        } else {    // To calculate the consumed days from this type in this year
            var customTypeSearch = search.create({
                type: 'customrecord_edc_vac_request',
                filters: [
                    search.createFilter({
                        name: 'custrecord_edc_vac_req_emp_name',
                        operator: search.Operator.ANYOF,
                        values: Number(empId)
                    }),
                    search.createFilter({
                        name: 'custrecord_edc_vac_req_type',
                        operator: search.Operator.ANYOF,
                        values: vacType
                    }),
                    search.createFilter({
                        name: 'custrecord_edc_vac_req_status',
                        operator: search.Operator.ANYOF,
                        values: 2          // 2 = Approved
                    }),
                    search.createFilter({
                        name: 'custrecord_edc_vac_req_year',
                        operator: search.Operator.CONTAINS,
                        values: vacStartDate.getFullYear()
                    })
                ],
                columns: ['custrecord_edc_vac_req_leave_days']
            }).run().getRange({ start: 0, end: 99 });

            for (var i = 0; i < customTypeSearch.length; i++) {
                consumedDaysCount += Number(customTypeSearch[i].getValue('custrecord_edc_vac_req_leave_days'));
            }
            consumedDaysCount += vacDaysCount;

            if (consumedDaysCount > typeLimit) {
                alert('Limit Exceeded!\nThe remaining allowed days for ' + typeName + ' are ' + typeLimit + ' days');
                hasBalance = false;
            } else {
                hasBalance = true;
            }
        }
    }

    // Packaging vacBalance
    updatedVacBalance[0] = newTransBlc
    updatedVacBalance[1] = newAnnualBlc;
    updatedVacBalance[2] = newReplaceBlc;
    updatedVacBalance[3] = newCasualBlc;
    updatedVacBalance[4] = newSickBlc;
    updatedVacBalance[5] = newUnpaidBlc;
    updatedVacBalance[6] = newAnnualBlc + newTransBlc + newReplaceBlc;

    return updatedVacBalance;
}



// Payroll Dedection Check
function checkPayrollDedution(stdTypeStr) {
    var typeId;
    switch (stdTypeStr) {
        case 'Annual':
            typeId = 1
            break;
        case 'Casual':
            typeId = 2
            break;
        case 'Sick':
            typeId = 3
            break;
        case 'Transferred':
            typeId = 4
            break;
        case 'Replacement':
            typeId = 5
            break;
    }
    // Get the Custom Vacation Types Configurations 
    var deductFromPayroll = search.lookupFields({
        type: 'customrecord_edc_vac_type',
        id: typeId.toString(),
        columns: ['custrecord_edc_vac_type_payroll_deduct']
    }).custrecord_edc_vac_type_payroll_deduct;

    if (deductFromPayroll) {
        var payrollDeductionConfirm = confirm('This Employee Doesn\'t Have Enough ' + stdTypeStr + ' Vacations Balance' +
            '\n' + 'Do you want to deduct from Payroll?');
        if (payrollDeductionConfirm) {
            // Call Payroll Deductor Function :))

        } else {
            alert('Sorry, The Request cannot be submitted!');
            hasBalance = false;
        }
    } else {
        alert('Sorry, This Employee Doesn\'t Have Enough ' + stdTypeStr + ' Vacations Balance');
        hasBalance = false;
    }
}