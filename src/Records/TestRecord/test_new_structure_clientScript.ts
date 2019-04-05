// /**
//  * @NApiVersion 2.0
//  * @NScriptType ClientScript
//  * @NModuleScope SameAccount
//  */

// import { EntryPoints } from 'N/types';
// import * as runtime from 'N/runtime';
// import { BaseModel, DataType } from '../../Core/BaseModel';



// class VacationBalance extends BaseModel {
//     recordType: string = 'customrecord_edc_emp_vac_balance'

//     fieldsPrefix: string = 'custrecord_edc_vac_balance'

//     // Mapping
//     columns: object = {
//         // fieldName: fieldType
//         'annual': 'string',
//         'casual': 'string',
//         'unpaid': 'string',
//         'total_regular': 'string',
//         'emp_name': 'list',
//         'year': 'string'
//     }


// }

// export function pageInit(context: EntryPoints.Client.pageInitContext) {

//     let vacationBalance = new VacationBalance();
    
//     // Query
//     let query = vacationBalance
//         .where('emp_name', '==', runtime.getCurrentUser().id);

//     // Find
//     let empName = query.limit(1).find(['emp_name'], 'text');

//     let empResults = query.limit(10).find(
//         // Columns to retrive  or bring all
//         ['annual', 'total_regular', 'casual', 'unpaid', 'year']);

//     context.currentRecord.setValue('custrecord_test_01', compileEmpInfo(empName, empResults));
// }


// function compileEmpInfo(empName, empResults) {
//     let empInfo = `Name:\t ${empName['emp_name']}`;

//     for (let i = 0; i < empResults.length; i++) {
//         empInfo += `
//  ---------------------------------------------------
//  Year:\t\t ${empResults[i]['year']}
//  Annual Balance:\t ${empResults[i]['annual']}
//  Casual Balance:\t ${empResults[i]['casual']}
//  Unpaid Balance:\t ${empResults[i]['unpaid']}
//  Total Regular Balance:\t ${empResults[i]['total_regular']}`;
//     }

//     return empInfo;
// }















// // empVacBalance.where({
// //     fieldId: 'custrecord_edc_vac_balance_emp_name',
// //     fieldType: 'list',
// //     operator: '==',
// //     fieldValue: 4
// // }).where({
// //     fieldId: 'custrecord_edc_vac_balance_year',
// //     fieldType: 'string',
// //     operator: '==',
// //     fieldValue: new Date().getFullYear()
// // }).find(DataType.value, 1, ['custrecord_edc_vac_balance_annual', 'custrecord_edc_vac_balance_casual']);