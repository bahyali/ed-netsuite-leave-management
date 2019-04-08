import {Filter} from "@hitc/netsuite-types/N/search";

export const filter: Filter = {
    name: null,
    join: null,
    operator: null,
    summary: null,
    formula: null
};

export const createFilter = jest.fn((obj) => {
    return obj;
});

export const run = jest.fn(() => {
    return {'getRange': jest.fn(() => [{'success': 'lol'}])}
});

export const create = jest.fn(() =>
    ({run: run})
);

export const lookupFields = jest.fn().mockReturnValue({
    'foo': 'bar',
    'bar': 'foo'
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
