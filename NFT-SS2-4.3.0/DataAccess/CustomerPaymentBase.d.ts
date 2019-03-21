/**
 * NetSuite generic Transaction record
 */
import { SublistLine } from './Sublist';
import * as record from 'N/record';
import { TransactionBase } from "./Transaction";
/**
 * Customer Payment Record
 */
export declare class CustomerPaymentBase extends TransactionBase {
    static recordType: record.Type;
    customer: number;
    checknum: string;
    payment: number;
    paymentmethod: number;
    autoapply: boolean;
}
export declare class ApplySublist extends SublistLine {
    amount: number;
    apply: boolean;
    refnum: string;
}
