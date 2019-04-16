/**
 * @module      LeaveManagement
 * @class       LeaveType
 * @description LeaveType class extends `BaseModel` class to access the data of Vacation Types in NetSuite.
 * @author      Mohamed Elshowel
 * @version     1.0.0
 * @repo        https://github.com/bahyali/ed-netsuite-leave-management
 * @NApiVersion 2.0
 */

import { BaseModel, ColumnType } from '../../Core/Model/BaseModel';
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

    columns = this.addPrefix(Object.keys(this.typeMap));

    private validations: object = {
        'mapping': [Validation['isEmpty'], Validation['isUnique']],
        'max_days_request': [],
        'freq_type': [],
        'freq_value': [],
    };

    public validateField(fieldId) {
        let validations = super.getField(fieldId).addFieldValidations(this.validations[fieldId]);
        for (let i = 0; i < validations.length; i++) {
            validations[i](fieldId);
        }
    }
}

