import * as search from "N/search";
import * as error from "N/error";

interface OperatorInterface {
}

class Operator implements OperatorInterface {
    static get(operator, dataType): search.Operator {
        let nsOperator: search.Operator;
        try {
            nsOperator = operators[operator][dataType];
        } catch (e) {
            throw searchOperatorException;
        }
        return nsOperator;
    }
}

export {Operator};

export const operator = Operator;

export const operators: object = {
    'empty': {
        string: search.Operator.ISEMPTY,
        number: search.Operator.ISEMPTY,
        date: search.Operator.ISEMPTY,
    },
    '!empty': {
        string: search.Operator.ISNOTEMPTY,
        number: search.Operator.ISNOTEMPTY,
        date: search.Operator.ISNOTEMPTY,
    },
    '==': {
        boolean: search.Operator.IS,
        string: search.Operator.IS,
        number: search.Operator.EQUALTO,
        date: search.Operator.ON,
        list: search.Operator.ANYOF,
        multi: search.Operator.ANYOF,
    },
    '!=': {
        string: search.Operator.ISNOT,
        number: search.Operator.NOTEQUALTO,
        date: search.Operator.NOTON,
        list: search.Operator.NONEOF,
        multi: search.Operator.NONEOF,
    },
    '===': {
        multi: search.Operator.ALLOF,
    },
    '!==': {
        multi: search.Operator.NOTALLOF,
    },
    '>': {
        number: search.Operator.GREATERTHAN,
        date: search.Operator.AFTER,
    },
    '>=': {
        number: search.Operator.GREATERTHANOREQUALTO,
        date: search.Operator.ONORAFTER,
    },
    '<': {
        number: search.Operator.LESSTHAN,
        date: search.Operator.BEFORE,
    },
    '<=': {
        number: search.Operator.LESSTHANOREQUALTO,
        date: search.Operator.ONORBEFORE,
    },
    '!>': {
        date: search.Operator.NOTAFTER,
    },
    '!=>': {
        date: search.Operator.NOTONORAFTER,
    },
    '!<': {
        date: search.Operator.NOTBEFORE,
    },
    '!=<': {
        date: search.Operator.NOTONORBEFORE,
    },
    'within': {
        date: search.Operator.WITHIN,
    },
    '!within': {
        date: search.Operator.NOTWITHIN,
    },
    '%': {
        string: search.Operator.CONTAINS,
    },
    '!%': {
        string: search.Operator.DOESNOTCONTAIN,
    },
    's%': {
        string: search.Operator.STARTSWITH,
    },
    '!s%': {
        string: search.Operator.DOESNOTSTARTWITH,
    },
    'between': {
        number: search.Operator.BETWEEN,
    }
};

/** Invalid NetSuite search operator exception. */
export const searchOperatorException = error.create({
    name: 'Invalid_NetSuite_Search_Operator',
    message: `Search Operator must be one of the \"Operators Matrix\" or NetSuite Search Operators as a string,
    check: https://system.na2.netsuite.com/app/help/helpcenter.nl?fid=section_n3005172.html`,
});