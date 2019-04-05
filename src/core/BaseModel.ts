/**
 * @module      LeaveManagement
 * @class       BaseModel
 * @description Base Model Class customized for SuiteScript 2.0 using TypeScript to be extended
 * @author      Mohamed Elshowel
 * @version     1.0.0
 * @repo        https://github.com/bahyali/ed-netsuite-leave-management
 * @NApiVersion 2.0
 */

import * as record from 'N/record';
import * as search from 'N/search';
import * as error from 'N/error'

/** Data Type of NetSuite 'List/Record' and 'Multiple Select' field types.  */
enum DataType { VALUE, TEXT };

/** Field Types
*  - `string`  :   Free-Form Text, Email Address, Long Text, Password, Percent, Phone Number, Rich Text, Text Area.
*  - `boolean` :   Check Box.
*  - `number`  :   Decimal Number, Currency, Time of Day.
*  - `date`    :   Date.
*  - `list`    :   List/Record, Document, Image.
*  - `multi`   :   Multiple Select.
*/
enum FieldType { STRING, BOOLEAN, NUMBER, DATE, LIST, MULTI };


interface BaseModelInterface {

    /** Get Record Type the search is looking for */
    getRecordType(): string;
    /** Get default columns (fields)  */
    getDefaultColumns(): string[];
    /** Get the filters applied from `Where()` function */
    getFilters(): any[];
    /** Get Results (array of fields values) for many records (used with `find()` function) */
    getResults(): any[];

    // /** Get Columns (fields values) for one specific record (used with `get()` function) */
    // getColumns(): object;

    /** Add filters to `find()` to concise the search results. */
    where(fieldId: string, fieldType: FieldType | string, operator: string, fieldValue?: any): this;
    /** Add limit to search results while using `find()`. 
     * - PS. maximum limit = 999. */
    limit(numberOfSearchResults: number): this;
    /** Find the values of matched results of the selected filters. */
    find(columns: string[], fieldsDataType: DataType | string): any[];
    /** Get the first result (object) in search results. */
    first(columns: string[], fieldsDataType: DataType | string): object;

    /** Get the values/texts of results for specific Record. */
    get(recordId: number, columns: string[], fieldsDataType: DataType | string): {};
}




class BaseModel implements BaseModelInterface {

    /** Record Type either as a string (ID) or NetSuite Record Types Enum ex: `record.Type.EMPLOYEE` */
    private recordType: string;
    /** Default Columns (Fields) to be gotten from the search results. */
    protected defaultColumns: string[];
    /** The First Result object contains the Columns (Fields) and their values in a an object dictionary format. */
    private firstResult: object = {};
    /** Number of Search Results */
    protected numberOfSearchResults: number;
    /** Filters which applies on the search to find the purposed results. */
    private filters: search.Filter[] = [];
    /** An array contains objects.  Each object represents a search result that contains its `columns` (Fields Values) */
    private results: object[] = [];
    /** `OperatorsMartix` represents each operator with its allowed field types and also its representer in NetSuite 
     * - ex: `==` in `list` >> `search.Operator.ANYOF`. */
    protected operatorsMatrix: object = {
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
            boolean: search.Operator.IS,
            string: search.Operator.IS,
            number: search.Operator.EQUALTO,
            date: search.Operator.ON,
            list: search.Operator.ANYOF,
            multi: search.Operator.ANYOF,
        },
        '!=': {
            string: search.Operator.ISNOT,
            number: search.Operator.NOTEQUALTO,
            date: search.Operator.NOTON,
            list: search.Operator.NONEOF,
            multi: search.Operator.NONEOF,
        },
        '===': {
            multi: search.Operator.ALLOF,
        },
        '!==': {
            multi: search.Operator.NOTALLOF,
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
        },
        '!>': {
            date: search.Operator.NOTAFTER,
        },
        '!=>': {
            date: search.Operator.NOTONORAFTER,
        },
        '!<': {
            date: search.Operator.NOTBEFORE,
        },
        '!=<': {
            date: search.Operator.NOTONORBEFORE,
        },
        'within': {
            date: search.Operator.WITHIN,
        },
        '!within': {
            date: search.Operator.NOTWITHIN,
        },
        '%': {
            string: search.Operator.CONTAINS,
        },
        '!%': {
            string: search.Operator.DOESNOTCONTAIN,
        },
        's%': {
            string: search.Operator.STARTSWITH,
        },
        '!s%': {
            string: search.Operator.DOESNOTSTARTWITH,
        },
        'between': {
            number: search.Operator.BETWEEN,
        }
    }


    // Initialize a new BaseModel
    constructor(recordType: string) {
        this.recordType = recordType;
    }


    // =========================================[ Search Functions/Methods ]=========================================
    /**
     * @param recordId - Record ID (Auto-Generated in NetSuite) - ex: 4
     * @param columns  - An Array of Field IDs (columns) the will be gotten from the search.
     * @param fieldsDataType - The type of desired data whether it is `value` or `text`.
     * + PS. Use `text` only if the field is type of 'List/Record' or 'Multiple Select' only.
     * + PS. The default Data Type is `value`.
     */
    get(recordId: number, columns?: string[], fieldsDataType: DataType | string = 'value') {
        // Clear the previous search First-Result
        this.firstResult = {};
        
        // Configuring the Data Type (`value` or `text`):
        if (fieldsDataType.toString().toUpperCase() in DataType) {
            if (typeof fieldsDataType !== 'string') {
                fieldsDataType = DataType[fieldsDataType].toString().toLowerCase();
            } else {
                fieldsDataType = fieldsDataType.toLowerCase();
            }
        } else throw dataTypeException;


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
                // Generic form of ex: `results.colName[0].value`.
                if (results[colName].length === 1) {
                    this.firstResult[colName] = results[colName][0][fieldsDataType];

                } else if (results[colName].length > 1) {
                    // If the field is from 'Multiple Select' Type in NetSuite
                    let valuesArr = [];
                    for (let j = 0; j < results[colName].length; j++) {
                        valuesArr.push(results[colName][j][fieldsDataType]);
                    }
                    this.firstResult[colName] = valuesArr;
                }
            } else {
                // If the field is a type of `string`, `number`, `boolean`, `date`.
                this.firstResult[colName] = results[colName];
            }
        }
        return this.firstResult;
    }




    /**
     * @param columns        - An Array of Field IDs (columns) the will be gotten from the search.
     * @param fieldsDataType - The type of desired data whether it is `value` or `text`.
     * + PS. Use `text` only if the field is type of 'List/Record' or 'Multiple Select'.
     */
    find(columns?: string[], fieldsDataType: DataType | string = 'value') {
        // Clear the previous search results
        this.results = [];
        // Make copy of columns IDs to use these string IDs as keys in results objects.
        if (!columns)
            columns = this.defaultColumns;
        let fields = columns.slice();
        // Set default values for optional parameters
        this.numberOfSearchResults = this.numberOfSearchResults || 1;

        // Configuring the Data Type (`value` or `text`):
        if (fieldsDataType.toString().toUpperCase() in DataType) {
            if (typeof fieldsDataType !== 'string') {
                fieldsDataType = DataType[fieldsDataType].toString().toLowerCase();
            } else {
                fieldsDataType = fieldsDataType.toLowerCase();
            }
        } else throw dataTypeException;



        // SuiteScipt 2.0 function to create Search:
        const searchResults = search.create({
            type: this.recordType,
            filters: this.filters,
            columns: columns || this.defaultColumns,
        }).run().getRange({ start: 0, end: this.numberOfSearchResults });

        // If the search is looking for a unique record (resultsCount == 1)
        for (let i = 0; i < searchResults.length; i++) {
            let resultColumns = {};
            for (let j = 0; j < fields.length; j++) {
                const colName: string = fields[j].toString();
                if (fieldsDataType === 'value') {
                    resultColumns[colName] = searchResults[i].getValue(fields[j]);
                } else if (fieldsDataType === 'text') {
                    resultColumns[colName] = searchResults[i].getText(fields[j]);
                } else {
                    throw dataTypeException;
                }
            }
            resultColumns['id'] = searchResults[i].id;
            this.results.push(resultColumns);
        }
        return this.results;
    }


    first(columns?: string[], fieldsDataType?: DataType | string) {
        return this.firstResult = this.find(columns, fieldsDataType)[0];
    }

    /**
     * @param fieldId - The field ID which the filter compares its content with a specific value.
     * @param fieldType - The type of the field in the record as following:
     *  - `string`  :   Free-Form Text, Email Address, Long Text, Password, Percent, Phone Number, Rich Text, Text Area.
     *  - `boolean` :   Check Box.
     *  - `number`  :   Decimal Number, Currency, Time of Day.
     *  - `date`    :   Date.
     *  - `list`    :   List/Record, Document, Image.
     *  - `multi`   :   Multiple Select.
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
    where(fieldId: string, fieldType: FieldType | string, operator: string, fieldValue?: any) {

        if (fieldType.toString().toUpperCase() in FieldType) {
            if (typeof fieldType !== 'string') {
                fieldType = FieldType[fieldType].toString().toLowerCase()
            }
        } else throw dataTypeException;


        // NetSuite Search Operator
        let nsOperator: search.Operator;

        // Equivalent Operator to NetSuite Operator
        let eqvOperator = this.operatorsMatrix[operator];
        if (!eqvOperator) {
            nsOperator = search.Operator[operator.toUpperCase()];
            if (!nsOperator) {
                throw searchOperatorException;
            }
        } else {
            nsOperator = eqvOperator[fieldType.toLowerCase()];
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


    /**
     * @param numberOfSearchResults - Number of search results (Min: `1` - Max: `999`)
     */
    limit(numberOfSearchResults: number) {

        if (numberOfSearchResults < 1) {
            numberOfSearchResults = 1;
        } else if (numberOfSearchResults > 999) {
            numberOfSearchResults = 999;
        }

        this.numberOfSearchResults = numberOfSearchResults;
        return this;
    }


    // ========================================= [Getters & Setters] =========================================
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
    getResults() {
        return this.results;
    }
}


export { BaseModel, DataType, FieldType };


// ========================================= [ Exceptions Objects ] =========================================

/** Invalid NetSuite search operator exception. */
const searchOperatorException = error.create({
    name: 'Invalid_NetSuite_Search_Operator',
    message: `Search Operator must be one of the \"Operators Matrix\" or NetSuite Search Operators as a string,
    check: https://system.na2.netsuite.com/app/help/helpcenter.nl?fid=section_n3005172.html`,
});


/** Invalid data type exception. */
const dataTypeException = error.create({
    name: 'Invalid_Data_Type',
    message: 'DataType must be \"value\" or \"text\".',
});