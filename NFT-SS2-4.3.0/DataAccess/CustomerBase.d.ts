/**
 * NS Base customer record - contains definitions for most of the built in fields
 */
import { NetsuiteRecord } from './Record';
import * as record from 'N/record';
import { Sublist, SublistLine } from './Sublist';
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
/**
 * The address _sublist_ on customer records, not to be confused with the Address _subrecord_.
 * Customer address info is split between this sublist and the subrecord pointed to by the _addressbook_ field.
 */
declare class AddressSublist extends SublistLine {
    /**
     * Address subrecord
     */
    readonly addressbookaddress: AddressBase;
    attention: string;
    defaultbilling: boolean;
    defaultshipping: boolean;
    displaystate: string;
    dropdownstate: number;
    id: number;
    internalid: number;
    isresidential: boolean;
    label: string;
    override: boolean;
    phone: string;
    state: string;
    zip: string;
}
export declare class CustomerBase extends NetsuiteRecord {
    static recordType: record.Type;
    accountnumber: string;
    category: number;
    comments: string;
    companyname: string;
    currency: number;
    customform: number;
    datecreated: Date;
    email: string;
    entityid: string;
    entitystatus: number;
    externalid: string;
    fax: string;
    firstname: string;
    isinactive: boolean;
    isperson: boolean;
    lastmodifieddate: Date;
    language: number;
    lastname: string;
    parent: number;
    phone: string;
    salesrep: number;
    subsidiary: number;
    taxable: boolean;
    taxitem: number;
    terms: number;
    addressbook: Sublist<AddressSublist>;
}
export declare class ContactsSublist extends SublistLine {
    contact: number;
    email: string;
    giveaccess: boolean;
    passwordconfirm: boolean;
    role: number;
    sendemail: boolean;
    /**
     * Password strength
     */
    strength: string;
}
export {};
