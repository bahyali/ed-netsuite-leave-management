/**
 * @module      LeaveManagement
 * @class       Validation
 * @description LeaveBalance class extends `BaseModel` class to access the data of Leave Balances in NetSuite.
 * @author      Mohamed Elshowel
 * @version     1.0.0
 * @repo        https://github.com/bahyali/ed-netsuite-leave-management
 * @NApiVersion 2.0
 */
import {BaseModel} from "./Model/BaseModel";

export const Validation: object = {
    isEmpty: (fieldValue): boolean => {
        return !!(fieldValue);
    },
    isNotEmpty: (fieldValue): boolean => {
        return !(fieldValue)
    },
    isGreaterThan: (fieldValue, comparedValue): boolean => {
        return (fieldValue > comparedValue);
    },
    isGreaterOrEqual: (fieldValue, comparedValue): boolean => {
        return (fieldValue >= comparedValue);
    },
    isUnique: (fieldId, fieldValue, recordType): boolean => {
        return !(new BaseModel().setRecord(recordType).where(fieldId, '==', fieldValue).first(['id'])['id']);
    }
};


// /** Under Development... */
// interface ValidationInterface{
//     isEmpty(fieldValue: any): boolean;
// }
// export class ValidationClass implements ValidationInterface {
//     public isEmpty(fieldValue: any) {
//         return !!fieldValue;
//     }
// }