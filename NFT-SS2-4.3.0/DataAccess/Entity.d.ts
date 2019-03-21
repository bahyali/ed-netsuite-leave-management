/**
 dummy comment for TypeDoc
 */
import { NetsuiteRecord } from './Record';
/**
 * NetSuite generic Entity used as a common base class for 'entity-like' records,
 * This is meant to be inherited by concrete record types to avoid duplicating effort on fields.
 * Note that this inheritance hierarchy emerged empirically - it's not documented by NetSuite.
 *
 * It contains fields common to all 'entity' records in NS
 */
export declare abstract class Entity extends NetsuiteRecord {
    accountnumber: string;
    altemail: string;
    altphone: string;
    balance: number;
    billpay: boolean;
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
    subsidiary: number;
    taxitem: number;
    terms: number;
}
