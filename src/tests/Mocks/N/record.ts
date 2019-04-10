import * as record from "@hitc/netsuite-types/N/record";

export const load = jest.fn((obj) => {
    let record = Record;
    record['obj'] = obj;

    return record;
});

export const Field:
    { isReadOnly: boolean; id: string; isDisabled: boolean; isVisible: boolean; label: string; type: string; isDisplay: boolean; isMandatory: boolean } = {
    id: "",
    isDisabled: false,
    isDisplay: false,
    isMandatory: false,
    isReadOnly: false,
    isVisible: false,
    label: "",
    type: ""
};
export const Record = {
    getField(options): record.Field {
        let field = Field;
        field.id = options.fieldId;
        return <record.Field>field;
    },

    getValue(fieldId): Date | number | number[] | string | string[] | boolean | null {
        return 'value of ' + fieldId;
    },

    setValue(options): void {
        this.value = options.value;
    },

    getText(fieldId) {
        return 'text of ' + fieldId;
    }

};
