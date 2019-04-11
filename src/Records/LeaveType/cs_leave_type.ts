/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

import {EntryPoints} from 'N/types';
import * as runtime from 'N/runtime';
import  {LeaveType} from './LeaveType';
import {LeaveBalance} from '../LeaveBalance/LeaveBalance';
import {QueryResults} from "../../Core/Model/QueryResults";

let type = new LeaveType();
export function pageInit(context: EntryPoints.Client.pageInitContext) {
    const leaveType = context.currentRecord;

    if (context.mode == 'create'){

    }

}

export function validateField (context: EntryPoints.Client.validateFieldContext){
    const leaveType = context.currentRecord;

    if (context.fieldId = type.addPrefix(['mapping'])) {

    }

    return true;
}