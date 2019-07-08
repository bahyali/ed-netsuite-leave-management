/**
 * @NScriptName UserEvent - Salary Rule
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */

import {EntryPoints} from "N/types";
import {Salary} from "../Salary/Salary";

function beforeLoad(context: EntryPoints.UserEvent.beforeLoadContext) {
    // Create Only
    if (context.type !== context.UserEventType.CREATE)
        return;


}

export = {
    beforeLoad: beforeLoad
}