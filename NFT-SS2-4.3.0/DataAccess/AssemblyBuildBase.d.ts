import * as record from 'N/record';
import { NetsuiteRecord } from './Record';
import { Sublist, SublistLine } from './Sublist';
/**
 * the Components (component) sublist on AssemblyBuild records
 */
export declare class ComponentSublist extends SublistLine {
    item: string;
    linenumber: number;
    quantity: number;
    quantityonhand: number;
    unitcost: number;
}
/**
 * NetSuite Assembly Build (assemblybuild) transaction type.
 * Note it does not inherit from our transaction base because it has a differing subset of fields documented in the
 * records browser
 */
export declare class AssemblyBuildBase extends NetsuiteRecord {
    static recordType: record.Type;
    billofmaterials: number;
    billofmaterialsrevision: number;
    buildable: number;
    class: number;
    createddate: Date;
    customform: number;
    department: number;
    externalid: string;
    /**
     * Select the assembly item you want to build. You must create assembly item records first before you can build assembly items.
     */
    item: number;
    lastmodifieddate: Date;
    location: number;
    memo: string;
    postingperiod: number;
    /**
     * Enter the number of assembly items you want to build or unbuild. You cannot build a number higher than the number
     * in the Buildable Quantity (buildable) field. You cannot unbuild a number higher than the number in the Built field.
     */
    quantity: number;
    revision: number;
    revisionmemo: string;
    subsidiary: number;
    trandate: Date;
    tranid: string;
    units: number;
    component: Sublist<ComponentSublist>;
}
