/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

import { EntryPoints } from 'N/types';
import * as runtime from 'N/runtime';
import { BaseModel, DataType, FieldType } from '../../Core/BaseModel';
import { LeaveBalance } from '../LeaveBalance/LeaveBalance';


export function pageInit(context: EntryPoints.Client.pageInitContext) {
    const testRecord = context.currentRecord;
    debugger;
    let empBalanceQuery = new LeaveBalance().where('emp_name', '==', runtime.getCurrentUser().id);
    let empResults = empBalanceQuery.limit(10).find();
    // let empName = empBalanceQuery.first(['emp_name'], DataType.TEXT);
    debugger;
    let empName = empBalanceQuery.get(Number(empResults[0]['id']), ['emp_name'], DataType.TEXT);

    testRecord.setValue('custrecord_test_01', compileEmpInfo(empName, empResults));
}


function compileEmpInfo(empName: object, empResults: object[]) {
    debugger;
    let empInfo = `Name:\t ${empName['emp_name']}\n`;

    for (let i = 0; i < empResults.length; i++) {
        empInfo += '---------------------------------------------------\n';
        for (const key in empResults[i]) {
            if (empResults[i].hasOwnProperty(key)) {
                const value = empResults[i][key];
                empInfo += `${key}:  ${value}\n`;
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