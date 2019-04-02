/**
 * @module      LeaveManagement
 * @class       BaseModel
 * @description Base Model Class customized for SuiteScript 2.0 using TypeScript to be extended
 * @author      Mohamed Elshowel
 * @version     1.0.0
 * @repo        https://github.com/bahyali/ed-netsuite-leave-management
 */

import * as record from 'N/record';
import * as search from 'N/search';

/** Interface of Fitler Object which used in 'Where()' functions */
interface FilterObject {
    fieldId: string;
    operator: string;
    fieldValue: any;
    fieldType: any;
}

/** 
 * NetSuite Fields Types:
 *  - string:   Free-Form Text, Email Address, Long Text, Password, Percent, Phone Number, Rich Text, Text Area.
 *  - boolean:  Check Box.
 *  - number:   Decimal Number, Currency, Time of Day.
 *  - object:   Multi Select.
 *  - date:     Date.
 *  - list:     List/Record, Document, Image.
 */
enum FieldType { string, boolean, number, object, date, list };

/** Data Type of NetSuite 'List/Record' fields and NetSuite 'Multiple Select' fields.  */
enum DataType { value, text };




interface BaseModelInterface {

    /** Get Record Type the search is looking for */
    getRecordType(): string;
    /** Get default columns (fields)  */
    getDefaultColumns(): string[];
    /** Get the filters applied from `Where()` function */
    getFilters(): any[];
    /** Get attributes (values of columns) gotten from the search results */
    getAttributes(): {} | any[];

    /** Get the values/texts of results for specific Record. */
    get(recordId: number, fieldsDataType: DataType | string, columns?: string[]): {};
    /** Find the values of matched results of the selected filters. */
    find(fieldsDataType: DataType | string, resultsCount?: number, columns?: string[]): any[] | {};
    /** Add filters to 'find()' to concise the search results. */
    where(fieldId: string, fieldType: any, operator: string, fieldValue?: any): this;
}


class BaseModel implements BaseModelInterface {

    /** Record Type either as a string (ID) or NetSuite Record Types Enum ex: `record.Type.EMPLOYEE` */
    private recordType: string;
    /** Default Columns (Fields) to be gotten from the search results. */
    private defaultColumns: string[];
    /** Filters which applies on the search to find the purposed results. */
    private filters: any[];
    /** The object which contains the Columns(Fields) and their values in a an object dictionary format. */
    private attributes: {} | any[];
    /** Operators Martix represents each operator with its allowed field types and also its representer in NetSuite ex: `search.Operator.ANYOF` */
    private operatorsMatrix = {
        'empty': {
            string: search.Operator.ISEMPTY,
            number: search.Operator.ISEMPTY,
            date: search.Operator.ISEMPTY,
        },
        '!empty': {
            string: search.Operator.ISNOTEMPTY,
            number: search.Operator.ISNOTEMPTY,
            date: search.Operator.ISNOTEMPTY,
        },
        '==': {
            string: search.Operator.IS,
            boolean: search.Operator.IS,
            number: search.Operator.EQUALTO,
            list: search.Operator.ANYOF,
            date: search.Operator.ON,
            multiple: search.Operator.ANYOF,
        },
        '!=': {
            string: search.Operator.ISNOT,
            number: search.Operator.NOTEQUALTO,
            list: search.Operator.NONEOF,
            date: search.Operator.NOTON,
            multiple: search.Operator.NONEOF,
        },
        '===': {
            object: search.Operator.ALLOF,
        },
        '!==': {
            object: search.Operator.NOTALLOF,
        },
        '>': {
            number: search.Operator.GREATERTHAN,
            date: search.Operator.AFTER,
        },
        '>=': {
            number: search.Operator.GREATERTHANOREQUALTO,
            date: search.Operator.ONORAFTER,
        },
        '<': {
            number: search.Operator.LESSTHAN,
            date: search.Operator.BEFORE,
        },
        '<=': {
            number: search.Operator.LESSTHANOREQUALTO,
            date: search.Operator.ONORBEFORE,
        }
    }


    // Initialize a new BaseModel
    constructor(recordType: string) {
        this.recordType = recordType;
    }



    getRecordType() {
        return this.recordType;
    }

    /** Set the Record type the search is looking for */
    setRecordType(recordType: string) {
        this.recordType = recordType;
    }

    getDefaultColumns() {
        return this.defaultColumns;
    }

    /** Set the default columns the search is looking for */
    setDefaultColumns(defaultColumns: string[]) {
        this.defaultColumns = defaultColumns;
    }

    getFilters() {
        return this.filters;
    }

    getAttributes() {
        return this.attributes;
    }

    get(recordId: number, fieldsDataType: DataType | string, columns?: string[]) {
        let _fieldsDataType: string;
        if (typeof fieldsDataType !== 'string') {
            _fieldsDataType = DataType[fieldsDataType].toString();
        } else if (fieldsDataType.toLowerCase() !== 'value' || fieldsDataType.toLowerCase() !== 'text') {
            throw 'Invalid DataType - DataType must be \"value\" or \"text\".';
        }

        // SuiteScipt 2.0 function to create LookUpFields Search:
        const results = search.lookupFields({
            type: this.recordType,
            id: recordId,
            columns: columns || this.defaultColumns,
        });

        for (let i = 0; i < columns.length; i++) {
            const colName = columns[i].toString();

            // If the field is from a 'List/Record' Type in NetSuite, it is converted to type of Array with ONE item inside.
            if (results[colName] instanceof Array) {
                if (results[colName].length === 1) {
                    // Generic form of ex: ``` results.colName[0].value ```
                    this.attributes[colName] = results[colName][0][_fieldsDataType]

                } else if (results[colName].length > 1) {
                    // If the field is from 'Multiple Select' Type in NetSuite
                    let valuesArr = [];
                    for (let j = 0; j < results[colName].length; j++) {
                        valuesArr.push(results[colName][j][DataType[fieldsDataType]]);
                    }
                    this.attributes[colName] = valuesArr;
                }
            } else {
                // If the field is a type of string, number, boolean
                this.attributes[colName] = results[colName];
            }
        }
        return this.attributes;
    }



    /**
     * @param fieldsDataType - The type of desired data whether it is `value` or `text`.
     * + PS. Use `text` only if the field is type of 'List/Record' or 'Multiple Select'.
     * @param resultsCount   - The number of results (Min: `1` - Max: `999`).
     * @param columns        - An Array of Field IDs (columns) the will be gotten from the search.
     */
    find(fieldsDataType: DataType | string, resultsCount?: number, columns?: string[]) {

        // Set default values for optional parameters
        resultsCount = resultsCount || 1;
        resultsCount < 999 ? resultsCount : 999;

        // SuiteScipt 2.0 function to create Search:
        const searchResults = search.create({
            type: this.recordType,
            filters: this.filters,
            columns: columns || this.defaultColumns,
        }).run().getRange({ start: 0, end: resultsCount });

        // If the search is looking for a unique record (resultsCount == 1)
        if (searchResults.length === 1 && resultsCount === 1) {
            for (let i = 0; i < columns.length; i++) {
                const colName = columns[i].toString();
                if (fieldsDataType === DataType.value || fieldsDataType.toString().toLowerCase() === 'value') {
                    this.attributes[colName] = searchResults[0].getValue(columns[i]);
                } else if (fieldsDataType === DataType.text || fieldsDataType.toLowerCase() === 'text') {
                    this.attributes[colName] = searchResults[0].getText(columns[i]);
                } else {
                    throw dataTypeException;
                }
            }
            return this.attributes;

            // If the search is looking for all the records that match the conditions in filters
        } else if (searchResults.length) {
            let results = [];
            for (let i = 0; i < searchResults.length; i++) {
                let resultCols = {};
                for (let j = 0; j < columns.length; j++) {
                    const colName = columns[j].toString();
                    if (fieldsDataType === DataType.value || fieldsDataType.toString().toLowerCase() === 'value') {
                        resultCols[colName] = searchResults[i].getValue(columns[j]);
                    } else if (fieldsDataType === DataType.text || fieldsDataType.toLowerCase() === 'text') {
                        resultCols[colName] = searchResults[i].getText(columns[j]);
                    } else {
                        throw dataTypeException;
                    }
                }
                resultCols['id'] = searchResults[i].id;
                results.push(resultCols);
            }
            return results;
        }
    }




    /**
     * @param fieldId - The field ID which the filter compares its content with a specific value.
     * @param fieldType - The type of the field in the record as following:
     *  - `string`  :   Free-Form Text, Email Address, Long Text, Password, Percent, Phone Number, Rich Text, Text Area.
     *  - `boolean` :   Check Box.
     *  - `number`  :   Decimal Number, Currency, Time of Day.
     *  - `date`    :   Date.
     *  - `list`    :   List/Record, Document, Image.
     *  - `muliple` :   Multi Select.
     * @param operator - The operator compares the existing value in the field with a specific value as following:
     * - `==`     :  Equality   for all field types.
     * - `!=`     :  Inequaltiy for all field types.
     * - `empty`  : Checks if the field isEmpty    for `string`, `number` & `date` (Without a value)
     * - `!empty` : Checks if the field isNotEmpty for `string`, `number` & `date` (Without a value)
     * - `> `     :  After for `date`  & Greater-Than for `number`.
     * - `>=`     :  On-or-After for `date` & Greater-Than-or-Qual-To for `number`.
     * - `< `     :  Before for `date` & Less-Than for `number`.
     * - `<=`     :  On-or-Before for `date` & Less-Than-or-Qual-To for `number`.
     * - `!>`     :  Not-After for `date`.
     * - `!=>`    :  Not-On-or-After for `date`
     * - `!<`     :  Not-Before for `date`.
     * - `!=<`    :  Not-On-or-Before for `date`.
     * - `% `     :  Contains some characters for `string`.
     * - `s%`     :  Starts with a character  for `string`.
     * - `!s%`    :  Doesn't start with a character for `string`.
     * - `===`    :  Equality   for all selected items in `muliple`.
     * - `!==`    :  Inequaltiy for all selected items in `multiple`. 
     * - `between`: `number` between 2 numbers
     * @param fieldValue - The specific value which will be compared with the content in the field.
     */
    where(fieldId: string, fieldType: string, operator: string, fieldValue?: any) {

        if (!fieldType) {
            fieldType = typeof fieldValue;
        }
        
        // NetSuite Search Operator
        let nsOperator: search.Operator;
        
        // Equivalent Operator to NetSuite Operator
        let eqvOperator = this.operatorsMatrix[operator];
        if (!eqvOperator) {
            nsOperator = search.Operator[operator];
            if (!nsOperator) {
                throw searchOperatorException;
            }
        } else { 
            nsOperator = eqvOperator[fieldType]
        }


        let newFilter: search.Filter;
        if (fieldValue) {
            newFilter = search.createFilter({
                name: fieldId,
                operator: nsOperator,
                values: fieldValue,
            });
        } else {
            newFilter = search.createFilter({
                name: fieldId,
                operator: nsOperator,
            });
        }
        this.filters.push(newFilter);
        return this;
    }
}


export { BaseModel, DataType };

/**
 * @constant Invalid_NetSuite_Search_Operator_Exception
 */
const searchOperatorException = {
    name: 'Invalid_NetSuite_Search_Operator',
    message: `Search Operator must be one of the \"Operators Matrix\" or NetSuite Search Operators as a string,
    check: https://system.na2.netsuite.com/app/help/helpcenter.nl?fid=section_n3005172.html`
}

/**
 * @constant Invalid_Data_Type_Exception
 */
const dataTypeException = {
    name: 'Invalid_Data_Type',
    message: 'DataType must be \"value\" or \"text\".'
}

/*
        switch (fieldType) {
            case 'string':
                nsOperator['=='] = search.Operator.IS;
                nsOperator['!='] = search.Operator.ISNOT;
                nsOperator['empty'] = search.Operator.ISEMPTY;
                nsOperator['!empty'] = search.Operator.ISNOTEMPTY;
                nsOperator['%'] = search.Operator.CONTAINS;
                nsOperator['x%'] = search.Operator.STARTSWITH;
                nsOperator['!x%'] = search.Operator.DOESNOTSTARTWITH;
                break;
            case 'number':
                nsOperator['=='] = search.Operator.EQUALTO;
                nsOperator['!='] = search.Operator.NOTEQUALTO;
                nsOperator['>'] = search.Operator.LESSTHAN;
                nsOperator['>='] = search.Operator.LESSTHANOREQUALTO;
                nsOperator['<'] = search.Operator.GREATERTHAN;
                nsOperator['<='] = search.Operator.GREATERTHANOREQUALTO;
                nsOperator['empty'] = search.Operator.ISEMPTY;
                nsOperator['!empty'] = search.Operator.ISNOTEMPTY;
                nsOperator['between'] = search.Operator.BETWEEN;
                break;
            case 'boolean':
                nsOperator['=='] = search.Operator.IS;
                break;
            case 'object':
                nsOperator['==='] = search.Operator.ALLOF;
                nsOperator['!=='] = search.Operator.NOTALLOF;
            case 'list':
                nsOperator['=='] = search.Operator.ANYOF;
                nsOperator['!='] = search.Operator.NONEOF;
                break;
            case 'date':
                nsOperator['=='] = search.Operator.ON;
                nsOperator['!='] = search.Operator.NOTON;
                nsOperator['empty'] = search.Operator.ISEMPTY;
                nsOperator['!empty'] = search.Operator.ISNOTEMPTY;
                nsOperator['!>'] = search.Operator.NOTONORBEFORE;
                nsOperator['>'] = search.Operator.BEFORE;
                nsOperator['>='] = search.Operator.ONORBEFORE;
                nsOperator['!<'] = search.Operator.NOTONORAFTER;
                nsOperator['<'] = search.Operator.AFTER;
                nsOperator['<='] = search.Operator.ONORAFTER;
                break;
        }
*/