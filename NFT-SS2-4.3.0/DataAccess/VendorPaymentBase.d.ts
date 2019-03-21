/**
 * Vendor Payment base record
 */
import { Sublist, SublistLine } from './Sublist';
import * as record from 'N/record';
import { TransactionBase } from './Transaction';
/**
 * Sublist 'apply' on the Vendor Payment record
 */
export declare class ApplySublist extends SublistLine {
    apply: boolean;
    applydate: Date;
    amount: number;
    createdfrom: number;
    disc: number;
    discamt: number;
    discdate: Date;
    doc: string;
    due: number;
    duedate: Date;
    internalid: string;
    line: number;
    refnum: string;
    total: number;
    url: string;
}
/**
 * NetSuite Vendor Payment Record
 */
export declare class VendorPaymentBase extends TransactionBase {
    static recordType: record.Type;
    account: number;
    apacct: number;
    balance: number;
    billpay: boolean;
    currency: number;
    currencyname: string;
    currencysymbol: string;
    exchangerate: number;
    isbasecurrency: boolean;
    nexus: number;
    printvoucher: boolean;
    toach: boolean;
    tobeemailed: boolean;
    tobeprinted: boolean;
    total: number;
    transactionnumber: string;
    unapplied: number;
    apply: Sublist<ApplySublist>;
}
