/**
 * NetSuite generic Transaction record
 */
import { Sublist, SublistLine } from './Sublist';
import * as record from 'N/record';
import { TransactionBase } from './Transaction';
/**
 * Sublist 'item' on the Sales Order record
 */
export declare class ItemSublist extends SublistLine {
    amount: number;
    commitinventory: number;
    costestimate: number;
    costestimaterate: number;
    deferrevrec: boolean;
    description: string;
    expectedshipdate: Date;
    isclosed: boolean;
    isestimate: boolean;
    istaxable: boolean;
    item: number;
    itemtype: string;
    lineuniquekey: string;
    linenumber: number;
    location: number;
    porate: number;
    price: number;
    quantity: number;
    rate: number;
    taxcode: number;
    department: number;
    revrecstartdate: Date;
    revrecenddate: Date;
    taxrate1: number;
    units: number;
}
/**
 * 'salesteam' sublist
 */
export declare class SalesTeamSublist extends SublistLine {
    contribution: number;
    employee: number;
    isprimary: boolean;
    salesrole: number;
}
/**
 * NetSuite Sales Order Record
 */
export declare class SalesOrderBase extends TransactionBase {
    static recordType: record.Type;
    item: Sublist<ItemSublist>;
    salesteam: Sublist<SalesTeamSublist>;
}
