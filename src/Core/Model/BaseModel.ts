import {QueryBuilder, ColumnType} from './QueryBuilder';
import {Field} from "./Field";
import {ClientCurrentRecord, Record, Field as NsField} from "N/record";
import * as search from "N/search";
import {QueryResults} from "./QueryResults";
import {FieldGroup} from './FieldGroup';

interface BaseModelInterface {
    _record: object;

    recordType: string;

    typeMap: object;

    columnPrefix: string;

    columns: string[];

    validation: object;

    [key: string]: any

    /** Get the first result (object) in search results. */
    first(columns: string[], value): object;

    createFromRecord(record: Record);

    getRecord(id);

    setRecord(id);

    validate(): boolean;
}


export class BaseModel extends QueryBuilder implements BaseModelInterface {
    _record: ClientCurrentRecord | Record;

    private _fields = [];

    validation;

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
                this.prepareField(column);
            });

        return this;
    }

    createFromResult(result: search.Result): this {
        // this._record = result;

        if (result.columns)
            result.columns.forEach((column) => {
                this.prepareField(column);
            });

        return this;
    }

    exists(id, value) {
        let model = new BaseModel();
        //setup
        model.recordType = this.recordType;
        model.columnPrefix = this.columnPrefix;
        model.typeMap = this.typeMap;

        let exists = model.where(id, '==', value)
            .first(this.columns);

        return !!(exists);
    }

    first(columns?: string[]): object {
        let result = this.find(columns ? columns : this.columns);
        return result ? result.first() : null;
    }

    validateField(id): boolean {
        return this.getField(id).validate();
    }

    validate(): boolean {
        return this._fields.every((field) => {
            return field.validate();
        });
    }

    protected getValidationRules(fieldId) {
        let rules;

        try {
            rules = this.validation[fieldId];
        } catch (e) {
            // lol sorry
        }

        return rules;
    }

    protected prepareField(fieldId) {
        let nsField = this.getNsField(fieldId);

        if (!nsField)
            return;

        let field = new Field(fieldId, nsField, this._record);

        let rules = this.getValidationRules(fieldId);

        if (rules)
            field.addRules(rules, this);

        this._fields.push(field);

        // Add Field to Model as a Param & Return
        return this[fieldId] = field;
    }

    protected getNsField(fieldId) {
        return this._record.getField({
            fieldId: this.getColumnId(fieldId)
        });
    }

    removePrefix(fieldId) {
        return fieldId.replace(this.columnPrefix, '');
    }

    getField(fieldId) {
        return this.prepareField(fieldId);
    }

    getFields(fields: string[]): FieldGroup {
        let fieldGroup = FieldGroup.create();

        fields.forEach((fieldId) => {
            fieldGroup.push(this.getField(fieldId));
        });

        return fieldGroup;
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

export {ColumnType};