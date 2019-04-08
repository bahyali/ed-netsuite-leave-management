import {ColumnType, QueryBuilder} from "../../Core/Model/QueryBuilder";
import {LeaveBalance} from "../../Records/LeaveBalance/LeaveBalance";

/**
 * Test Query Builder
 * Behaviors:
 * - Builds Query
 * - Returns QueryResults : find
 * - Returns Object : get
 * */
describe('Query Builder', () => {

    it('can build queries', () => {
        const builder = new QueryBuilder();

        builder.recordType = "vacations";
        builder.typeMap = [{
            'days': ColumnType.STRING,
            'employee': ColumnType.STRING
        }];

        builder.where('days', '==', 'april')
            .where('name', '==', 'khaled');

        // Should return itself in Query Building
        expect(builder).toBeInstanceOf(QueryBuilder);

        // Should have two conditions
        expect(builder._query.length).toEqual(2);
    });

    it('can Query using lookupFields ', () => {
        const builder = new QueryBuilder();

        builder.recordType = "vacations";

        builder.typeMap = [
            {
                'foo': ColumnType.STRING,
                'bar': ColumnType.BOOLEAN
            }
        ];

        let record = builder.get(1, ['foo', 'bar']);

        expect(record).toBeInstanceOf(Object);

        expect(record).toEqual({
            'foo': 'bar',
            'bar': 'foo'
        });

    });

    it('should break', () => {
        let leaveBalance = new LeaveBalance();

        leaveBalance.where('days', '==', 'april')
            .where('name', '==', 'khaled')
            .find(['days', 'year']);
    });

});