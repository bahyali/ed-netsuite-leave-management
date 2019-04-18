import {Field} from "./Field";

interface FieldGroupInterface extends Array<object> {
    disable(key?);

    enable(key?);

    required(key?)

    optional(key?)
}

export class FieldGroup extends Array<Field> implements FieldGroupInterface {
    private constructor(results) {
        super(...results);
    }

    static create(): FieldGroup {
        return Object.create(FieldGroup.prototype);
    }

    disable(id?) {
        if (id)
            this.find(id)[0].disabled = true;
        else
            this.makeAllDisabled(true);
    }

    enable(id?) {
        if (id)
            this.find(id)[0].disabled = false;
        else
            this.makeAllDisabled(false);
    }

    required(id?) {
        if (id)
            this.find(id)[0].mandatory = true;
        else
            this.makeAllMandatory(true);
    }

    optional(id?) {
        if (id)
            this.find(id)[0].mandatory = false;
        else
            this.makeAllMandatory(false);
    }

    makeAllDisabled(value) {
        this.forEach((field) => {
            field.disabled = value;
        })
    }

    makeAllMandatory(value) {
        this.forEach((field) => {
            field.mandatory = value;
        })
    }

    remove(id) {
        let index = this.find(id).length > 0 ? this.indexOf(this.find(id)[0]) : -1;

        if (index !== -1)
            this.splice(index, 1);
    }

    private find(id) {
        return this.filter(obj => obj._id == id);
    }

}