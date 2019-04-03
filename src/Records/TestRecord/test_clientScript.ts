/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

import { EntryPoints } from 'N/types';
import * as runtime from 'N/runtime';
import { BaseModel, DataType } from '../../Core/BaseModel';


export function pageInit(context: EntryPoints.Client.pageInitContext) {

    // alert('Deployed!\nThe Script is running....');

    // Records IDs
    const vacBalance_Record = 'customrecord_edc_emp_vac_balance';
    // Fields IDs
    const annualBalance_Fld = 'custrecord_edc_vac_balance_annual';
    const casualBalance_Fld = 'custrecord_edc_vac_balance_casual';
    const unpaidBalance_Fld = 'custrecord_edc_vac_balance_unpaid';
    const totalRegual_Fld = 'custrecord_edc_vac_balance_total_regular';

    const emp_Fld = 'custrecord_edc_vac_balance_emp_name';
    const year_Fld = 'custrecord_edc_vac_balance_year';

    debugger;
    // Get a specific record
    // let specificVacBalance = new BaseModel(vacBalance_Record);
    // let empResults_01 = specificVacBalance.get(3904, DataType.value, [annualBalance_Fld, casualBalance_Fld]);
    // alert(annualBalance_Fld + ': ' + empResults_01[annualBalance_Fld] + '\n'
    //     + casualBalance_Fld + ': ' + empResults_01[casualBalance_Fld]);
    // debugger;
    // Search for a record
    let empVacBalance = new BaseModel(vacBalance_Record);
    let _empResults = empVacBalance
        .where(emp_Fld, 'list', '==', runtime.getCurrentUser().id)
        // .where(year_Fld, 'string', '==', new Date().getFullYear())

        let empName  = _empResults.find('text', [emp_Fld], 1);
        let empResults = _empResults.find('value', [annualBalance_Fld, totalRegual_Fld, casualBalance_Fld, unpaidBalance_Fld, year_Fld], 10);

    let itemsCount = 1;
    if (empResults instanceof Array) {
        itemsCount = empResults.length;
    }

    let empInfo = `Name:\t ${empName[emp_Fld]}`;
    for (let i = 0; i < itemsCount; i++) {
        empInfo += `
 ---------------------------------------------------
 Year:\t\t ${empResults[i][year_Fld]}
 Annual Balance:\t ${empResults[i][annualBalance_Fld]}
 Casual Balance:\t ${empResults[i][casualBalance_Fld]}
 Unpaid Balance:\t ${empResults[i][unpaidBalance_Fld]}
 Total Regular Balance:\t ${empResults[i][totalRegual_Fld]}`;
    }
    context.currentRecord.setValue('custrecord_test_01', empInfo);
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