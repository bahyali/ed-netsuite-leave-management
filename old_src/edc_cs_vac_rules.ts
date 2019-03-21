/**
 * @NScriptName ClientScript Vacations Rules
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * 
 */

import { EntryPoints, UserEventType } from 'N/types';
import search = require('N/search');
import record = require('N/record');
import runtime = require('N/runtime');
import serverWidget = require('N/ui/serverWidget');
import redirect = require('N/redirect');
import email = require('N/email');
import url = require('N/url');


// Variables
var isNew = true;
var enableEdit = true;


export function pageInit(context: EntryPoints.Client.pageInitContext) {
    var thisYear = new Date().getFullYear();

    if (context.mode == 'create') {
        // Setting the Next Year as the Vacations Rule Year
        context.currentRecord.setValue('custrecord_edc_vac_rule_year', thisYear + 1);
    }

    // Make All Fields Disabled if it becomes 1-January for this year => (Lock All Fields)
    if (context.mode == 'edit') {
        var recordYear = Number(context.currentRecord.getValue('custrecord_edc_vac_rule_year'));
        var applyWeekends = context.currentRecord.getValue('custrecord_edc_vac_rule_weekend_apply');

        if (thisYear >= recordYear) {
            enableEdit = false;
            context.currentRecord.getField({ fieldId: 'custrecord_edc_vac_rule_subsidiary' }).isDisabled = true;
            context.currentRecord.getField({ fieldId: 'custrecord_edc_vac_rule_casual_days' }).isDisabled = true;
            context.currentRecord.getField({ fieldId: 'custrecord_edc_vac_rule_sick_days' }).isDisabled = true;
            context.currentRecord.getField({ fieldId: 'custrecord_edc_vac_rule_casual_as_annual' }).isDisabled = true;
            context.currentRecord.getField({ fieldId: 'custrecord_edc_vac_rule_transfer_days' }).isDisabled = true;
            context.currentRecord.getField({ fieldId: 'custrecord_edc_vac_rule_probation_period' }).isDisabled = true;
            context.currentRecord.getField({ fieldId: 'custrecord_edc_vac_rule_elderly_emp_age' }).isDisabled = true;
            context.currentRecord.getField({ fieldId: 'custrecord_edc_vac_rule_elderly_emp_vacs' }).isDisabled = true;
            context.currentRecord.getField({ fieldId: 'custrecord_edc_vac_rule_regvac_less10y' }).isDisabled = true;
            context.currentRecord.getField({ fieldId: 'custrecord_edc_vac_rule_regvac_more10y' }).isDisabled = true;
            context.currentRecord.getField({ fieldId: 'custrecord_edc_vac_rule_weekend_apply' }).isDisabled = true;
            context.currentRecord.getField({ fieldId: 'custrecord_edc_vac_rule_weekend_days' }).isDisabled = true;
            context.currentRecord.getField({ fieldId: 'custrecord_edc_vac_rule_permission_hours' }).isDisabled = true;
            context.currentRecord.getField({ fieldId: 'custrecord_edc_vac_rule_month_beginning' }).isDisabled = true;
            alert('Previous Records cannot be edited!');
        }
        else if (applyWeekends) {
            // Make Weekends Multiple Select editable if the 'NEVER CONSIDER WEEKENDS AS WORKDAYS' checkbox is checked
            context.currentRecord.getField({ fieldId: 'custrecord_edc_vac_rule_weekend_days' }).isDisabled = false;
        }
    }
}


export function fieldChanged(context: EntryPoints.Client.fieldChangedContext) {

    if (context.fieldId == 'custrecord_edc_vac_rule_weekend_apply') {
        var isWeekEndApplied = context.currentRecord.getValue('custrecord_edc_vac_rule_weekend_apply');
        var weekendsFld = context.currentRecord.getField({ fieldId: 'custrecord_edc_vac_rule_weekend_days' });

        // Checking if the WeekEnd Vacations Applied or Not
        if (isWeekEndApplied) {
            weekendsFld.isDisabled = false;
            weekendsFld.isMandatory = true;

            // Defaulting Weekend Days [as Egypt]
            var weekends = new Array();
            weekends[0] = 'Friday';		 // 1 = Friday
            weekends[1] = 'Saturday';	// 2 = Saturday
            context.currentRecord.setText('custrecord_edc_vac_rule_weekend_days', weekends);
        } else {
            weekendsFld.isDisabled = true;
            weekendsFld.isMandatory = false;
            context.currentRecord.setValue('custrecord_edc_vac_rule_weekend_days', 0);
        }
    }
}

export function validateField(context: EntryPoints.Client.validateFieldContext) {

    if (context.fieldId == 'custrecord_edc_vac_rule_subsidiary') {
        try {
            var thisYear = new Date().getFullYear();
            var subsidiary = context.currentRecord.getValue('custrecord_edc_vac_rule_subsidiary');

            // Prevent leaving Subsidiary with blank (No-Choice)
            if (!subsidiary) {
                alert('You must select a Subsidiary');
                return false;
            }

            // Searching for another record with the same year and the same subsidiary
            var vacRules = search.create({
                type: 'customrecord_edc_vac_rule',
                filters: [
                    search.createFilter({
                        name: 'custrecord_edc_vac_rule_year',
                        operator: search.Operator.CONTAINS,
                        values: thisYear + 1
                    }),
                    search.createFilter({
                        name: 'custrecord_edc_vac_rule_subsidiary',
                        // The Operator which can be applied using the type (Check the 'Search Operator' from the Help Center)
                        // Link:  https://system.na2.netsuite.com/app/help/helpcenter.nl?fid=section_n3005172.html   [List/Record]
                        operator: search.Operator.ANYOF,
                        values: subsidiary
                    }),
                ],
                columns: [search.createColumn({ name: 'custrecord_edc_vac_rule_subsidiary' })]
            });
            var vacRulesYears = vacRules.run().getRange({
                start: 0,
                end: 1
            });

            if (vacRulesYears[0]) {
                var goToRecord = confirm('Another record with the same year and the same subsidiary exists\n' +
                    'Do you want to go to this record?');
                    if (goToRecord) {
                        var recordURL = url.resolveRecord({
                            recordType: 'customrecord_edc_vac_rule',
                            recordId: vacRulesYears[0].id,
                            isEditMode: false,
                        });
                        window.location = recordURL;
                    }
                isNew = false;
                return false;
            }
        } catch (err) {
            alert('Something went wrong,\nPlease contact your system administrator');
            var ex = err.toJSON();
            var errorMsg = 'Error: ' + ex.name + '\n' + 'Message: ' + ex.message;
            log.error(ex.name, errorMsg);
            return false;
        }
    }
    return true;
}

export function saveRecord(context: EntryPoints.Client.saveRecordContext) {

    if (!isNew) {
        alert('The record can not be saved !' + '\n' + 'Please check the Subsidiary & Year Fields');
        return false;
    }
    if (enableEdit == false) {
        alert('Previous Record cannot be edited or saved!');
        return false;
    }
    return true;

}