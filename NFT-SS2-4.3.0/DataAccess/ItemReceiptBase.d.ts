/**
 * Represents an Item Receipt (itemreceipt) transaction type in NetSuite
 */
import * as record from 'N/record';
import { TransactionBase } from './Transaction';
import { Sublist, SublistLine } from './Sublist';
/**
 * Item Receipt Items (item) sublist
 */
export declare class ItemSublist extends SublistLine {
    class: string;
    countryofmanufacture: string;
    item: string;
    itemreceive: boolean;
    line: number;
    lineuniquekey: string;
    location: number;
    onhand: number;
    rate: number;
    revrecenddate: Date;
    quantity: number;
    restock: boolean;
    units: string;
}
/**
 * NetSuite ItemReceipt record class
 */
export declare class ItemReceiptBase extends TransactionBase {
    static recordType: record.Type;
    class: number;
    /**
     * This field shows the purchase order this item receipt is created from.
     */
    createdfrom: number;
    currency: number;
    currencyname: string;
    currencysymbol: string;
    exchangerate: number;
    inboundshipment: number;
    isbasecurrency: boolean;
    itemfulfillment: number;
    landedcostperline: boolean;
    item: Sublist<ItemSublist>;
}
