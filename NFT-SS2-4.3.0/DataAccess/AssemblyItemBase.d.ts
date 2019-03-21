import * as record from 'N/record';
import { NetsuiteRecord } from './Record';
import { Sublist, SublistLine } from './Sublist';
/**
 * the Members (member) sublist on AssemblyItem (assemblyitem) records
 */
export declare class MemberSublist extends SublistLine {
    effectivedate: Date;
    effectiverevision: number;
    memberdescr: string;
    item: number;
    linenumber: number;
    memberunit: string;
    quantity: number;
    taxschedule: number;
    weight: string;
}
/**
 * NetSuite Build/Assembly Item (assemblyitem) item type.
 */
export declare class AssemblyItemBase extends NetsuiteRecord {
    static recordType: record.Type;
    assetaccount: number;
    averagecost: number;
    billingschedule: number;
    billpricevariantacct: number;
    buildentireassembly: boolean;
    buildtime: number;
    class: number;
    cogsaccount: number;
    copydescription: boolean;
    cost: number;
    costcategory: number;
    costingmethod: number;
    countryofmanufacture: number;
    createddate: Date;
    customform: number;
    deferredrevenueaccount: number;
    deferrevrec: boolean;
    department: number;
    description: string;
    displayname: string;
    externalid: string;
    includechildren: boolean;
    incomeaccount: number;
    isdonationitem: boolean;
    isdropshipitem: boolean;
    isgcocompliant: boolean;
    isinactive: boolean;
    isonline: boolean;
    isphantom: boolean;
    isspecialorderitem: boolean;
    isspecialworkorderitem: boolean;
    isstorepickupallowed: boolean;
    itemcondition: number;
    itemid: string;
    itemoptions: number;
    itemtype: string;
    lastmodifieddate: Date;
    location: number;
    parent: number;
    revrecschedule: number;
    subsidiary: number;
    upccode: string;
    tranid: string;
    units: number;
    usebins: boolean;
    weight: number;
    weightunit: number;
    member: Sublist<MemberSublist>;
}
