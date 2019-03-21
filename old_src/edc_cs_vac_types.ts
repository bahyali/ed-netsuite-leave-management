/**
 * @NScriptName ClientScript Vacation Types
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


export function pageInit(context: EntryPoints.Client.pageInitContext) {

    if (context.mode == 'edit') {

        var vacTypeRecord = context.currentRecord;
        var vacMapText = vacTypeRecord.getText('custrecord_edc_vac_type_mapping');
        // Disable all configuration fields if any type selected from the list except 'Custom'
        if (vacMapText != 'Custom') {
            // Getting Fields
            var daysLimitFld = vacTypeRecord.getField({ fieldId: 'custrecord_edc_vac_type_days_limit' });
            var maxDaysNoFld = vacTypeRecord.getField({ fieldId: 'custrecord_edc_vac_type_max_days_request' });
            var freqTypeFld = vacTypeRecord.getField({ fieldId: 'custrecord_edc_vac_type_freq_type' });
            var freqValueFld = vacTypeRecord.getField({ fieldId: 'custrecord_edc_vac_type_freq_value' });
            // Diable Fields
            daysLimitFld.isMandatory = false;
            daysLimitFld.isDisabled = true;
            maxDaysNoFld.isDisabled = true;
            freqTypeFld.isDisabled = true;
            freqValueFld.isDisabled = true;
            // Empty all the fields if they have values
            vacTypeRecord.setValue('custrecord_edc_vac_type_days_limit', '');
            vacTypeRecord.setValue('custrecord_edc_vac_type_max_days_request', '');
            vacTypeRecord.setValue('custrecord_edc_vac_type_freq_type', '');
            vacTypeRecord.setValue('custrecord_edc_vac_type_freq_value', '');
        }
    }
}

export function fieldChanged(context: EntryPoints.Client.fieldChangedContext) {

    var vacTypeRecord = context.currentRecord;
    if (context.fieldId == 'custrecord_edc_vac_type_freq_type' || context.fieldId == 'custrecord_edc_vac_type_freq_value') {
        var freqType = vacTypeRecord.getValue('custrecord_edc_vac_type_freq_type');
        var freqValue = vacTypeRecord.getValue('custrecord_edc_vac_type_freq_value');
        // Getting Frequent Fields
        var freqTypeFld = vacTypeRecord.getField({ fieldId: 'custrecord_edc_vac_type_freq_type' });
        var freqValueFld = vacTypeRecord.getField({ fieldId: 'custrecord_edc_vac_type_freq_value' });

        // If a field has a value and the another field doesn't have a value
        if ((freqType && !freqValue) || (!freqType && freqValue)) {
            freqTypeFld.isMandatory = true;
            freqValueFld.isMandatory = true;
        }
        // If none of Frequent Fields has a value, Make the fields OPTIONAL again
        else if (!freqType && !freqValue) {
            freqTypeFld.isMandatory = false;
            freqValueFld.isMandatory = false;
        }
    }
}

export function validateField(context: EntryPoints.Client.validateFieldContext) {

    if (context.fieldId == 'custrecord_edc_vac_type_mapping') {
        var vacTypeRecord = context.currentRecord;
        // Get the Selected Type For Mapping
        var vacMapValue = vacTypeRecord.getValue('custrecord_edc_vac_type_mapping');
        var vacMapText = vacTypeRecord.getText('custrecord_edc_vac_type_mapping');
        // Getting Fields
        var daysLimitFld = vacTypeRecord.getField({ fieldId: 'custrecord_edc_vac_type_days_limit' });
        var maxDaysNoFld = vacTypeRecord.getField({ fieldId: 'custrecord_edc_vac_type_max_days_request' });
        var freqTypeFld = vacTypeRecord.getField({ fieldId: 'custrecord_edc_vac_type_freq_type' });
        var freqValueFld = vacTypeRecord.getField({ fieldId: 'custrecord_edc_vac_type_freq_value' });

        // Enable all configuration fields if the type is selected to 'Custom'
        if (vacMapText == 'Custom') {
            // Days Limit Field
            daysLimitFld.isMandatory = true;
            daysLimitFld.isDisabled = false;
            maxDaysNoFld.isDisabled = false;
            freqTypeFld.isDisabled = false;
            freqValueFld.isDisabled = false;
        }

        // Disable all configuration fields if any type selected from the list except 'Custom'
        if (vacMapText != 'Custom') {
            // Checking that there is No other types have the same mapping (One-to-One Relationship)
            var vacTypesSearch = search.create({
                type: 'customrecord_edc_vac_type',
                filters: [
                    search.createFilter({
                        name: 'custrecord_edc_vac_type_mapping',
                        operator: search.Operator.ANYOF,
                        values: Number(vacMapValue),
                    })]
            }).run().getRange({ start: 0, end: 1 });

            if (vacTypesSearch[0]) {
                if (Number(vacTypesSearch[0].id) != vacTypeRecord.id) {
                    alert(vacMapText + ' vacations type aleardy exists');
                    return false;
                }
            }

            daysLimitFld.isMandatory = false;
            daysLimitFld.isDisabled = true;
            maxDaysNoFld.isDisabled = true;
            freqTypeFld.isDisabled = true;
            freqValueFld.isDisabled = true;
            // Empty all the fields if they have values
            vacTypeRecord.setValue('custrecord_edc_vac_type_days_limit', '');
            vacTypeRecord.setValue('custrecord_edc_vac_type_max_days_request', '');
            vacTypeRecord.setValue('custrecord_edc_vac_type_freq_type', '');
            vacTypeRecord.setValue('custrecord_edc_vac_type_freq_value', '');
        }
    }
    return true;
}