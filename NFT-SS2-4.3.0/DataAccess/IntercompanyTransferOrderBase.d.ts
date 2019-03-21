/**
 *  Represents an Intercompany Transfer Order (intercompanytransferorder) transaction type in NetSuite
 */
import * as record from 'N/record';
import * as to from "./TransferOrderBase";
/**
 * NetSuite Intercompany Transfer Order Record
 * Primary difference between this an a regular Transfer order is a TO destination subsidiary.
 */
export declare class IntercompanyTransferOrderBase extends to.TransferOrderBase {
    static recordType: record.Type;
    tosubsidiary: number;
}
/**
 * Sublist 'item' on the Intercompany Tranfer Order record (same as on regular Transfer Order)
 */
export declare class ItemSublist extends to.ItemSublist {
}
