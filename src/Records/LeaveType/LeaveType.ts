/**
 * @module      LeaveManagement
 * @class       LeaveType
 * @description LeaveType class extends `BaseModel` class to access the data of LeaveTypes in NetSuite.
 * @author      Mohamed Elshowel
 * @version     1.0.0
 * @repo        https://github.com/bahyali/ed-netsuite-leave-management
 * @NApiVersion 2.0
 */

import {BaseModel, ColumnType} from '../../Core/Model/BaseModel';
import {Validation} from '../../Core/Validation';
import {currentRecord} from "N";

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
        'mapping': [this.isNotEmpty, this.isUnique],
        'max_days_request': [this.isNotExceededLimit()],
        'freq_type': [],
        'freq_value': [],
    };

    private isEmpty(columnId): boolean {
        return !!(this.getField(columnId).value);
    }

    private isNotEmpty(columnId): boolean {
        return !(this.getField(columnId).value);
    }

    private isUnique(columnId): boolean {
        return !(this.where(columnId, '==', this.getField(columnId).value)
            .first(['id'])
            ['id']);
    }

    private isNotExceededLimit(){
        return (this.getField('days_limit').value >= this.getField('max_days_request').value);
    }
}

