/**
 * Represents a Customer Refund (customerrefund) transaction type in NetSuite
 */
import * as record from 'N/record';
import { TransactionBase } from './Transaction';
import { Sublist, SublistLine } from './Sublist';
/**
 * The Credits (apply) sublist on Customer Refund transaction
 */
export declare class ApplySublist extends SublistLine {
    amount: number;
    apply: boolean;
    applydate: Date;
    createdfrom: string;
    doc: string;
    due: number;
    duedate: Date;
    internalid: string;
    line: string;
    refnum: string;
    total: number;
    url: string;
}
/**
 * The Customer Refund (customerrefund) transaction in NetSuite
 */
export declare class CustomerRefundBase extends TransactionBase {
    static recordType: record.Type;
    account: number;
    aracct: number;
    ccname: string;
    ccnumber: string;
    chargeit: boolean;
    creditcard: number;
    customer: number;
    paymentmethod: number;
    /**
     * use this in static mode only (e.g. not record mode 'dynamic'
     */
    apply: Sublist<ApplySublist>;
    /**
     * Locates first matching line on the 'apply' sublist that corresponds to the passed related recordid.
     * Returns an object that can be used to manipulate the found line in 'current' (dynamic) mode. The returned
     * value is a subset of the full apply sublist for brevity (exposing the most commonly used properties)
     * Note the customer refund instance must be constructed in dynamic mode and include the { entity: <customer>} default
     * values initializer at construction.
     * @param  docId the internal id of the related document that makes a line appear on the apply sublist
     * e.g. a credit memo on the customer refund
     * calls to nsrecord.setCurrentSublistValue()
     */
    findApplyLine(docId: number): {
        apply: boolean;
        amount: number;
        line: number;
    } | null;
}
