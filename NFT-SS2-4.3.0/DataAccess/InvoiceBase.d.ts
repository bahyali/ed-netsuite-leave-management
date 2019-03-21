/**
 * NetSuite generic Transaction record
 */
import { Sublist, SublistLine } from './Sublist';
import * as record from 'N/record';
import { TransactionBase } from './Transaction';
/**
 * The 'item' sublist on invoices
 */
export declare class ItemSublist extends SublistLine {
    account: string;
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
/**
 * NetSuite Invoice Record
 */
export declare class InvoiceBase extends TransactionBase {
    static recordType: record.Type;
    account: number;
    amountpaid: number;
    amountremaining: number;
    approvalstatus: number;
    balance: number;
    billaddr1: string;
    billaddr2: string;
    billaddr3: string;
    billphone: string;
    billstate: string;
    billzip: string;
    billaddress: string;
    currency: number;
    customform: number;
    discountamount: number;
    discountdate: Date;
    duedate: Date;
    fob: string;
    giftcertapplied: number;
    handlingcost: number;
    handlingtaxcode: number;
    istaxable: boolean;
    leadsource: number;
    linkedtrackingnumbers: string;
    promocode: number;
    tobeemailed: boolean;
    tobeprinted: boolean;
    tobefaxed: boolean;
    total: number;
    subtotal: number;
    taxitem: number;
    trackingnumbers: string;
    item: Sublist<ItemSublist>;
}
