/**
 * NFT Quote/Estimate (estimate) Netsuite record type
 */
import { TransactionBase } from './Transaction';
import * as record from 'N/record';
import { Sublist, SublistLine } from './Sublist';
/**
 * Sublist 'item' on the Estimate record
 */
export declare class ItemSublist extends SublistLine {
    item: number;
    quantity: number;
    amount: number;
    rate: number;
}
/**
 * Estimate (Quote)
 */
export declare class EstimateBase extends TransactionBase {
    static recordType: record.Type;
    althandlingcost: number | string;
    altsalestotal: number | string;
    altshippingcost: number | string;
    balance: number | string;
    billaddresslist: number;
    class: number;
    couponcode: number;
    createdfrom: number;
    currency: number;
    currencyname: string;
    currencysymbol: string;
    discountitem: number;
    discountrate: number | string;
    discounttotal: number | string;
    duedate: Date;
    enddate: Date;
    entitynexus: number;
    entitystatus: number;
    forecasttype: number;
    istaxable: boolean;
    job: number;
    leadsource: number;
    message: string;
    messagesel: number;
    opportunity: number;
    partner: number;
    probability: string | number;
    promocode: number;
    salesgroup: number;
    shipdate: Date;
    shipmethod: number;
    shippingtaxcode: number;
    title: string;
    tobeemailed: boolean;
    tobefaxed: boolean;
    tobeprinted: boolean;
    total: string | number;
    totalcostestimate: string | number;
    visibletocustomer: boolean;
    item: Sublist<ItemSublist>;
}
