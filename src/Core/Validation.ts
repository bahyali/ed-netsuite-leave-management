/**
 * @module      LeaveManagement
 * @class       Validation
 * @description LeaveBalance class extends `BaseModel` class to access the data of Leave Balances in NetSuite.
 * @author      Mohamed Elshowel
 * @version     1.0.0
 * @repo        https://github.com/bahyali/ed-netsuite-leave-management
 * @NApiVersion 2.0
 */

import {Field} from "./Model/Field";
import {BaseModel} from "./Model/BaseModel";

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
        if (this._type == RuleType.String) {
            // String validation on Field Value
            return Validation[this._validator](this._field)();

        } else if (this._type == RuleType.Object) {
            // Parse Object and Extract Data
            //{ validatorName: [arg1, arg2, arg3] };

            let validator = Object.keys(this._validator)[0];
            let args = this._validator[validator];

            return Validation[validator](...args)();

        } else if (this._type == RuleType.Callback)
        // Run Function
        //()=> {return boolean}
            return this._validator();

        // If no validators could run, it should be valid.
        return true;
    }
}

// Our validation layer

export class Validation {
    static isEmpty(field) {
        // return () => validator.isEmpty(field.value);
    }

    static isUnique(field) {

    }
}