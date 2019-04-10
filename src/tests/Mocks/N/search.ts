import {Filter, Result, Column} from "@hitc/netsuite-types/N/search";

export const filter: Filter = {
    name: null,
    join: null,
    operator: null,
    summary: null,
    formula: null
};

export const result: Result = {
    columns: [],
    id: "",
    recordType: undefined,
    getText(options: Column | string): string {
        return "";

    }, getValue(column: Column | string): boolean | string | string[] {
        return undefined;
    }

}
export const createFilter = jest.fn((obj) => {
    return obj;
});

export const run = jest.fn(() => {
    return {'getRange': jest.fn(() => [{'success': 'lol'}])}
});

export const create = jest.fn(() =>
    ({run: run})
);

export const lookupFields = jest.fn((options) => {
    let obj: object = {};

    for (let i = 0; i < options.columns.length; i++)
        obj[options.columns[i]] = 'result';

    return obj;
});


export enum Operator {
    AFTER,
    ALLOF,
    ANY,
    ANYOF,
    BEFORE,
    BETWEEN,
    CONTAINS,
    DOESNOTCONTAIN,
    DOESNOTSTARTWITH,
    EQUALTO,
    GREATERTHAN,
    GREATERTHANOREQUALTO,
    HASKEYWORDS,
    IS,
    ISEMPTY,
    ISNOT,
    ISNOTEMPTY,
    LESSTHAN,
    LESSTHANOREQUALTO,
    NONEOF,
    NOTAFTER,
    NOTALLOF,
    NOTBEFORE,
    NOTBETWEEN,
    NOTEQUALTO,
    NOTGREATERTHAN,
    NOTGREATERTHANOREQUALTO,
    NOTLESSTHAN,
    NOTLESSTHANOREQUALTO,
    NOTON,
    NOTONORAFTER,
    NOTONORBEFORE,
    NOTWITHIN,
    ON,
    ONORAFTER,
    ONORBEFORE,
    STARTSWITH,
    WITHIN,
}
