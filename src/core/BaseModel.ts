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
    get(recordId: number, fieldsDataType: DataType, columns?: string[]): {};
    /** Find the values of matched results of the selected filters. */
    find(fieldsDataType: DataType, resultsCount?: number, columns?: string[]): any[] | {};
    /** Add filters to 'find()' to concise the search results. */
    where(filterObj: FilterObject): this;
}


class BaseModel implements BaseModelInterface {

    /** Record Type either as a string (ID) or NetSuite Record Types Enum ex: `record.Type.EMPLOYEE` */
    private recordType: string;
    /** Default Columns (Fields) to be gotten from the search results. */
    private defaultColumns: string[];
    /** Filters which applies on the search to find the purposed results. */
    private readonly filters: any[];
    /** The object which contains the Columns(Fields) and their values in a an object dictionary format. */
    private readonly attributes: {} | any[];

    // Initialize a new BaseModel
    constructor(recordType: string) {
        this.recordType = recordType;
    }

    getRecordType(){
        return this.recordType;
    }

    /** Set the Record type the search is looking for */
    setRecordType(recordType: string){
        this.recordType = recordType;
    }

    getDefaultColumns(){
        return this.defaultColumns;
    }

    /** Set the default columns the search is looking for */
    setDefaultColumns(defaultColumns: string[]){
        this.defaultColumns = defaultColumns;
    }

    getFilters() {
        return this.filters;
    }

    getAttributes() {
        return this.attributes;
    }

    get(recordId: number, fieldsDataType: DataType, columns?: string[]) {

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
                    this.attributes[colName] = results[colName][0][DataType[fieldsDataType]]

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


    find(fieldsDataType: DataType, resultsCount?: number, columns?: string[]) {

        // Set default values for optional parameters
        resultsCount = resultsCount || 1;

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
                if (fieldsDataType == DataType.value) {
                    this.attributes[colName] = searchResults[0].getValue(columns[i]);
                } else if (fieldsDataType == DataType.text) {
                    this.attributes[colName] = searchResults[0].getText(columns[i]);
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
                    if (fieldsDataType == DataType.value) {
                        resultCols[colName] = searchResults[i].getValue(columns[j]);
                    } else if (fieldsDataType == DataType.text) {
                        resultCols[colName] = searchResults[i].getText(columns[j]);
                    }
                }
                resultCols['id'] = searchResults[i].id;
                results.push(resultCols);
            }
            return results;
        }
    }

    where(filterObj: FilterObject) {

        let fieldType: string;
        let nsOperator: {};
        if (typeof filterObj.fieldType === 'string') {
            fieldType = filterObj.fieldType;
        } else {
            fieldType = typeof (filterObj.fieldValue);
        }

        switch (fieldType) {
            case 'string':
                nsOperator['=='] = search.Operator.IS;
                nsOperator['!='] = search.Operator.ISNOT;
                nsOperator['null'] = search.Operator.ISEMPTY;
                nsOperator['!null'] = search.Operator.ISNOTEMPTY;
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
                nsOperator['null'] = search.Operator.ISEMPTY;
                nsOperator['!null'] = search.Operator.ISNOTEMPTY;
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

        let newFilter = search.createFilter({
            name: filterObj.fieldId,
            operator: nsOperator[filterObj.operator],
            values: filterObj.fieldValue,
        });
        this.filters.push(newFilter);
        return this;
    }
}

export { BaseModel, DataType, FilterObject };