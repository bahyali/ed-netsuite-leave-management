import {QueryResults} from "../../Core/Model/QueryResults";
import faker from 'faker';
import {Result} from "@hitc/netsuite-types/N/search";

/**
 * Query Results:
 * Behaviors:
 * - Parses Result from search.Create && search.LookupFields
 * - Gets first Result
 */

describe('Query Results', () => {

    it('can build', () => {
        const count = 5;

        const results = QueryResults
            .create();

        results.push(...makeFactory(count));

        expect(results).toBeDefined();
        expect(results).toHaveLength(count);

    });

    it('can retrieve first ', () => {
        const results = QueryResults
            .create();

        results.push(...makeFactory(1));
        expect(results.first()).toBeTruthy();
    });

});

// search.Result mock
const factory = (): Result => ({
    id: faker.random.number(),
    columns: [],
    recordType: faker.random.words(),
    getValue: (column) => 'value of ' + column,
    getText: (column) => 'text of ' + column
});

const makeFactory = (count) => {
    let result = [];

    for (let i = 0; i < count; i++)
        result.push(factory());

    return result;
};