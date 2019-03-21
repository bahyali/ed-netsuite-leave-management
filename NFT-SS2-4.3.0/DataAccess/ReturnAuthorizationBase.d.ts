/**
 * Represents a Return Authorization (returnauthorization) transaction type in NetSuite
 */
import * as record from 'N/record';
import { TransactionBase } from './Transaction';
import { Sublist, SublistLine } from './Sublist';
/**
 * Return Authorization Items (item) sublist
 */
export declare class ItemSublist extends SublistLine {
    amount: number;
    description: string;
    istaxable: boolean;
    item: number;
    itemtype: string;
    linenumber: number;
    price: number;
    quantity: number;
    rate: number;
    revrecstartdate: Date;
    revrecenddate: Date;
    taxcode: number;
    taxrate: number;
    units: number;
}
/**
 * Return Authorization Base Type
 */
export declare class ReturnAuthorizationBase extends TransactionBase {
    static recordType: record.Type;
    class: number;
    /**
     * This field shows the transaction this transaction was created from.
     */
    createdfrom: number;
    discountitem: number;
    message: string;
    messagesel: number;
    orderstatus: number;
    tobeemailed: boolean;
    subtotal: number;
    total: number;
    item: Sublist<ItemSublist>;
}
