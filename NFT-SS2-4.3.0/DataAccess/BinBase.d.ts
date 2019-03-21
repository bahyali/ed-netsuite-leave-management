/**
 * Represents an Bin record in NetSuite
 */
import { NetsuiteRecord } from './Record';
import * as record from 'N/record';
/**
 * Bin Base Type (bin)
 */
export declare class BinBase extends NetsuiteRecord {
    static recordType: record.Type;
    binnumber: string;
    externalid: string;
    isinactive: boolean;
    location: number;
    memo: string;
}
