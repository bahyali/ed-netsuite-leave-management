/**
 * @module      LeaveManagement
 * @class       BaseModel
 * @description Base Model Class customized for SuiteScript 2.0 using TypeScript to be extended
 * @author      Mohamed Elshowel
 * @version     1.0.0
 * @repo        https://github.com/bahyali/ed-netsuite-leave-management
 */
define(["require", "exports", "N/search"], function (require, exports, search) {
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * NetSuite Fields Types:
     *  - string:   Free-Form Text, Email Address, Long Text, Password, Percent, Phone Number, Rich Text, Text Area.
     *  - boolean:  Check Box.
     *  - number:   Decimal Number, Currency, Time of Day.
     *  - object:   Multi Select.
     *  - date:     Date.
     *  - list:     List/Record, Document, Image.
     */
    var FieldType;
    (function (FieldType) {
        FieldType[FieldType["string"] = 0] = "string";
        FieldType[FieldType["boolean"] = 1] = "boolean";
        FieldType[FieldType["number"] = 2] = "number";
        FieldType[FieldType["object"] = 3] = "object";
        FieldType[FieldType["date"] = 4] = "date";
        FieldType[FieldType["list"] = 5] = "list";
    })(FieldType || (FieldType = {}));
    ;
    /** Data Type of NetSuite 'List/Record' fields and NetSuite 'Multiple Select' fields.  */
    var DataType;
    (function (DataType) {
        DataType[DataType["value"] = 0] = "value";
        DataType[DataType["text"] = 1] = "text";
    })(DataType || (DataType = {}));
    exports.DataType = DataType;
    ;
    var BaseModel = /** @class */ (function () {
        // Initialize a new BaseModel
        function BaseModel(recordType) {
            this.recordType = recordType;
        }
        BaseModel.prototype.getRecordType = function () {
            return this.recordType;
        };
        /** Set the Record type the search is looking for */
        BaseModel.prototype.setRecordType = function (recordType) {
            this.recordType = recordType;
        };
        BaseModel.prototype.getDefaultColumns = function () {
            return this.defaultColumns;
        };
        /** Set the default columns the search is looking for */
        BaseModel.prototype.setDefaultColumns = function (defaultColumns) {
            this.defaultColumns = defaultColumns;
        };
        BaseModel.prototype.getFilters = function () {
            return this.filters;
        };
        BaseModel.prototype.getAttributes = function () {
            return this.attributes;
        };
        BaseModel.prototype.get = function (recordId, fieldsDataType, columns) {
            // SuiteScipt 2.0 function to create LookUpFields Search:
            var results = search.lookupFields({
                type: this.recordType,
                id: recordId,
                columns: columns || this.defaultColumns,
            });
            for (var i = 0; i < columns.length; i++) {
                var colName = columns[i].toString();
                // If the field is from a 'List/Record' Type in NetSuite, it is converted to type of Array with ONE item inside.
                if (results[colName] instanceof Array) {
                    if (results[colName].length === 1) {
                        // Generic form of ex: ``` results.colName[0].value ```
                        this.attributes[colName] = results[colName][0][DataType[fieldsDataType]];
                    }
                    else if (results[colName].length > 1) {
                        // If the field is from 'Multiple Select' Type in NetSuite
                        var valuesArr = [];
                        for (var j = 0; j < results[colName].length; j++) {
                            valuesArr.push(results[colName][j][DataType[fieldsDataType]]);
                        }
                        this.attributes[colName] = valuesArr;
                    }
                }
                else {
                    // If the field is a type of string, number, boolean
                    this.attributes[colName] = results[colName];
                }
            }
            return this.attributes;
        };
        BaseModel.prototype.find = function (fieldsDataType, resultsCount, columns) {
            // Set default values for optional parameters
            resultsCount = resultsCount || 1;
            // SuiteScipt 2.0 function to create Search:
            var searchResults = search.create({
                type: this.recordType,
                filters: this.filters,
                columns: columns || this.defaultColumns,
            }).run().getRange({ start: 0, end: resultsCount });
            // If the search is looking for a unique record (resultsCount == 1)
            if (searchResults.length === 1 && resultsCount === 1) {
                for (var i = 0; i < columns.length; i++) {
                    var colName = columns[i].toString();
                    if (fieldsDataType == DataType.value) {
                        this.attributes[colName] = searchResults[0].getValue(columns[i]);
                    }
                    else if (fieldsDataType == DataType.text) {
                        this.attributes[colName] = searchResults[0].getText(columns[i]);
                    }
                }
                return this.attributes;
                // If the search is looking for all the records that match the conditions in filters
            }
            else if (searchResults.length) {
                var results = [];
                for (var i = 0; i < searchResults.length; i++) {
                    var resultCols = {};
                    for (var j = 0; j < columns.length; j++) {
                        var colName = columns[j].toString();
                        if (fieldsDataType == DataType.value) {
                            resultCols[colName] = searchResults[i].getValue(columns[j]);
                        }
                        else if (fieldsDataType == DataType.text) {
                            resultCols[colName] = searchResults[i].getText(columns[j]);
                        }
                    }
                    resultCols['id'] = searchResults[i].id;
                    results.push(resultCols);
                }
                return results;
            }
        };
        BaseModel.prototype.where = function (filterObj) {
            var fieldType;
            var nsOperator;
            if (typeof filterObj.fieldType === 'string') {
                fieldType = filterObj.fieldType;
            }
            else {
                fieldType = typeof (filterObj.fieldValue);
            }
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
            var newFilter = search.createFilter({
                name: filterObj.fieldId,
                operator: nsOperator[filterObj.operator],
                values: filterObj.fieldValue,
            });
            this.filters.push(newFilter);
            return this;
        };
        return BaseModel;
    }());
    exports.BaseModel = BaseModel;
});
