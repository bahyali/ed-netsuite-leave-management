/**
 * @module      LeaveManagement
 * @class       LeaveBalance
 * @description LeaveBalance class extends `BaseModel` class to access the data of Leave Balances in NetSuite.
 * @author      Mohamed Elshowel
 * @version     1.0.0
 * @repo        https://github.com/bahyali/ed-netsuite-leave-management
 * @NApiVersion 2.0
 */

import {BaseModel} from '../../Core/Model/BaseModel';
import {ColumnType} from "../../Core/Model/QueryBuilder";


export class LeaveBalance extends BaseModel {

    recordType: string = 'customrecord_edc_emp_vac_balance';

    columnPrefix: string = 'custrecord_edc_vac_balance_';

    // Mapping
    typeMap: object = {
        //fieldName: fieldType
        "year": ColumnType.STRING,
        "emp_name": ColumnType.LIST,
        "subsidiary": ColumnType.LIST,
        "jobtitle": ColumnType.STRING,
        "department": ColumnType.LIST,
        "supervisor": ColumnType.LIST,

        "transferred": ColumnType.NUMBER,
        "annual": ColumnType.NUMBER,
        "replacement": ColumnType.NUMBER,
        "total_regular": ColumnType.NUMBER,

        "unpaid": ColumnType.NUMBER,
        "casual": ColumnType.NUMBER,
        "sick": ColumnType.NUMBER,
    };

    columns = Object.keys(this.typeMap);
}