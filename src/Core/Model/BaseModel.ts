import {QueryBuilder, ColumnType} from './QueryBuilder';
import {Field} from "./Field";
import {ClientCurrentRecord, Record, Field as NsField} from "N/record";
import * as search from "N/search";
import {FieldGroup} from './FieldGroup';

interface BaseModelInterface {
    _record: object;

    recordType: string;

    typeMap: object;

    columnPrefix: string;

    columns: string[];

    validation: object;

    relations: object;

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

    validation = {};

    protected prepareRecord(record: Record) {
        return this.newInstance().createFromRecord(record);
    }

    protected prepareResult(result: search.Result) {
        return this.newInstance().createFromResult(result);
    }

    getRecord(id) {
        return <Record>this.get(id, null, true);
    }

    setRecord(id, columns?) {
        return this.get(id, columns, true);
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
        this._record = <any>result;

        if (result.columns)
            result.columns.forEach((column) => {
                let fieldId = this.removePrefix(column.name);
                this.columns.push(fieldId);
                this.prepareField(fieldId);
            });

        return this;
    }

    exists(fieldId, value) {
        let model = this.newInstance();

        let exists = model.where(fieldId, '==', value)
            .first([]);

        return !!(exists);
    }

    first(columns?: string[]): any {
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

    newInstance() {
        let model = new BaseModel();

        // copy public properties
        model.recordType = this.recordType;
        model.columnPrefix = this.columnPrefix;
        model.typeMap = this.typeMap;
        model.validation = this.validation;
        model.relations = this.relations;

        return model;
    }

    protected prepareField(fieldId) {
        let nsField = this.getNsField(fieldId);

        let field = new Field(fieldId, nsField, this._record)
            .setPrefix(this.dontPrefix.indexOf(fieldId) == -1 ? this.columnPrefix : '');

        let rules = this.getValidationRules(fieldId);

        if (rules)
            field.addRules(rules, this);

        this._fields.push(field);

        // Add Field to Model as a Param & Return
        return this[fieldId] = field;
    }

    protected getNsField(fieldId) {
        try {
            return this._record.getField({
                fieldId: this.getColumnId(fieldId)
            });
        } catch (e) {
            return;
        }
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


    save() {
        (<Record>this._record).save();
    }

    relations: object;
}

export {ColumnType};