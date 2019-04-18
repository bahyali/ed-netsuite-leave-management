/**
 * @module      LeaveManagement
 * @class       LeaveType
 * @description LeaveType class extends `BaseModel` class to access the data of Vacation Types in NetSuite.
 * @author      Mohamed Elshowel
 * @version     1.0.0
 * @repo        https://github.com/bahyali/ed-netsuite-leave-management
 * @NApiVersion 2.0
 */

import { ColumnType } from '../../Core/Model/QueryBuilder';
import { BaseModel } from '../../Core/Model/BaseModel';
import { Validation } from '../../Core/Validation';


/** Defining the Fields in the Leave Type Record */
export enum LeaveTypeFields {
    MAPPING = 'mapping',
    DAYS_LIMIT = 'days_limit',
    MAX_DAYS_REQUEST = 'max_days_request',
    FREQUENT_TYPE = 'freq_type',
    FREQUENT_VALUE = 'freq_value',
    ACCEPT_PAST_DATE = 'accept_past_date'
}


export class LeaveType extends BaseModel {
    recordType: string = 'customrecord_edc_vac_type';
    columnPrefix: string = 'custrecord_edc_vac_type_';

    typeMap: object = {
        'mapping': ColumnType.LIST,
        'days_limit': ColumnType.NUMBER,
        'max_days_request': ColumnType.NUMBER,
        'freq_type': ColumnType.LIST,
        'freq_value': ColumnType.NUMBER,
        'accept_past_date': ColumnType.BOOLEAN,
    };

    columns = Object.keys(this.typeMap);

    validation: object = {
        'mapping': [isCustom],
        'max_days_request': [
            { lessThanOrEqual: ['days_limit'] }
        ],
    };
}

const isCustom = (field, model) => {
    if (field.text.toString().toLowerCase() !== 'custom')
        // call isUnique Validator
        return Validation.isUnique(field, model)();

    return true;
};