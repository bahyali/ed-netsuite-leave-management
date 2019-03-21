/**
 * Represents a Bin Transfer (bintransfer) record type in NetSuite
 */
import { NetsuiteRecord } from './Record';
import * as record from 'N/record';
import { Sublist, SublistLine } from './Sublist';
/**
 * represents the Adjustments sublist on Bin Transfer records
 */
export declare class AdjustmentsSublistLine extends SublistLine {
    description: string;
    item: number;
    itemunitslabel: string;
    line: string;
    preferredbin: string;
    quantity: number;
}
/**
 * NetSuite Bin Transfer record
 */
export declare class BinTransferBase extends NetsuiteRecord {
    static recordType: record.Type;
    createddate: Date;
    externalid: string;
    lastmodifieddate: Date;
    location: number;
    memo: string;
    subsidiary: number;
    total: number;
    trandate: Date;
    inventory: Sublist<AdjustmentsSublistLine>;
}
