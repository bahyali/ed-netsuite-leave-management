/**
 * @module      LeaveManagement
 * @class       LeaveBalance
 * @description LeaveBalance class extends `BaseModel` class to access the data of Leave Balances in NetSuite.
 * @author      Mohamed Elshowel
 * @version     1.0.0
 * @repo        https://github.com/bahyali/ed-netsuite-leave-management
 * @NApiVersion 2.0
 */
import { BaseModel, FieldType, DataType } from '../../Core/BaseModel';



export class LeaveBalance extends BaseModel {

    constructor() {
        super('customrecord_edc_emp_vac_balance');
    }

    fieldsPrefix: string = 'custrecord_edc_vac_balance_';
    // Mapping
    columnsObject: object = {
        //fieldName: fieldType
        year: FieldType.STRING,
        emp_name: FieldType.LIST,
        subsidiary: FieldType.LIST,
        jobtitle: FieldType.STRING,
        department: FieldType.LIST,
        supervisor: FieldType.LIST,

        transferred: FieldType.NUMBER,
        annual: FieldType.NUMBER,
        replacement: FieldType.NUMBER,
        total_regular: FieldType.NUMBER,

        unpaid: FieldType.NUMBER,
        casual: FieldType.NUMBER,
        sick: FieldType.NUMBER,
    }

    protected defaultColumns = this.addFieldsPrefix(Object.keys(this.columnsObject));

    /** Add NetSuite & Custom Record Prefixes to the IDs of Fields (`columns`) to be able to use in Search in NetSuite.
     * @param columns - The array of columns (Fields IDs).
     */
    private addFieldsPrefix(columns: string[]) {
        if (columns) {
            for (let i = 0; i < columns.length; i++) {
                columns[i] = this.fieldsPrefix + columns[i];
            }
        }
        return columns;
    }

    /** Remove NetSuite & Custom Record Prefixes from the IDs of the fields to make it more readable.
     * @param results - The array of objects for search results.
     */
    private removeFieldsPrefix(results: object[]) {
        if (results) {
            for (let i = 0; i < results.length; i++) {
                for (let key in results[i]) {
                    if (key !== 'id') {
                        let keyWithoutPrefix = key.split(this.fieldsPrefix)[1];
                        results[i][keyWithoutPrefix] = results[i][key];
                        delete results[i][key];
                    }
                }
            }
        }
        return results;
    }


    /**
     * @param fieldName - Field name without any prefix - (ex: `year` , `annual`, ... ).
     * @param operator - The operator compares the existing value in the field with a specific value as following:
     * - `==`     :  Equality   for all field types.
     * - `!=`     :  Inequaltiy for all field types except `boolean`.
     * - `empty`  : Checks if the field isEmpty    for `string`, `number` & `date` (Without a value)
     * - `!empty` : Checks if the field isNotEmpty for `string`, `number` & `date` (Without a value)
     * - `> `     :  After for `date`  & Greater-Than for `number`.
     * - `>=`     :  On-or-After for `date` (ignores time) & Greater-Than-or-Equal-To for `number`.
     * - `< `     :  Before for `date` & Less-Than for `number`.
     * - `<=`     :  On-or-Before for `date` (ignores time) & Less-Than-or-Equal-To for `number`.
     * - `!>`     :  Not-After for `date`.
     * - `!=>`    :  Not-On-or-After for `date` (ignores time).
     * - `!<`     :  Not-Before for `date`.
     * - `!=<`    :  Not-On-or-Before for `date` (ignores time).
     * - `within` :  Within 2 dates for `date`.
     * - `!within`:  Not within 2 dates for `date`.
     * - `% `     :  Contains some characters for `string`.
     * - `!%`     :  Doesn't contain some characters for `string`.
     * - `s%`     :  Starts with a character  for `string`.
     * - `!s%`    :  Doesn't start with a character for `string`.
     * - `===`    :  Equality   for all selected items in `muliple`.
     * - `!==`    :  Inequaltiy for all selected items in `multiple`. 
     * - `between`: `number` between 2 numbers.
     * @param fieldValue - The specific value which will be compared with the content in the field.
     */
    public where(fieldName: string, operator: string, fieldValue?: any) {
        let fieldId = this.fieldsPrefix + fieldName;
        return super.where(fieldId, this.columnsObject[fieldName], operator, fieldValue);
    }

    public find(columns?: string[], fieldsDataType?: DataType | string) {
        return this.removeFieldsPrefix(super.find(this.addFieldsPrefix(columns), fieldsDataType));
    }

    public get(recordId: number, columns?: string[], fieldsDataType?: DataType | string) {
        return this.removeFieldsPrefix([super.get(recordId, this.addFieldsPrefix(columns), fieldsDataType)])[0];
    }
}