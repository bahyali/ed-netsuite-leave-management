/**
 * Represents an Item Fulfillment (itemfulfillment) transaction type in NetSuite
 */
import * as record from 'N/record';
import { TransactionBase } from './Transaction';
import { Sublist, SublistLine } from './Sublist';
/**
 * Item Fulfillment Items (item) sublist
 */
export declare class ItemSublist extends SublistLine {
    "class": string;
    countryofmanufacture: string;
    item: string;
    itemreceive: boolean;
    location: number;
    onhand: number;
    quantity: number;
    quantityremaining: number;
    units: string;
}
/**
 * Item Fulfillment Base Type
 */
export declare class ItemFulfillmentBase extends TransactionBase {
    static recordType: record.Type;
    /**
     * This field shows the transaction this fulfillment was created from.
     */
    createdfrom: number;
    item: Sublist<ItemSublist>;
}
