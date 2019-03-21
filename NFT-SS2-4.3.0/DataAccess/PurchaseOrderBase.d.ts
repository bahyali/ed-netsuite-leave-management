/**
 * NetSuite Purchase Order Record
 */
import * as record from 'N/record';
import { TransactionBase } from './Transaction';
import { Sublist, SublistLine } from './Sublist';
/**
 * Sublist 'item' on purchase orders
 */
export declare class ItemSublist extends SublistLine {
    amount: number;
    class: number;
    customer: number;
    deferrevrec: boolean;
    department: number;
    description: string;
    isclosed: boolean;
    item: number;
    quantity: number;
    rate: number;
}
/**
 * NetSuite Purchase Order Record
 */
export declare class PurchaseOrderBase extends TransactionBase {
    static recordType: record.Type;
    approvalstatus: number;
    item: Sublist<ItemSublist>;
}
