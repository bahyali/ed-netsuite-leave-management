/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

import { EntryPoints } from 'N/types';
import * as runtime from 'N/runtime';
import { BaseModel, DataType, FieldType } from '../../Core/BaseModel';
import { LeaveBalance } from '../Leave Balance/LeaveBalance';


export function pageInit(context: EntryPoints.Client.pageInitContext) {
    const testRecord = context.currentRecord;

    let empBalanceQuery = new LeaveBalance().where('emp_name', '==', runtime.getCurrentUser().id);
    let empName = empBalanceQuery.first();
    let empResults = empBalanceQuery.find();
    compileEmpInfo(empName, empResults);
}


function compileEmpInfo(empName: object, empResults: object[]) {
    let empInfo = `Name:\t ${empName['emp_name']}\n`;
    
    for (let i = 0; i < empResults.length; i++) {
        empInfo += '---------------------------------------------------\n';
        for (const key in empResults) {
            if (empResults.hasOwnProperty(key)) {
                const value = empResults[key];
                empInfo+= `${key}: \t ${value}\n`;
            }
        }
    }
    return empInfo;
}













// empVacBalance.where({
//     fieldId: 'custrecord_edc_vac_balance_emp_name',
//     fieldType: 'list',
//     operator: '==',
//     fieldValue: 4
// }).where({
//     fieldId: 'custrecord_edc_vac_balance_year',
//     fieldType: 'string',
//     operator: '==',
//     fieldValue: new Date().getFullYear()
// }).find(DataType.value, 1, ['custrecord_edc_vac_balance_annual', 'custrecord_edc_vac_balance_casual']);