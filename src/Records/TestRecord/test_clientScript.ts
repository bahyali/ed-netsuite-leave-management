/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

import {EntryPoints} from 'N/types';
import * as runtime from 'N/runtime';
import {LeaveBalance} from '../LeaveBalance/LeaveBalance';
import {QueryResults} from "../../Core/Model/QueryResults";


export function pageInit(context: EntryPoints.Client.pageInitContext) {
    const testRecord = context.currentRecord; // todo Build Model from Record

    // Employee Balances
    let repository = new LeaveBalance()
        .where('emp_name', '==', runtime.getCurrentUser().id);

    let employeeBalances = repository
        .limit(10)
        .find();

    if (employeeBalances) {
        let employeeName = repository.get(employeeBalances.first()['id'], ['emp_name']);

        // do something
        if (employeeName)
            testRecord.setValue('custrecord_test_01', compileEmpInfo(employeeName, employeeBalances));
    }
}


function compileEmpInfo(empName: object, empResults: QueryResults) {
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