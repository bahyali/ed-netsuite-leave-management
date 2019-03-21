/**
 * @NScriptName ClientScript Leave/Payroll Management Roles
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


export function validateField(context: EntryPoints.Client.validateFieldContext) {

    if (context.fieldId == 'custrecord_edc_role_mng_record_type') {
        var mngRecord = context.currentRecord;
        // Get the Selected Record Type
        var recordTypeId = mngRecord.getValue('custrecord_edc_role_mng_record_type');
        var recordTypeText = mngRecord.getText('custrecord_edc_role_mng_record_type');

        // Checking that there is No other types have the same mapping (One-to-One Relationship)
        var prevMngRecords = search.create({
            type: 'customrecord_edc_roles_management',
            filters: [
                search.createFilter({
                    name: 'custrecord_edc_role_mng_record_type',
                    operator: search.Operator.ANYOF,
                    values: Number(recordTypeId),
                })]
        }).run().getRange({ start: 0, end: 1 });

        if (prevMngRecords[0]) {
            if (Number(prevMngRecords[0].id) != mngRecord.id) {
                alert(recordTypeText + ' record aleardy has roles specified');
                return false;
            }
        }
    }
    return true;
}