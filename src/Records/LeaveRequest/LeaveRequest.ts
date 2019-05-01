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
import { LeaveRule, LeaveRuleField } from "../LeaveRule/LeaveRule";
import { Employee } from "../Employee/Employee";
// import { FieldGroup } from '../../Core/Model/FieldGroup';

/** Defining the Fields in Vacation Request Record */
export enum EmployeeField {
    EMPLOYEE = 'emp_name',
    SUBSIDIARY = 'subsidiary',
    SUPERVISOR = 'supervisor',
    DEPARTMENT = 'department',
    JOBTITLE = 'jobtitle',
}

export enum BalanceField {
    ANNUAL = 'blc_annual',
    TRANSFERRED = 'blc_transferred',
    REPLACEMENT = 'blc_replacement',
    CASUAL = 'blc_casual',
    SICK = 'blc_sick',
    TOTAL_REGULAR = 'blc_total_regular',
    UNPAID = 'blc_unpaid',
}

export enum RequestField {
    TYPE = 'type',
    START = 'start',
    END = 'end',
    LEAVE_DAYS = 'leave_days',
    PART_DAY_LEAVE = 'leave_partday',
    REQUEST_DATE = 'date',
    STATUS = 'status',
}

export enum RelationField {
    BALANCE = 'vac_blc',
    
    RULE_CASUAL_FROM_ANNUAL = 'rule_cas_as_ann',
    RULE_APPLY_WEEKEND = 'rule_weekend_app',
    RULE_WEEKENDS = 'rule_weekend_days',

    TYPE_MAPPING = 'type_mapping',
    TYPE_LIMIT_DAYS = 'type_dayslimit',
    TYPE_MAX_PER_REQUEST = 'type_max_days_req',
    TYPE_FREQUENT_TYPE = 'type_freq_type',
    TYPE_FREQUENT_VALUE = 'type_freq_value',
    TYPE_ACCEPT_PAST_DATES = 'type_accept_past',
}




export class LeaveRequest extends BaseModel {
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

    balanceColumns: string[] = [];

    columns: string[] = [];

    validation = {
        'type': ['isNotEmpty'],
        'start': [],
        'end': [],
    };

    relations = {
        getEmployee: (model) => {
            return new Employee()
                .setRecord(model.getField(EmployeeField.EMPLOYEE).value);
        },

        leaveRule: (subsidiary: number, year = new Date().getFullYear()) => {
            return new LeaveRule()
                .where(LeaveRuleField.SUBSIDIARY, '==', subsidiary)
                .where(LeaveRuleField.YEAR, '==', year);
        },

        leaveType: (model: BaseModel) => {
            let leaveTypeId = model.getField(RequestField.TYPE).value;
            return new LeaveType()
                .where(LeaveTypeFields.MAPPING, '==', leaveTypeId);
        }
    }
}