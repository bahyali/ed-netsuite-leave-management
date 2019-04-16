/**
 * @NScriptName ClientScript Vacation Types
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

import {EntryPoints} from 'N/types';
import {LeaveType, LeaveTypeFields} from './LeaveType';
import * as UIMessage from 'N/ui/message';

let leaveType = new LeaveType();

leaveType.columns = [
    LeaveTypeFields.DAYS_LIMIT,
    LeaveTypeFields.MAX_DAYS_REQUEST,
    LeaveTypeFields.FREQUENT_TYPE,
    LeaveTypeFields.FREQUENT_VALUE
];

function pageInit(context: EntryPoints.Client.pageInitContext) {
    leaveType.createFromRecord(context.currentRecord);

    if (context.mode == 'edit') {
        // Getting the text of the item selected in "Mapping" DropDownList Field.
        const mappingText = leaveType.getField(LeaveTypeFields.MAPPING).text.toString();

        if (mappingText.toLowerCase() !== 'custom') {
            leaveType.getField(LeaveTypeFields.DAYS_LIMIT).mandatory = false;

            // Disable all fields
            for (let i = 0; i < leaveType.columns.length; i++)
                leaveType.getField(leaveType.columns[i]).disabled = true;

        }
    } else if (context.mode == 'create') {

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
        let field = leaveType.getField(LeaveTypeFields.MAPPING);
        let valid = field.validate();

        if (field.text.toString().toLowerCase() !== 'custom' && !valid)
            showMessage('Warning', field.text.toString() + ' already exists.');
        else
            return true;

        return false;
    }

    return true;
}

function disableFields(fields, disabled = true) {
    for (let i = 0; i < fields.length; i++)
        leaveType.getField(fields[i]).disabled = disabled;
}

function showMessage(title, message, type = UIMessage.Type.WARNING) {
    UIMessage.create({
        title: title,
        message: message,
        type: type
    }).show({duration: 5000});
}

export = {
    pageInit: pageInit,
    fieldChanged: fieldChanged,
    validateField: validateField
}
