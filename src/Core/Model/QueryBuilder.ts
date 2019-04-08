import {Operator} from './Operator';
import {QueryResults} from "./QueryResults";
import * as search from "N/search";

export enum ColumnType { STRING = 'string', BOOLEAN = 'boolean', NUMBER = 'number', DATE = 'date', LIST = 'list', MULTI = 'multi' }

interface QueryBuilderInterface {
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
    recordType: string;
    typeMap: object;
    columnPrefix: string;
    columns: string[];

    _limit: number;
    _query: search.Filter[] = [];


    get(recordId: number, columns?: string[]): object | false {
        let results = QueryResults.create();

        results.push(search.lookupFields({
            type: this.recordType,
            id: recordId,
            columns: columns ? this.prefix(columns) : this.prefix(this.columns),
        }));

        return results.first();
    }

    find(columns?: string[]): QueryResults | false {
        let records = QueryResults.create();

        records.push(...search.create({
            type: this.recordType,
            filters: this._query,
            columns: columns ? this.prefix(columns) : this.prefix(this.columns),
        }).run()
            .getRange({start: 0, end: this._limit}));

        return records;
    }

    query(): boolean {
        return false;
    }

    where(columnId: string, operator: string, value: any = null): this {
        // Validate here
        let nsOperator: search.Operator = Operator.get(operator, this.getColumnType(columnId));

        let options: { name: string; operator: search.Operator } = {
            name: this.getColumnId(columnId),
            operator: nsOperator
        };

        if (value)
            options['values'] = value;

        this._query.push(search.createFilter(options));

        return this;
    }

    limit(limit: number): this {
        this._limit = limit;
        return this;
    }

    protected getColumnType(column): string {
        return this.typeMap[column];
    }

    protected getColumnId(column, sep = '_'): string {
        return this.columnPrefix + sep + column;
    }

    protected prefix(columns: string[], sep = '_'): string[] {
        let prefixed: string[] = [];

        for (let i = 0; i < columns.length; i++)
            prefixed.push(this.getColumnId(columns[i], sep));

        return prefixed;
    }

}


export {QueryBuilder};