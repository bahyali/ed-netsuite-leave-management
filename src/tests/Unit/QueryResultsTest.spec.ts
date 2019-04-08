import {QueryResults} from "../../Core/Model/QueryResults";
import faker from 'faker';

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

const factory = (): object => ({
    'id': faker.random.number(),
    'first_name': faker.name.firstName(),
    'last_name': faker.name.lastName()
});

const makeFactory = (count) => {
    let result = [];

    for (let i = 0; i < count; i++)
        result.push(factory());

    return result;
};