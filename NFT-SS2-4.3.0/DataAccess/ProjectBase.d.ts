/**
 * Represents an Item Fulfillment (itemfulfillment) transaction type in NetSuite
 */
import { NetsuiteRecord } from './Record';
import * as record from 'N/record';
import { Sublist, SublistLine } from './Sublist';
/**
 * Project resource sublist
 */
export declare class JobResourcesSublist extends SublistLine {
    defaultcost: number;
    email: string;
    jobresource: number;
    overridencost: number;
    role: number;
}
/**
 * Project (job) base type
 */
export declare class ProjectBase extends NetsuiteRecord {
    static recordType: record.Type;
    allowtime: boolean;
    allowexpenses: boolean;
    accountnumber: string;
    actualtime: string;
    allowallresourcesfortasks: boolean;
    applyprojectexpensetypetoall: boolean;
    autoname: boolean;
    bbudgetshowcalculatedlines: boolean;
    bbudgetusecalculatedvalues: boolean;
    billingschedule: number;
    calculatedenddate: Date;
    calculatedenddatebaseline: Date;
    category: number;
    cbudgetshowcalculatedlines: boolean;
    cbudgetusecalculatedvalues: boolean;
    comments: string;
    companyname: string;
    contact: number;
    currency: number;
    customform: number;
    datecreated: Date;
    enddate: Date;
    entityid: string;
    entitystatus: number;
    estimatedcost: number;
    estimatedgrossprofit: number;
    estimatedgrossprofitpercent: string;
    estimatedlaborcost: number;
    estimatedlaborcostbaseline: number;
    estimatedlaborrevenue: number;
    estimatedrevenue: number;
    estimatedtime: string;
    estimatedtimeoverride: string;
    estimatedtimeoverridebaseline: string;
    estimaterevrectemplate: number;
    externalid: string;
    fxrate: string;
    includecrmtasksintotals: boolean;
    isbasecurrency: boolean;
    isexempttime: boolean;
    isinactive: boolean;
    isjob: boolean;
    isproductivetime: boolean;
    isutilizedtime: boolean;
    jobbillingtype: number;
    jobitem: number;
    jobprice: number;
    jobtype: number;
    language: number;
    lastbaselinedate: Date;
    lastmodifieddate: Date;
    limittimetoassignees: boolean;
    materializetime: boolean;
    otherrelationships: number;
    parent: number;
    percentcomplete: string;
    percenttimecomplete: string;
    projectedenddate: Date;
    projectedenddatebaseline: Date;
    projectexpensetype: number;
    stage: string;
    startdate: Date;
    startdatebaseline: Date;
    subsidiary: number;
    timeapproval: number;
    timeremaining: number;
    jobresources: Sublist<JobResourcesSublist>;
}
