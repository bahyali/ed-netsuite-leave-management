import {ColumnType, QueryBuilder} from "../../Core/Model/QueryBuilder";
import {QueryResults} from "../../Core/Model/QueryResults";

/**
 * Test Query Builder
 * Behaviors:
 * - Builds Query
 * - Returns QueryResults : find
 * - Returns Object : get
 * */


describe('Query Builder', () => {

    it('can build queries', () => {
        const builder = build();

        builder.columns = ['foo', 'bar'];

        builder.where('foo', '==', 'april')
            .where('bar', '==', 'khaled');

        // Should return itself in Query Building
        expect(builder).toBeInstanceOf(QueryBuilder);

        // Should have two conditions
        expect(builder._query.length).toEqual(2);
    });

    it('can Query using lookupFields ', () => {
        const builder = build();

        builder.columns = ['foo', 'bar'];

        let record = builder.get(1);

        expect(record).toBeInstanceOf(Object);

        expect(record).toEqual(expect.objectContaining({
            'ns_prefix_col_foo': expect.any(String),
            'ns_prefix_col_bar': expect.any(String),
        }));

    });

    it('can Query using searchCreate ', () => {
        const builder = build();

        builder.columns = ['foo', 'bar'];

        let record = builder
            .where('bar', '==', 'april')
            .find();

        expect(record).toBeInstanceOf(QueryResults);
    });

});

const build = () => {
    const builder = new QueryBuilder();

    builder.recordType = "ns_prefix_vacations";

    builder.columnPrefix = "ns_prefix_col_";

    builder.typeMap = {
        'foo': ColumnType.STRING,
        'bar': ColumnType.NUMBER
    };

    return builder;
};