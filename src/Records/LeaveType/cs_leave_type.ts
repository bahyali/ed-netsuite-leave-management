/**
 * @NScriptName ClientScript Vacation Types
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

import { EntryPoints } from 'N/types';
import { LeaveType, LeaveTypeFields } from './LeaveType';
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
        const mapping = leaveType.getField(LeaveTypeFields.MAPPING);

        if (mapping.text.toString().toLowerCase() !== 'custom')
            mapping.disable();
    }

    else if (context.mode == 'create') {

    }
}

function fieldChanged(context: EntryPoints.Client.fieldChangedContext) {
    leaveType.createFromRecord(context.currentRecord);

    if (context.fieldId == leaveType.getColumnId(LeaveTypeFields.FREQUENT_TYPE)) {
        let frequentType = leaveType.getField(LeaveTypeFields.FREQUENT_TYPE).value;

        leaveType.getField(LeaveTypeFields.FREQUENT_VALUE).disabled = !(frequentType);
        leaveType.getField(LeaveTypeFields.FREQUENT_VALUE).mandatory = !!(frequentType);
    }
}

function validateField(context: EntryPoints.Client.validateFieldContext) {
    leaveType.createFromRecord(context.currentRecord);

    if (context.fieldId == leaveType.getColumnId(LeaveTypeFields.MAPPING)) {
        let field = leaveType.getField(LeaveTypeFields.MAPPING);
        let valid = field.validate();

        if (!valid)
            showMessage('Warning', field.text.toString() + ' already exists.');
        else {
            if (field.text.toString().toLowerCase() !== 'custom') 
                disableFields(leaveType.columns)
            
            return true;
        }

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
    }).show({ duration: 5000 });
}

export = {
    pageInit: pageInit,
    fieldChanged: fieldChanged,
    validateField: validateField
}
