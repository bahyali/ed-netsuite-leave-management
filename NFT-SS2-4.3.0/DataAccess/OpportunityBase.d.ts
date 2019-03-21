/**
 * NetSuite opportunity transaction record
 */
import { SublistLine, Sublist } from './Sublist';
import * as record from 'N/record';
import { TransactionBase } from "./Transaction";
/**
 * The 'item' sublist on opportunity records
 */
export declare class ItemSublist extends SublistLine {
    amount: number;
    description: string;
    istaxable: boolean;
    item: number;
    linenumber: number;
    price: number;
    quantity: number;
    rate: number;
    taxcode: number;
    taxrate1: number;
    units: number;
}
/**
 * NetSuite Opportunity Record
 */
export declare class OpportunityBase extends TransactionBase {
    static recordType: record.Type;
    balance: number;
    billaddr1: string;
    billaddr2: string;
    billaddr3: string;
    billphone: string;
    billstate: string;
    billzip: string;
    billaddress: string;
    currency: number;
    entitystatus: number;
    leadsource: number;
    partner: number;
    total: number;
    item: Sublist<ItemSublist>;
}
