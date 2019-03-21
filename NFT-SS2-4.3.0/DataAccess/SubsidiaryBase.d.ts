/**
 * NS Base subsidiary record - contains definitions built in fields
 */
import { NetsuiteRecord } from './Record';
import * as record from 'N/record';
import { SublistLine } from './Sublist';
export declare class SubsidiaryBase extends NetsuiteRecord {
    static recordType: record.Type;
    addr1: string;
    addr2: string;
    addr3: string;
    currency: number;
    email: string;
    externalid: string;
    fax: string;
    iselimination: boolean;
    isinactive: boolean;
    legalname: string;
    logo: number;
    name: string;
    override: boolean;
    parent: number;
}
/**
 * The addressbook 'subrecord'. In SS2.0 this is mostly treated as a normal record object.
 * However I caution against trying to create new instances of it, only passing an existing record
 * to the constructor. For example, on the customer record you can get an address sublist record
 * with Record.getSublistSubrecord() then pass the returned record to the Address constructor.
 * Currently this has only been tested for read access to aqddress properties defined below.
 */
export declare class AddressBase extends NetsuiteRecord {
    addr1: string;
    addr2: string;
    addr3: string;
    addressee: string;
    /**
     * note this field name differs from the 'records browser' documentation
     */
    addrphone: string;
    addrtext: string;
    attention: string;
    city: string;
    country: number;
    state: string;
    zip: string;
    override: boolean;
}
export declare class AccountBookDetail extends SublistLine {
    accountingbook: number;
    currency: number;
}
