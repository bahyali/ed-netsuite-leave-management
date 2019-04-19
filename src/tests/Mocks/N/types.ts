import {EntryPoints as NsEntryPoints} from "@hitc/netsuite-types/N/types";

export namespace EntryPoints {
    export namespace Client {
        export const pageInitContext: NsEntryPoints.Client.pageInitContext = {
            currentRecord: undefined,
            mode: undefined
        };

        export const validateFieldContext: NsEntryPoints.Client.validateFieldContext = {
            column: 0,
            currentRecord: undefined,
            fieldId: "",
            line: 0,
            sublistId: ""
        };

        export const fieldChangedContext: NsEntryPoints.Client.fieldChangedContext = {
            column: 0,
            currentRecord: undefined,
            fieldId: "",
            line: 0,
            sublistId: ""
        };
    }
}