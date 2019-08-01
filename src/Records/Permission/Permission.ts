/**
 * @module      LeaveManagement
 * @class       Permission
 * @description Permission class extends `BaseModel` class
 * @author      Mohamed Elshowel
 * @version     1.0.0
 * @repo        https://github.com/bahyali/ed-netsuite-leave-management
 * @NApiVersion 2.0
 */

import { BaseModel, ColumnType } from '../../Core/Model/BaseModel';
import {LeaveRule, LeaveRuleField} from "../LeaveRule/LeaveRule";


export enum PermissionField {
    EMPLOYEE = 'emp',
    SUBSIDIARY = 'subsidiary',
    YEAR = 'year',

    DATE = 'date',
    FROM = 'from',
    TO = 'to',
    PERIOD = 'period',
    REMAINING_PERIOD = 'left_period',
    STATUS = 'status',
}

export class Permission extends BaseModel {

    recordType: string = 'customrecord_edc_permissions';

    columnPrefix: string = 'custrecord_edc_permission_';

    // Mapping
    typeMap: object = {
        'emp' : ColumnType.LIST,
        'subsidiary': ColumnType.LIST,
        'year': ColumnType.STRING,
        'from': ColumnType.NUMBER,
        'to': ColumnType.NUMBER,
        'period': ColumnType.STRING,
        'left_period': ColumnType.STRING,
        'status': ColumnType.LIST,
    }

    columns = Object.keys(this.typeMap);

    relations = {
        
        leaveRule: (subsidiary: number, year = new Date().getFullYear()) => {
            return new LeaveRule()
                .where(LeaveRuleField.SUBSIDIARY, '==', subsidiary)
                .where(LeaveRuleField.YEAR, '==', year);
        },
    }

}