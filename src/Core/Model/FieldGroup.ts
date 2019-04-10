import {Field} from "N/record";

interface FieldGroupInterface extends Array<object> {
    _fields;

    disable(key);

    disableAll();

    enable(key);

    enableAll();
}

class FieldGroup extends Array<Field> implements FieldGroupInterface {
    _fields;

    private constructor(results) {
        super(...results);
    }

    static create(): FieldGroup {
        return Object.create(FieldGroup.prototype);
    }

    disable(id) {
        this.find(id)[0].isDisabled = true;
    }

    disableAll() {
        this.forEach((field) => {
            field.isDisabled = true;
        })
    }

    enable(id) {
        this.find(id)[0].isDisabled = false;
    }

    enableAll() {
        this.forEach((field) => {
            field.isDisabled = false;
        })
    }

    remove(id) {
        let index = this.find(id).length > 0 ? this.indexOf(this.find(id)[0]) : -1;

        if (index !== -1)
            this.splice(index);
    }

    private find(id) {
        return this.filter(obj => obj.id == id);
    }

}