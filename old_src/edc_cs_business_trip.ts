/**
 * @NScriptName ClientScript Business Trip
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

import { EntryPoints } from 'N/types';
import runtime = require('N/runtime');
import search = require('N/search');
import record = require('N/record');
import currency = require('N/currency');
import serverWidget = require('N/ui/serverWidget');
import redirect = require('N/redirect');
import { request } from '@hitc/netsuite-types/N/http';


//Shared Variables
var currentUser = runtime.getCurrentUser();
var wasApproved;

export function pageInit(context: EntryPoints.Client.pageInitContext) {

    // Hiding th 'List' and 'Search' Links from the Employee Center.
    if (currentUser.roleCenter == 'EMPLOYEE') {
        document.getElementById('NS_MENU_ID0-item0').setAttribute('style', 'display:none');
        document.getElementById('NS_MENU_ID0-item1').setAttribute('style', 'display:none');        
        // document.getElementById('NS_MENU_ID0-item1').children[0].setAttribute('href', 'www.google.com');
    }

    
    try {
        var empId = currentUser.id;
        var tripRequest = context.currentRecord;
        var thisYear = new Date().getFullYear();
        var supervisor = tripRequest.getValue('custrecord_edc_btrip_supervisor');

        if (context.mode == 'create') {
            tripRequest.setValue('custrecord_edc_btrip_year', thisYear);
            
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
                        tripRequest.getField({ fieldId: 'custrecord_edc_btrip_emp' }).isDisabled = false;

                        var employee = search.lookupFields({
                            type: search.Type.EMPLOYEE,
                            id: empId.toString(),
                            columns: ['title']  // title = JobTitle
                        });
                        tripRequest.setValue('custrecord_edc_btrip_jobtitle', employee.title);
                        break;
                    }
                }
            
            }

        } else if (context.mode = 'edit') {

            // var empId = tripRequest.getValue('custrecord_edc_btrip_emp');
            var reqStatus = tripRequest.getValue('custrecord_edc_btrip_status');

            // Giving the Administrator & Employee's Supervisor ONLY the access to Approve/Reject the request (If it isn't already approved)
            // if ((currentUser.role == 3 || currentUser.id == supervisor) && reqStatus != 2) {    // 3 = Administrator Role
            //     tripRequest.getField({ fieldId: 'custrecord_edc_btrip_status' }).isMandatory = true;
            //     tripRequest.getField({ fieldId: 'custrecord_edc_btrip_status' }).isDisabled = false;
            // }

            // Disable Editing for the record if it's approved
            if (reqStatus == 2 || reqStatus == 3) {          // 2 = Approved ID & 3 = Rejected (in the list)
                tripRequest.getField({ fieldId: 'custrecord_edc_btrip_status' }).isDisabled = true;
                tripRequest.getField({ fieldId: 'custrecord_edc_btrip_type' }).isDisabled = true;
                tripRequest.getField({ fieldId: 'custrecord_edc_btrip_start' }).isDisabled = true;
                tripRequest.getField({ fieldId: 'custrecord_edc_btrip_end' }).isDisabled = true;
                tripRequest.getField({ fieldId: 'custrecord_edc_btrip_replacement' }).isDisabled = true;
                tripRequest.getField({ fieldId: 'custrecord_edc_btrip_memo' }).isDisabled = true;
                alert('Warning!\nApproved & Rejected Requests cannot be edited!');
                wasApproved = true;
                return;
            }
        }
    } catch (err) {
        alert('Something went wrong,\nPlease contact your system administrator');
        var ex = err.toJSON();
        var errorMsg = 'Error: ' + ex.name + '\n' + 'Message: ' + ex.message + '\n' +
            'Script ID: ' + runtime.getCurrentScript().id + '\n' + 'Deployment ID: ' + runtime.getCurrentScript().deploymentId;
        log.error(ex.name, errorMsg);
    }
}


export function fieldChanged(context: EntryPoints.Client.fieldChangedContext) {
    try {
        var tripRequest = context.currentRecord;

        // When Choosing/Changing the Employee
        if (context.fieldId == 'custrecord_edc_btrip_emp') {
            // Getting the selected Employee  
            var empId = tripRequest.getValue('custrecord_edc_btrip_emp');

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

            tripRequest.setValue('custrecord_edc_btrip_jobtitle', jobTitle);
            tripRequest.setValue('custrecord_edc_btrip_subsidiary', subsidiary);
            tripRequest.setValue('custrecord_edc_btrip_department', department);
            tripRequest.setValue('custrecord_edc_btrip_supervisor', supervisor);
            tripRequest.setValue('custrecord_edc_btrip_start', '');             // Free Start Date
            tripRequest.setValue('custrecord_edc_btrip_end', '');               // Free End Date
            tripRequest.setValue('custrecord_edc_btrip_period_days', 0);        // Free Days Count
            tripRequest.setValue('custrecord_edc_btrip_replacement', 0);        // Free Replacement Days
        }

        // When Changing the Start/End Date
        if (context.fieldId == 'custrecord_edc_btrip_start' || context.fieldId == 'custrecord_edc_btrip_end') {

            var requestDate = tripRequest.getValue('custrecord_edc_btrip_request_date');
            var reqStartDate = tripRequest.getValue('custrecord_edc_btrip_start');
            var reqEndDate = tripRequest.getValue('custrecord_edc_btrip_end');

            // Checking if the request not in the past
            if (context.fieldId == 'custrecord_edc_btrip_start' && reqStartDate) {
                if (requestDate > reqStartDate) {
                    alert('You cannot request a trip in the past!');
                    tripRequest.setValue('custrecord_edc_btrip_start', '');
                    return false;
                }
            }


            if (reqStartDate && reqEndDate) {
                // Calculating the No. of Vacation Days
                if (reqStartDate <= reqEndDate) {
                    var tripDays = ((reqEndDate - reqStartDate) / 86400000) + 1;
                    tripRequest.setValue('custrecord_edc_btrip_period_days', tripDays);

                } else {
                    alert('Start Date cannot be later than End Date!');
                    tripRequest.setValue('custrecord_edc_btrip_end', '');
                    return false;
                }
            } else {
                tripRequest.setValue('custrecord_edc_btrip_period_days', 0);
            }
        }

        // To Calculate the Total Expenses
        if (context.fieldId == 'custrecord_edc_btrip_flight_cost' || context.fieldId == 'custrecord_edc_btrip_rides_cost' ||
            context.fieldId == 'custrecord_edc_btrip_accommodation_cost' || context.fieldId == 'custrecord_edc_btrip_dailyallowance_cost' ||
            context.fieldId == 'custrecord_edc_btrip_miscellaneous_cost' || context.fieldId == 'custrecord_edc_btrip_currency') {

            var currencyID = Number(tripRequest.getValue('custrecord_edc_btrip_currency'));
            var flightCost = Number(tripRequest.getValue('custrecord_edc_btrip_flight_cost'));
            var ridesCost = Number(tripRequest.getValue('custrecord_edc_btrip_rides_cost'));
            var accomCost = Number(tripRequest.getValue('custrecord_edc_btrip_accommodation_cost'));
            var dailyCost = Number(tripRequest.getValue('custrecord_edc_btrip_dailyallowance_cost'));
            var mislCost = Number(tripRequest.getValue('custrecord_edc_btrip_miscellaneous_cost'));

            var totalCost = flightCost + ridesCost + accomCost + dailyCost + mislCost;
            var rate_EUR = currency.exchangeRate({ source: currencyID, target: 'EUR', date: new Date() });
            var rate_EGP = currency.exchangeRate({ source: currencyID, target: 'EGP', date: new Date() });
            var total_EUR = totalCost * rate_EUR;
            var total_EGP = totalCost * rate_EGP;
            tripRequest.setValue('custrecord_edc_btrip_total_expenses', total_EUR.toFixed(2));
            tripRequest.setValue('custrecord_edc_btrip_total_exp_egp', total_EGP.toFixed(2));
        }
    } catch (err) {
        alert('Something went wrong,\nPlease contact your system administrator');
        var ex = err.toJSON();
        var errorMsg = 'Error: ' + ex.name + '\n' + 'Message: ' + ex.message + '\n' +
            'Script ID: ' + runtime.getCurrentScript().id + '\n' + 'Deployment ID: ' + runtime.getCurrentScript().deploymentId;
        log.error(ex.name, errorMsg);
    }
}


export function validateField(context: EntryPoints.Client.validateFieldContext) {

    if (context.fieldId == 'custrecord_edc_btrip_replacement') {

        var tripRequest = context.currentRecord;
        var tripDays = Number(tripRequest.getValue('custrecord_edc_btrip_period_days'));
        var replacementDays = Number(tripRequest.getValue('custrecord_edc_btrip_replacement'));

        if (replacementDays > tripDays) {
            alert('Replacement days can\'t exceed the number of trip days');
            return false;
        }
    }
    return true;
}


export function saveRecord(context: EntryPoints.Client.saveRecordContext) {
    try {
        var tripRequest = context.currentRecord;
        var reqStatus = tripRequest.getValue('custrecord_edc_btrip_status');
        var tripReplacementDays = tripRequest.getValue('custrecord_edc_btrip_replacement');
        var reqEndDate = tripRequest.getValue('custrecord_edc_btrip_end');

        if (!wasApproved) {         // There is no errors
            if (reqStatus == 2) {   // Approved
                if (tripReplacementDays) {
                    // Adding Replacement Days to Emplpoyee's Vacations Balance
                    var empId = Number(tripRequest.getValue('custrecord_edc_btrip_emp'));
                    var empVacBalanceSearch = search.create({
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
                                values: reqEndDate.getFullYear().toString()
                            })],
                        columns: ['custrecord_edc_vac_balance_replacement', 'custrecord_edc_vac_balance_total_regular']
                    }).run().getRange({ start: 0, end: 1 });

                    var vacRecordId = empVacBalanceSearch[0].id;
                    var empReplacementBalance = Number(empVacBalanceSearch[0].getValue('custrecord_edc_vac_balance_replacement'));
                    var empTotalRegularBalance = Number(empVacBalanceSearch[0].getValue('custrecord_edc_vac_balance_total_regular'));
                    var updatedReplacements = Number(tripReplacementDays) + empReplacementBalance;
                    var updatedTotalRegular = Number(tripReplacementDays) + empTotalRegularBalance;

                    var empVacRecord = record.load({
                        type: 'customrecord_edc_emp_vac_balance',
                        id: vacRecordId,
                        isDynamic: true
                    });

                    empVacRecord.setValue('custrecord_edc_vac_balance_replacement', updatedReplacements);
                    empVacRecord.setValue('custrecord_edc_vac_balance_total_regular', updatedTotalRegular);
                    empVacRecord.save();
                }
            } else if (reqStatus == 1 || !reqStatus) {       // 1 = Pending Approval
                var now = new Date();
                tripRequest.setValue('custrecord_edc_btrip_request_date', now); // Reset the Request Date & Time to the Time Now! 
                tripRequest.setValue('custrecord_edc_btrip_status', 1);
            }
            return true;

        } else {
            alert('Warning!\nApproved & Rejected Requests cannot be edited!');
            return false;
        }
    } catch (err) {
        alert('Something went wrong,\nPlease contact your system administrator');
        var ex = err.toJSON();
        var errorMsg = 'Error: ' + ex.name + '\n' + 'Message: ' + ex.message + '\n' +
            'Script ID: ' + runtime.getCurrentScript().id + '\n' + 'Deployment ID: ' + runtime.getCurrentScript().deploymentId;
        log.error(ex.name, errorMsg);
    }
}


// Function to Get the equivalent amount in EGP and EUR
function getExchangeAmount(inputCurrency, totalCost) {
    var rate_EUR = currency.exchangeRate({ source: inputCurrency, target: 'EUR', date: new Date() });
    var rate_EGP = currency.exchangeRate({ source: inputCurrency, target: 'EGP', date: new Date() });
    var total_EUR = totalCost * rate_EUR;
    var total_EGP = totalCost * rate_EGP;
    return { total_EUR, total_EGP };
}