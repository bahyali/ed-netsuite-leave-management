/**
 * Represents an Project Task record in NetSuite
 */
import { NetsuiteRecord } from './Record';
import * as record from 'N/record';
import { Sublist, SublistLine } from './Sublist';
/**
 * Project task resource assignment ( ) sublist
 */
export declare class AssigneeSublist extends SublistLine {
    billingclass: number;
    cost: number;
    estimatedwork: number;
    price: number;
    resource: number;
    serviceitem: number;
    unitcost: number;
    unitprice: number;
    units: string;
}
/**
 * Project Task Base class
 */
export declare class ProjectTaskBase extends NetsuiteRecord {
    static recordType: record.Type;
    actualwork: number;
    bbudgetshowcalculatedlines: boolean;
    bbudgetusecalculatedvalues: boolean;
    cbudgetshowcalculatedlines: boolean;
    cbudgetusecalculatedvalues: boolean;
    company: number;
    constrainttype: number;
    contact: number;
    customform: number;
    enddate: Date;
    enddatebaseline: Date;
    estimatedwork: number;
    estimatedworkbaseline: number;
    eventid: number;
    externalid: string;
    finishbydate: Date;
    fxrate: string;
    ismilestone: boolean;
    isoncriticalpath: boolean;
    lateend: Date;
    latestart: Date;
    message: string;
    nonbillabletask: boolean;
    order: number;
    owner: number;
    parent: number;
    percenttimecomplete: string;
    priority: number;
    remainingwork: number | string;
    slackminutes: number | string;
    startdate: Date;
    startdatebaseline: Date;
    starttime: string;
    status: number;
    title: string;
    assignee: Sublist<AssigneeSublist>;
}
