import {Operator} from './Operator';
import {QueryResults} from "./QueryResults";
import * as search from "N/search";
import * as record from "N/record";

export enum ColumnType { STRING = 'string', BOOLEAN = 'boolean', NUMBER = 'number', DATE = 'date', LIST = 'list', MULTI = 'multi' }

interface QueryBuilderInterface {
    recordType: string

    primaryKey: string

    typeMap: object

    columns: string[]

    _limit: number

    _query: object

    find(columns: string[], value?: boolean): QueryResults | false

    get(recordId: number, columns: string[], value: boolean): object | false

    limit(limit: number): this;

    // sortBy(column, direction):this

    where(columnId: string, operator: string, value: any): this;

    query(): boolean;
}

class QueryBuilder implements QueryBuilderInterface {
    recordType: string = '';
    primaryKey: string = 'id';
    typeMap: object = {};
    columnPrefix: string = '';
    columns: string[] = [];

    dontPrefix = [
        'id',
        'name',
        'internalid',
        'isinactive'
    ];

    _limit: number = 999;
    _query: search.Filter[] = [];


    get(recordId: number, columns?: string[], load?: boolean): any {
        if (!load)
            return this.prepareResult(search.lookupFields({
                type: this.recordType,
                id: recordId,
                columns: columns ? this.prepareColumns(columns) : this.prepareColumns(this.columns),
            }));

        return this.prepareRecord(record.load({id: recordId, type: this.recordType, isDynamic: false}))
    }

    find(columns?: string[]): QueryResults {

        let results = search.create({
            type: this.recordType,
            filters: this._query,
            columns: columns ? this.prepareColumns(columns) : this.prepareColumns(this.columns),
        }).run()
            .getRange({start: 0, end: this._limit});

        return this.prepareResults(results);
    }

    query(): boolean {
        return false;
    }

    where(columnId: string, operator: string, value: any = null, summary?): this {
        // Validate here
        let nsOperator: search.Operator = Operator.get(operator, this.getColumnType(columnId));

        let options: { name: string; operator: search.Operator } = {
            name: this.getColumnId(columnId),
            operator: nsOperator
        };

        if (value)
            options['values'] = value;


        if (summary)
            options['summary'] = summary;

        this._query.push(search.createFilter(options));

        return this;
    }

    limit(limit: number): this {
        this._limit = limit;
        return this;
    }

    protected prepareColumns(columns) {
        columns = this.addPrefix(columns);

        // Add primary key : Important for integrity
        // columns.push(this.primaryKey);

        return columns;
    }

    protected prepareRecord(record: record.Record): any {
        return record;
    }

    protected prepareResult(result: search.Result): any {
        return result;
    }

    protected prepareResults(results: search.Result[]) {
        let records = QueryResults.create();

        for (let i = 0; i < results.length; i++) {
            records.push(this.prepareResult(results[i]));
        }

        return records;
    }

    getColumnType(column): string {
        return this.typeMap[column];
    }

    getColumnId(column): string {
        if (this.dontPrefix.indexOf(column) !== -1)
            return column;

        return this.columnPrefix + column;
    }

    protected addPrefix(columns: string[]): string[] {
        let prefixed: string[] = [];

        for (let i = 0; i < columns.length; i++)
            prefixed.push(this.getColumnId(columns[i]));

        return prefixed;
    }

}


export {QueryBuilder};