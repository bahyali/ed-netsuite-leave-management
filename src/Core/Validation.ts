import {Field} from "./Model/Field";
import {BaseModel} from "./Model/BaseModel";
import validator from 'validator';

// Translator of Rule

interface RuleInterface {
    validate()
}

const enum RuleType {String, Object, Callback}

export class Rule implements RuleInterface {
    readonly _type: RuleType;
    readonly _validator;
    readonly _field: Field;

    private _model: BaseModel;

    constructor(validator, field: Field, model?: BaseModel) {
        this._validator = validator;
        this._type = Rule.setRuleType(validator);
        this._field = field;
        this._model = model;
    }

    private static setRuleType(validator) {
        if (typeof validator == 'string')
        // _Field only required to function
            return RuleType.String;
        else if (typeof validator == 'object')
            return RuleType.Object;
        else if (validator instanceof Function)
            return RuleType.Callback;
    }

    validate(): boolean {
        //dependencies to inject in all validators
        let args = [this._field, this._model];

        if (this._type == RuleType.String) {
            // String validation on Field Value
            return Validation[this._validator](...args)();

        } else if (this._type == RuleType.Object) {
            // Parse Object and Extract Data
            //{ validatorName: [arg1, arg2, arg3] };

            let validator = Object.keys(this._validator)[0];

            args.push(...this._validator[validator]);

            return Validation[validator](...args)();

        } else if (this._type == RuleType.Callback)
        // Run Function
        //()=> {return boolean}
            return this._validator(...args);

        // If no validators could run, it should be valid.
        return true;
    }
}

// Our validation layer

export class Validation {
    static isEmpty(field: Field) {
        return () => validator.isEmpty(field.value);
    }

    static isNotEmpty(field: Field) {
        return () => !validator.isEmpty(field.value);
    }

    static isUnique(field: Field, model) {
        return () => !model.exists(field._id, field.value)
    }

    static greaterThan(field: Field, model: BaseModel, otherFieldId: string){
        return () => {
            const otherFieldValue = model.getField(otherFieldId).value;
            const fieldValue = field.value;
            return fieldValue > otherFieldValue;
        }
    }

    static lessThan(field: Field, model: BaseModel, otherFieldId: string){
        return ! this.greaterThan(field, model, otherFieldId);
    }

    static greaterThanOrEqual(field: Field, model: BaseModel, otherFieldId:string){
        return () => {
            const otherFieldValue = model.getField(otherFieldId).value;
            const fieldValue = field.value;
            return fieldValue >= otherFieldValue;
        }
    }

    static lessThanOrEqual(field: Field, model: BaseModel, otherFieldId: string){
        return ! this.greaterThanOrEqual(field, model, otherFieldId);
    }

}