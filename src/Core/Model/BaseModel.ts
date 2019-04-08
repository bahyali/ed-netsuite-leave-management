/**
 * @module      LeaveManagement
 * @class       BaseModel
 * @description Base Model Class customized for SuiteScript 2.0 using TypeScript to be extended
 * @author      Mohamed Elshowel
 * @version     1.0.0
 * @repo        https://github.com/bahyali/ed-netsuite-leave-management
 * @NApiVersion 2.0
 */

import {QueryBuilder, ColumnType} from './QueryBuilder';
import {ClientCurrentRecord, Record} from "N/record";

interface BaseModelInterface {
    /** Get the first result (object) in search results. */
    first(columns: string[], value): object;
}

class BaseModel extends QueryBuilder implements BaseModelInterface {
    _record: ClientCurrentRecord | Record = null;

    _attributes;

    constructor(attributes?: object | ClientCurrentRecord | Record) {
        super();

        this._attributes = attributes;
    }

    first(columns: string[]): object {
        let result = this.find(columns);
        return result ? result.first() : null;
    }
}

export {BaseModel, ColumnType};