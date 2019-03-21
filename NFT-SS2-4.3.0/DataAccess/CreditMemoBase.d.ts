/**
 * Created by shawn on 4/15/16.
 */
import * as record from 'N/record';
import { TransactionBase } from './Transaction';
import { SublistLine } from './Sublist';
export declare class CreditMemoBase extends TransactionBase {
    static recordType: record.Type;
    account: number;
    amountpaid: number;
    amountremaining: number;
    applied: number;
    autoapply: boolean;
    balance: number;
    class: number;
    currency: number;
    subtotal: number;
    total: number;
    unapplied: number;
}
export declare class ItemSublist extends SublistLine {
    revrecstartdate: Date;
    revrecenddate: Date;
    item: number;
    amount: number;
    quantity: number;
    rate: number;
    taxcode: number;
    taxrate1: number;
    autoapply: boolean;
}
export declare class ApplySublist extends SublistLine {
    amount: number;
    apply: boolean;
    createdfrom: number;
    refnum: string;
}
