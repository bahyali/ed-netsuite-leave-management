/**
 * NS Base jounral entry record - contains definitions for fields and sublists
 */
import { NetsuiteRecord } from './Record';
import * as record from 'N/record';
import { Sublist, SublistLine } from './Sublist';
/**
 * 'line' sublist on the standard Journal Entry Record
 */
export declare class LineSublist extends SublistLine {
    account: number;
    amortizationtype: string;
    credit: number;
    credittax: number;
    debit: number;
    debittax: number;
    department: number;
    eliminate: boolean;
    enddate: Date;
    entity: number;
    entitytype: string;
    grossamt: number | string;
    item: number;
    line: number;
    linetaxcode: number;
    linetaxrate: string | number;
    location: number;
    memo: string;
    revenuerecognitionrule: number;
    schedule: number;
    schedulenum: number;
    startdate: Date;
    tax1acct: number;
    tax1amt: number | string;
    taxaccount: number;
    taxbasis: string | number;
    taxcode: number;
    taxrate1: number | string;
    totalamount: number;
}
/**
 * Base class for Journal Entry Record
 */
export declare class JournalEntryBase extends NetsuiteRecord {
    static recordType: record.Type;
    accountingbook: number;
    approvalstatus: number;
    approved: boolean;
    class: number;
    createddate: Date;
    createdfrom: number;
    credittotal: string | number;
    currency: number;
    customform: number;
    debittotal: string | number;
    department: number;
    entitynexus: number;
    exchangerate: number;
    externalid: string;
    isbasecurrecy: boolean;
    lastmodifieddate: Date;
    memo: string;
    nextapprover: number;
    nexus: number;
    parentexpensealloc: number;
    postingperiod: number;
    reversaldate: Date;
    reversaldefer: boolean;
    subsidiarytaxregnum: number;
    subsidiary: number;
    tosubsidiary: number;
    trandate: Date;
    tranid: string;
    line: Sublist<LineSublist>;
}
