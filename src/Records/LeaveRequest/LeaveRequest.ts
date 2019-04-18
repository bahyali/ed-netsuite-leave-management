/**
 * @module      LeaveManagement
 * @class       LeaveRequest
 * @description `LeaveRequest` class extends `BaseModel` class to prepare a Vacation Request and access employee's vacations balance.
 * @author      Mohamed Elshowel
 * @version     1.0.0
 * @repo        https://github.com/bahyali/ed-netsuite-leave-management
 * @NApiVersion 2.0
 */

import { BaseModel, ColumnType } from '../../Core/Model/BaseModel';
import { Validation } from '../../Core/Validation';
import { Field } from 'src/Core/Model/Field';
import { LeaveType, LeaveTypeFields } from '../LeaveType/LeaveType';
import { LeaveRule } from "../LeaveRule/LeaveRule";
// import { FieldGroup } from '../../Core/Model/FieldGroup';

/** Defining the Fields in Vacation Request Record */
export enum EmployeeFields {
    EMPLOYEE = 'emp_name',
    SUBSIDIARY = 'subsidiary',
    SUPERVISOR = 'supervisor',
    DEPARTMENT = 'department',
    JOBTITLE = 'jobtitle',
}

export enum BalanceFields {
    ANNUAL = 'blc_annual',
    TRANSFERRED = 'blc_transferred',
    REPLACEMENT = 'blc_replacement',
    CASUAL = 'blc_casual',
    SICK = 'blc_sick',
    TOTAL_REGULAR = 'blc_total_regular',
    UNPAID = 'blc_unpaid',
}

export enum RequestFields {
    TYPE = 'type',
    START = 'start',
    END = 'end',
    LEAVE_DAYS = 'leave_days',
    PART_DAY_LEAVE = 'leave_partday',
    REQUEST_DATE = 'date',
    STATUS = 'status',
}




export class LeaveRequest extends BaseModel {

    static fields = RequestFields;

    recordType = 'customrecord_edc_vac_request';
    columnPrefix = 'custrecord_edc_vac_req_';

    typeMap = {
        // Employee's Information
        'emp_name': ColumnType.LIST,
        'subsidiary': ColumnType.LIST,
        'supervisor': ColumnType.LIST,
        'department': ColumnType.LIST,
        'jobtitle': ColumnType.STRING,
        // Employee's Balance
        'blc_annual': ColumnType.NUMBER,
        'blc_transferred': ColumnType.NUMBER,
        'blc_replacement': ColumnType.NUMBER,
        'blc_casual': ColumnType.NUMBER,
        'blc_sick': ColumnType.NUMBER,
        'blc_total_regular': ColumnType.NUMBER,
        'blc_unpaid': ColumnType.NUMBER,
        // Request Field
        'type': ColumnType.LIST,
        'start': ColumnType.DATE,
        'end': ColumnType.DATE,
        'leave_days': ColumnType.NUMBER,
        'leave_partday': ColumnType.LIST,
        // Other Fields
        'date': ColumnType.DATE,
        'time': ColumnType.NUMBER,
        'status': ColumnType.LIST,
    };

    columns = Object.keys(this.typeMap);

    validation = {
        'type': [Validation.isNotEmpty,],
        'start': [Validation.isNotEmpty, { greaterThanOrEqual: RequestFields.REQUEST_DATE }],
        'end': [Validation.isNotEmpty,],

    }



    leaveRule(subsidiary: number, year = new Date().getFullYear()) {
        return new LeaveRule().where('subsidiary', '==', subsidiary).where('year', '==', year);
    }

    leaveType(type: number){
        return new LeaveType().where(LeaveTypeFields.MAPPING, '==', type);
    }

    
}


/* =====================[ CUSTOMIZED FUNCTIONS ]=====================  */
const isValidStartDate = (field: Field, model: BaseModel, reqField, ): boolean => {
    const isPastDatesAccepted = new LeaveType().get();
    return;
}