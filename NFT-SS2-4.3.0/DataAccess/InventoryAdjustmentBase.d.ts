/**
 * NetSuite generic Transaction record
 */
import { SublistLine } from './Sublist';
import * as record from 'N/record';
import { TransactionBase } from './Transaction';
/**
 * NetSuite Inventory Adjustment Record
 */
export declare class InventoryAdjustmentBase extends TransactionBase {
    static recordType: record.Type;
    account: number;
    adjlocation: number;
    "class": number;
    createddate: Date;
    customer: number;
    estimatedtotalvalue: number;
}
/**
 * Sublist 'inventory' on the Inventory Adjustment record.
 */
export declare class InventorySublist extends SublistLine {
    adjustqtyby: number;
    "class": number;
    costingmethod: string;
    currency: string;
    currentvalue: string;
    department: string;
    description: string;
    item: number;
    location: number;
    newquantity: number;
    quantityonhand: number;
    unitcost: number;
    units: number;
}
