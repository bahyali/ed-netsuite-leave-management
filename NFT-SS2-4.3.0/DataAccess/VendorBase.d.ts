import { Entity } from './Entity';
import * as record from 'N/record';
/**
 * VendorBase
 */
export declare class VendorBase extends Entity {
    static recordType: record.Type;
    bcn: string;
    creditlimit: number;
    emailtransactions: boolean;
    expenseaccount: number;
    faxtransactions: boolean;
    giveaccess: boolean;
    incoterm: number;
    is1099eligible: boolean;
    isjobresourcevend: boolean;
    laborcost: number;
    openingbalance: number;
    openingbalanceaccount: number;
    openingbalancedate: Date;
    payablesaccount: number;
    purchaseorderamount: number;
    purchaseorderquantity: number;
    purchaseorderquantitydiff: number;
    receiptamount: number;
    receiptquantity: number;
    receiptquantitydiff: number;
    representingsubsidiary: number;
    sendemail: boolean;
    taxfractionunit: number;
    taxidnum: string;
    vatregnumber: string;
    workcalendar: number;
}
