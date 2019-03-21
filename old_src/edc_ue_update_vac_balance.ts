/**
 * @NScriptName SuiteFlow changing the vacations balance of the employee
 * @NApiVersion 2.0
 * @NScriptType Workflow
 * @NModuleScope SameAccount
 */

import { EntryPoints } from 'N/types';
import runtime = require('N/runtime');
import search = require('N/search');
import record = require('N/record');
import serverWidget = require('N/ui/serverWidget');
import redirect = require('N/redirect');
import { request } from '@hitc/netsuite-types/N/http';


export function beforeLoad(context: EntryPoints.UserEvent.beforeLoadContext) {

    var currentUser = runtime.getCurrentUser();
    var vacRequest = context.newRecord;

    var employee = vacRequest.getValue('custrecord_edc_vac_balance_emp_name');
    var supervisor = vacRequest.getValue('custrecord_edc_vac_balance_supervisor');
    var editorRole = runtime.getCurrentScript().getParameter({ name: 'custscript_btrip_editor_role' });

    try {
        // if (currentUser.role == 3 || currentUser.id == supervisor || currentUser.role == editorRole) {
            var empJobTitle = search.lookupFields({
                type: search.Type.EMPLOYEE,
                id: employee.toString(),
                columns: ['title']  //JobTitle
            }).title;
            vacRequest.setValue('custrecord_edc_vac_req_jobtitle', empJobTitle);
        // }
        // e.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t").replace(/\f/g, "\\f");
    } catch (err) {
        alert('Something went wrong,\nPlease contact your system administrator');
        var ex = JSON.parse(err);
        var errorMsg = 'Error: ' + ex.name + '\n' + 'Message: ' + ex.message + '\n' +
            'Script ID: ' + runtime.getCurrentScript().id + '\n' + 'Deployment ID: ' + runtime.getCurrentScript().deploymentId;
        log.error(ex.name, errorMsg);
    }
}


export function beforeSubmit(context: EntryPoints.UserEvent.beforeSubmitContext) {
    try {
        var vacRequest = context.newRecord;
        var vacStatus = vacRequest.getValue('custrecord_edc_vac_req_status');
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

            var vacRecordId = empVacations[0].id;

            var empVacRecord = record.load({
                type: 'customrecord_edc_emp_vac_balance',
                id: vacRecordId,
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
        }
    } catch (err) {
        alert('Something went wrong,\nPlease contact your system administrator');
        var ex = err.toJSON();
        var errorMsg = 'Error: ' + ex.name + '\n' + 'Message: ' + ex.message + '\n' +
            'Script ID: ' + runtime.getCurrentScript().id + '\n' + 'Deployment ID: ' + runtime.getCurrentScript().deploymentId;
        log.error(ex.name, errorMsg);
    }
}
