/**
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


export function pageInit(context: EntryPoints.Client.pageInitContext) {

    if (context.mode == 'edit') {
        const vacationType = context.currentRecord;
        // Getting the text of the item selected in "Mapping" DropDownList Field.
        const mappingText = vacationType.getText(leaveType.getColumnId(LeaveTypeFields.MAPPING)).toString();
        if (mappingText.toLowerCase() !== 'custom') {
            leaveType.getField(LeaveTypeFields.DAYS_LIMIT).mandatory = false;

            let customTypeFields = [LeaveTypeFields.DAYS_LIMIT, LeaveTypeFields.MAX_DAYS_REQUEST,
                LeaveTypeFields.FREQUENT_TYPE, LeaveTypeFields.FREQUENT_VALUE];

            for (let i = 0; i < customTypeFields.length; i++) {
                leaveType.getField(customTypeFields[i]).disabled = true;
            }

        }
    }

}

export function fieldChanged(context: EntryPoints.Client.fieldChangedContext) {
    const vacationType = context.currentRecord;

    if (context.fieldId == leaveType.getColumnId(LeaveTypeFields.FREQUENT_TYPE)) {
        let frequentType = vacationType.getValue(LeaveTypeFields.FREQUENT_TYPE);
        leaveType.getField(LeaveTypeFields.FREQUENT_VALUE).disabled = !!(frequentType);
        leaveType.getField(LeaveTypeFields.FREQUENT_VALUE).mandatory = !!(frequentType);
    }
}

export function validateField(context: EntryPoints.Client.validateFieldContext) {
    const vacationType = context.currentRecord;

    if (context.fieldId == leaveType.getColumnId(LeaveTypeFields.MAPPING)) {
        const mappingText = vacationType.getText(leaveType.getColumnId(LeaveTypeFields.MAPPING)).toString();
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

