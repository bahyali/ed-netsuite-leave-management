import * as NsRecord from "N/record"
import {Rule, Validation} from "../Validation";

type FieldValue = Date | number | number[] | string | string[] | boolean | null;


interface FieldInterface {
    _id: string
    _fieldId: string

    _field: NsRecord.Field
    _record: NsRecord.Record | NsRecord.ClientCurrentRecord

    disable(): void

    makeMandatory(): void

    validate(): boolean

    persist();
}

export class Field implements FieldInterface {
    _id: string;
    _fieldId: string;

    _field: NsRecord.Field;
    _record: NsRecord.Record | NsRecord.ClientCurrentRecord;

    private _rules = [];
    private _disabled: boolean;
    private _mandatory: boolean;
    private _readOnly: boolean;
    private _hidden: boolean;
    private _value: FieldValue;
    private _text: string | string[];

    constructor(id, field?: NsRecord.Field, record?: NsRecord.Record | NsRecord.ClientCurrentRecord) {
        this._id = id;
        this._field = field;

        if (field)
            this._fieldId = field.id;

        if (record) {
            this._record = record;
        }
    }

    setPrefix(prefix) {
        this._fieldId = prefix + this._id;
        return this;
    }

    addRules(fieldValidations: [], model) {
        let $self = this;

        fieldValidations.forEach((rule) => {
            this._rules.push(new Rule(rule, $self, model));
        });

        return this;
    }

    validate() {
        return this._rules.every((rule) => {
            return rule.validate();
        })
    }

    disable(disabled = true) {
        this.disabled = disabled;
    }

    makeMandatory() {
        this.mandatory = true;
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

    get text(): string {
        if (!this._record)
            return;

        return this._text = this._record.getText(this._fieldId).toString();
    }

    set text(text: string) {
        if (!this._record)
            return;

        this._text = text;
        this._record.setText(this._fieldId, text);
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

    
    get visible(){
        return this._hidden = this._field.isVisible;
    }

    set visible(value) {
        this._hidden = value;
        this._field.isVisible = value;
    }
    

    get readOnly(): boolean {
        return this._readOnly = this._field.isReadOnly;
    }

    set readOnly(value: boolean) {
        this._readOnly = value;
        this._field.isReadOnly = value;
    }

    persist() {
        if (typeof this._mandatory !== 'undefined')
            this.mandatory = this._mandatory;

        if (typeof this._disabled !== 'undefined')
            this.disabled = this._disabled;

        if (typeof this._readOnly !== 'undefined')
            this.readOnly = this._readOnly;
    }

    saveState() {
        return {
            disabled: this.disabled,
            mandatory: this.mandatory,
            readonly: this.readOnly
        }
    }

    setState(obj: object) {
        if (typeof obj['disabled'] !== 'undefined')
            this.disabled = obj['disabled'];

        if (typeof obj['mandatory'] !== 'undefined')
            this.mandatory = obj['mandatory'];

        if (typeof obj['readOnly'] !== 'undefined')
            this.readOnly = obj['readOnly'];
    }
}