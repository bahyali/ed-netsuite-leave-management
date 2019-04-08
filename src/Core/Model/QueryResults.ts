import {Result} from "N/search";

interface QueryResultsInterface extends Array<object> {
    first(): object;
}

export class QueryResults extends Array<object>
    implements QueryResultsInterface {

    _objects: object[] = [];

    private constructor(results: Result[]) {
        super(...results);
    }

    static create(): QueryResults {
        return Object.create(QueryResults.prototype);
    }

    first(): object {
        return this[0] ?
            this[0] : null;
    }

    parse(results: Result[]) {
        for (let i = 0; i < results.length; i++) {
            this._objects.push(results[i]);
        }
    }
}