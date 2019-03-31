import {EntryPoints} from 'N/types'
import {BaseModel, DataType, FilterObject} from 'Core/BaseModel';


export function pageInit(context: EntryPoints.Client.pageInitContext){

    alert('Deployed!');

    let empVacBalance = new BaseModel('customrecord_edc_emp_vac_balance');
    empVacBalance.where({
        fieldId: 'custrecord_edc_vac_balance_emp_name',
        fieldType: 'list',
        operator: '==',
        fieldValue: 4
    }).where({
        fieldId: 'custrecord_edc_vac_balance_year',
        fieldType: 'string',
        operator: '==',
        fieldValue: new Date().getFullYear()
    }).find(DataType.value, 1, ['custrecord_edc_vac_balance_annual', 'custrecord_edc_vac_balance_casual']);
    debugger;
    console.log(empVacBalance);
}
