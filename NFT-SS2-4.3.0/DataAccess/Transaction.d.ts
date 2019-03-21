/**
 * NetSuite generic Transaction record
 */
import { NetsuiteRecord } from './Record';
/**
 * Fields common to all transactions in NS
 */
export declare abstract class TransactionBase extends NetsuiteRecord {
    customform: number;
    department: number;
    email: string;
    entity: number;
    externalid: string;
    lastmodifieddate: Date;
    location: number;
    memo: string;
    otherrefnum: string;
    postingperiod: number;
    salesrep: number;
    /**
     * Note unlike other identifiers in NetSuite, this one is a string (e.g. 'Partially Fulfilled')
     */
    status: string;
    /**
     * Note unlike other references in NetSuite, this one is a set of undocumented string keys (e.g. 'partiallyFulfilled')
     * The possible statusref values differ for each transaction type
     */
    statusRef: string;
    subsidiary: number;
    tranid: string;
    trandate: Date;
    /**
     * locates line on the 'apply' sublist that corresponds to the passed related record internal id
     * expose this method in derived classes that need dynamic access to the apply sublist
     * returns undefined
     */
    protected findApplyLine(docId: number): {
        apply: boolean;
        amount: number;
        line: number;
    } | null;
}
