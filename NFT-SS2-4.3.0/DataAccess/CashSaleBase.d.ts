/**
 * NetSuite cash sale Transaction record
 */
import { SublistLine } from './Sublist';
import * as record from 'N/record';
import { TransactionBase } from './Transaction';
/**
 * NetSuite Cashsale Record
 */
export declare class CashSaleBase extends TransactionBase {
    static recordType: record.Type;
    account: number;
    billaddr1: string;
    billaddr2: string;
    billaddr3: string;
    billphone: string;
    billstate: string;
    billzip: string;
    billaddress: string;
    createdfrom: number;
    currency: number;
    discounttotal: number;
    fob: string;
    giftcertapplied: number;
    handlingcost: number;
    handlingtaxcode: number;
    istaxable: boolean;
    leadsource: number;
    linkedtrackingnumbers: string;
    partner: number;
    paymentmethod: number;
    promocode: number;
    subtotal: number;
    taxitem: number;
    tobeemailed: boolean;
    tobefaxed: boolean;
    tobeprinted: boolean;
    trackingnumbers: string;
    total: number;
}
/**
 * The 'item' sublist on invoices
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
    revrecstartdate: Date;
    revrecenddate: Date;
    taxcode: number;
    taxrate1: number;
    units: number;
}
