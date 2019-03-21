/**
 * NetSuite Revenue Recognition Plan record. (revenueplan)
 */
/**
 * dummy comment for tsdoc
 */
import { NetsuiteRecord, Sublist, SublistLine } from './EC_nsdal';
import * as record from 'N/record';
export declare class PlannedRevenueSublist extends SublistLine {
    amount: number;
    dateexecuted: Date;
    deferredrevenueaccount: number;
    isrecognized: boolean;
    journal: string;
    percentrecognizedinperiod: string;
    percenttotalrecognized: string;
    plannedperiod: number;
    recognitionaccount: number;
}
/**
 * NetSuite Revenue Recognition Plan record. (revenueplan)
 */
export declare class RevenueRecognitionPlanBase extends NetsuiteRecord {
    static recordType: record.Type;
    amount: number;
    catchupperiod: number;
    comments: string;
    createdfrom: number;
    exchangerate: number;
    holdrevenuerecognition: boolean;
    initialamount: number;
    item: number;
    recognitionperiod: number;
    recordnumber: string;
    remainingdeferredbalance: number;
    revenueplantype: number;
    revenuerecognitionrule: number;
    revrecenddate: Date;
    revrecstartdate: Date;
    status: number;
    terminmonths: number;
    totalrecognized: number;
    plannedrevenue: Sublist<PlannedRevenueSublist>;
}
