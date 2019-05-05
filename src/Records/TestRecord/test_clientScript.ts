/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

import {EntryPoints} from 'N/types';
import * as runtime from 'N/runtime';
import {TestRecord} from "./TestRecord";

let leave = 1;

export function pageInit(context: EntryPoints.Client.pageInitContext) {
    new TestRecord();
    leave++;
    return runtime.accountId;
}
