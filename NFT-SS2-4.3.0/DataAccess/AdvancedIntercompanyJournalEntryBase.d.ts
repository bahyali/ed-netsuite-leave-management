/**
 * NS Base Advanced Intercompany Journal Entry record - contains definitions for fields and sublists
 */
import { NetsuiteRecord } from './Record';
import * as record from 'N/record';
import { Sublist, SublistLine } from './Sublist';
/**
 * 'line' sublist on the Advanced Intercompany Journal Entry Record
 */
export declare class LineSublist extends SublistLine {
    account: number;
    amortizationtype: string;
    class: number;
    credit: number;
    debit: number;
    department: number;
    duetofromsubsidiary: number;
    eliminate: boolean;
    enddate: Date;
    entity: number;
    entitytype: string;
    grossamt: number | string;
    item: number;
    line: number;
    linebasecurrency: number;
    linefxrate: number | string;
    linesubsidiary: number;
    linetotalamt: string | number;
    location: number;
    memo: string;
    residual: string | number;
    /** this field is not in the 2018.1 records browser but does appear in the &xml=t view of the record */
    revenuerecognitionrule: number;
    schedule: number;
    schedulenum: number;
    startdate: Date;
    tax1acct: number;
    tax1amt: number | string;
    taxcode: number;
    taxrate1: number | string;
}
/**
 * Base class for Advanced Intercompany Journal Entry Record
 */
export declare class AdvancedIntercompanyJournalEntryBase extends NetsuiteRecord {
    static recordType: record.Type;
    approved: boolean;
    createddate: Date;
    createdfrom: number;
    credittotal: string | number;
    currency: number;
    customform: number;
    debittotal: string | number;
    entitynexus: number;
    expenseallocjournalcount: string;
    externalid: string;
    isbasecurrecy: boolean;
    iscustomapproval: boolean;
    lastmodifieddate: Date;
    memo: string;
    nexus: number;
    parentexpensealloc: number;
    postingperiod: number;
    reversaldate: Date;
    reversaldefer: boolean;
    status: string;
    subsidiary: number;
    tosubsidiaries: number;
    trandate: Date;
    tranid: string;
    transactionnumber: string;
    line: Sublist<LineSublist>;
}
