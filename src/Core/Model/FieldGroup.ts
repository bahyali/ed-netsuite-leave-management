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

    persist(id?) {
        if (id)
            this.find(id)[0].persist();
        else
            this.persistAll();
    }

    persistAll() {
        this.forEach((field) => {
            field.persist();
        })
    }

    saveState() {
        let states = {};

        this.forEach((field) => {
            states[field._id] = field.saveState();
        });

        return states;
    }

    setState(states: object) {
        Object.keys(states).forEach((key) => {
            let field = this.find(key)[0];
            field.setState(states[key]);
        });
    }

    remove(id) {
        let index = this.find(id).length > 0 ? this.indexOf(this.find(id)[0]) : -1;

        if (index !== -1)
            this.splice(index, 1);
    }

    getField(id) {
        let filter = this.filter(obj => obj._id == id);
        return filter.length > 0 ? filter[0] : null;
    }

    private find(id) {
        return this.filter(obj => obj._id == id);
    }

}