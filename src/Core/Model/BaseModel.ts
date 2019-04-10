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
import {Field} from "../Page/Field";
import {ClientCurrentRecord, Record, Field as NsField} from "N/record";
import * as search from "N/search";
import {QueryResults} from "./QueryResults";

interface BaseModelInterface {
    _record: object;

    recordType: string;

    typeMap: object;

    columnPrefix: string;

    columns: string[];

    [key: string]: any

    /** Get the first result (object) in search results. */
    first(columns: string[], value): object;

    createFromRecord(record: Record);

    setRecord(id);
}

class BaseModel extends QueryBuilder implements BaseModelInterface {
    _record: ClientCurrentRecord | Record;

    getRecord(id) {
        return <Record>this.get(id, null, true);
    }

    setRecord(id) {
        let record = <Record>this.get(id, null, true);
        this.createFromRecord(record);

        return this;
    }

    createFromRecord(record: ClientCurrentRecord | Record): this {
        this._record = record;

        if (this.columns)
            this.columns.forEach((column) => {
                this.getField(column);
            });

        return this;
    }

    createFromResult(result: search.Result): this {
        // this._record = result;

        if (result.columns)
            result.columns.forEach((column) => {
                this.getField(column, true);
            });

        return this;
    }

    first(columns: string[]): object {
        let result = this.find(columns);
        return result ? result.first() : null;
    }

    protected getField(id, result?:boolean) {
        let nsField = this._record.getField({
            fieldId: this.getColumnId(id)
        });

        return this[id] = new Field(id, nsField, this._record);
    }

    // Override Query Builder prepareResults
    protected prepareResults(results: search.Result[]) {
        let records = QueryResults.create();

        // wrap record
        if (results instanceof Array)
            records.push(...results);
        else
            records.push(results);

        return records;
    }
}

export {BaseModel, ColumnType};