/**
 * NetSuite Vendor Bill record
 */
import { SublistLine, Sublist } from "./Sublist";
import * as record from 'N/record';
import { TransactionBase } from "./Transaction";
/**
 * Sublist 'item' on the Vendor Bill record
 */
export declare class ItemSublist extends SublistLine {
    item: number;
    quantity: number;
    amount: number;
    rate: number;
}
/**
 * Sublist 'expense' on the Vendor Bill record
 */
export declare class ExpenseSublist extends SublistLine {
    account: number;
    amount: number;
    categoryexpaccount: number;
    department: number;
    line: number;
    lineuniquekey: string;
    location: number;
}
/**
 * NetSuite Vendor Bill Record
 */
export declare class VendorBillBase extends TransactionBase {
    static recordType: record.Type;
    item: Sublist<ItemSublist>;
    expense: Sublist<ExpenseSublist>;
}
