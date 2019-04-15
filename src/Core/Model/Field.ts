import * as NsRecord from "N/record"
import {Validation} from "../Validation";

type FieldValue = Date | number | number[] | string | string[] | boolean | null;


interface FieldInterface {
    _id: string
    _fieldId: string

    _field: NsRecord.Field
    _record: NsRecord.Record | NsRecord.ClientCurrentRecord
}

export class Field implements FieldInterface {
    _id: string;
    readonly _fieldId: string;

    _field: NsRecord.Field;
    _record: NsRecord.Record | NsRecord.ClientCurrentRecord;

    private _rules = [];
    private _disabled: boolean;
    private _mandatory: boolean;
    private _readOnly: boolean;
    private _value: FieldValue;
    private _text: string | string[];

    constructor(id, field: NsRecord.Field, record?: NsRecord.Record | NsRecord.ClientCurrentRecord) {
        this._id = id;
        this._field = field;
        this._fieldId = field.id;

        if (record) {
            this._record = record;
        }
    }

    get value(): FieldValue {
        if (!this._record)
            return;

        return this._value = this._record.getValue(this._fieldId);
    }

    set value(value: FieldValue) {
        if (!this._record)
            return;

        this._value = value;
        this._record.setValue(this._fieldId, value);
    }

    get text(): string | string[] {
        if (!this._record)
            return;

        return this._text = this._record.getText(this._fieldId);
    }

    get disabled(): boolean {
        return this._disabled = this._field.isDisabled;
    }

    set disabled(value) {
        this._disabled = value;
        this._field.isDisabled = value;
    }

    get mandatory(): boolean {
        return this._mandatory = this._field.isMandatory;
    }

    set mandatory(value) {
        this._mandatory = value;
        this._field.isMandatory = value;
    }

    get readOnly(): boolean {
        return this._readOnly = this._field.isReadOnly;
    }

    set readOnly(value: boolean) {
        this._readOnly = value;
        this._field.isReadOnly = value;
    }

    addRules(fieldValidations: []) {
        this._rules.push(...fieldValidations);

        return this;
    }

}