/**
 * @NScriptName ClientScript Vacation Types
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

import {EntryPoints} from 'N/types';
import * as runtime from 'N/runtime';
import {LeaveType, LeaveTypeFields} from './LeaveType';
import {Field} from '../../Core/Model/Field';
import {LeaveBalance} from '../LeaveBalance/LeaveBalance';
import {QueryResults} from "../../Core/Model/QueryResults";

let leaveType = new LeaveType();

function pageInit(context: EntryPoints.Client.pageInitContext) {

    if (context.mode == 'edit') {
        leaveType.createFromRecord(context.currentRecord);

        // Getting the text of the item selected in "Mapping" DropDownList Field.
        const mappingText = leaveType.getField(LeaveTypeFields.MAPPING).text.toString();

        if (mappingText.toLowerCase() !== 'custom') {
            leaveType.getField(LeaveTypeFields.DAYS_LIMIT).mandatory = false;

            let customTypeFields = [
                LeaveTypeFields.DAYS_LIMIT,
                LeaveTypeFields.MAX_DAYS_REQUEST,
                LeaveTypeFields.FREQUENT_TYPE,
                LeaveTypeFields.FREQUENT_VALUE
            ];

            // Disable all fields
            for (let i = 0; i < customTypeFields.length; i++)
                leaveType.getField(customTypeFields[i]).disabled = true;

        }
    }

}

function fieldChanged(context: EntryPoints.Client.fieldChangedContext) {
    leaveType.createFromRecord(context.currentRecord);

    if (context.fieldId == leaveType.getColumnId(LeaveTypeFields.FREQUENT_TYPE)) {
        let frequentType = leaveType.getField(LeaveTypeFields.FREQUENT_TYPE).value;

        leaveType.getField(LeaveTypeFields.FREQUENT_VALUE).disabled = !!(frequentType);
        leaveType.getField(LeaveTypeFields.FREQUENT_VALUE).mandatory = !!(frequentType);
    }
}

function validateField(context: EntryPoints.Client.validateFieldContext) {
    leaveType.createFromRecord(context.currentRecord);

    if (context.fieldId == leaveType.getColumnId(LeaveTypeFields.MAPPING)) {
        const mappingText = leaveType.getField(LeaveTypeFields.MAPPING).text.toString();

        if (mappingText.toLowerCase() !== 'custom') {
            let customTypeFields = [LeaveTypeFields.DAYS_LIMIT, LeaveTypeFields.MAX_DAYS_REQUEST,
                LeaveTypeFields.FREQUENT_TYPE, LeaveTypeFields.FREQUENT_VALUE];

            for (let i = 0; i < customTypeFields.length; i++) {
                leaveType.getField(customTypeFields[i]).disabled = true;
            }
        } else {
            // Check if the field is Unique
        }
    }

    return true;
}

export = {
    pageInit: pageInit,
    fieldChanged: fieldChanged,
    validateField: validateField
}
