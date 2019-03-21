/**
 * @NScriptName ClientScript Overtime Rules
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


// Variables
var isNew = true;
var enableEdit = true;

export function pageInit(context: EntryPoints.Client.pageInitContext) {

    var thisYear = new Date().getFullYear();

    if (context.mode == 'create') {
        // Setting the Next Year as the Vacations Rule Year
        context.currentRecord.setValue('custrecord_edc_overtime_rule_year', thisYear);
    }

    // Make All Fields Disabled if it was an old rule (previous year)
    if (context.mode == 'edit') {
        
        var recordYear = Number(context.currentRecord.getValue('custrecord_edc_overtime_rule_year'));

        if (thisYear > recordYear) {
            enableEdit = false;
            context.currentRecord.getField({ fieldId: 'custrecord_edc_overtime_rule_subsidiary' }).isDisabled = true;
            context.currentRecord.getField({ fieldId: 'custrecord_edc_overtime_rule_standard' }).isDisabled = true;
            context.currentRecord.getField({ fieldId: 'custrecord_edc_overtime_rule_morning' }).isDisabled = true;
            context.currentRecord.getField({ fieldId: 'custrecord_edc_overtime_rule_night' }).isDisabled = true;
            context.currentRecord.getField({ fieldId: 'custrecord_edc_overtime_rule_holiday' }).isDisabled = true;
            context.currentRecord.getField({ fieldId: 'custrecord_edc_overtime_rule_max_hours' }).isDisabled = true;
            alert('Previous Records cannot be edited!');
            enableEdit = false;
        }
    }
}


export function validateField(context: EntryPoints.Client.validateFieldContext) {

    if (context.fieldId == 'custrecord_edc_overtime_rule_subsidiary') {
        var thisYear = new Date().getFullYear();
        var subsidiary = context.currentRecord.getValue('custrecord_edc_overtime_rule_subsidiary');

        // Prevent leaving Subsidiary with blank (No-Choice)
        if (!subsidiary) {
            alert('You must select a Subsidiary');
            return false;
        }

        // Searching for another record with the same year and the same subsidiary
        var rulesSearch = search.create({
            type: 'customrecord_edc_overtime_rule',
            filters: [
                search.createFilter({
                    name: 'custrecord_edc_overtime_rule_year',
                    operator: search.Operator.CONTAINS,
                    values: thisYear
                }),
                search.createFilter({
                    name: 'custrecord_edc_overtime_rule_subsidiary',
                    // The Operator which can be applied using the type (Check the 'Search Operator' from the Help Center)
                    // Link:  https://system.na2.netsuite.com/app/help/helpcenter.nl?fid=section_n3005172.html   [List/Record]
                    operator: search.Operator.ANYOF,
                    values: Number(subsidiary),
                }),
            ],
            columns: [search.createColumn({ name: 'custrecord_edc_overtime_rule_subsidiary' })]
        }).run().getRange({start: 0, end: 1});

        if (rulesSearch[0]) {
            alert('Warning!\nAnother record with the same year and the same subsidiary exists');
            isNew = false;
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