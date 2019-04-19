/**
 * @NScriptName ClientScript Vacation Types
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

import {EntryPoints} from 'N/types';
import {LeaveType, LeaveTypeFields} from './LeaveType';
import {UI} from "../helpers";
import showMessage = UI.showMessage;

let stack = [];
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

    let field = leaveType.getField(leaveType.removePrefix(context.fieldId));

    let valid = field ? field.validate() : true;

    if (context.fieldId == leaveType.getColumnId(LeaveTypeFields.MAPPING)) {
        let field = leaveType.getField(LeaveTypeFields.MAPPING);
        let relatedFields = leaveType.getFields(leaveType.columns);

        if (!valid)
            showMessage('Warning', field.text.toString() + ' already exists.');
        else {
            if (field.text.toString().toLowerCase() !== 'custom') {

                stack.push(relatedFields.saveState());

                relatedFields
                    .disable();
                relatedFields
                    .optional();

            } else {
                let lastState = stack.pop();

                // restore state
                if (lastState)
                    relatedFields.setState(lastState);
            }

            return true;
        }

        return false;
    }

    return valid;
}

export = {
    pageInit: pageInit,
    fieldChanged: fieldChanged,
    validateField: validateField
}
