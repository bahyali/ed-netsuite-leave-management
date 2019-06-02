/**
 * @NScriptName UserEvent - Salary
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */

import {EntryPoints} from "N/types";
import {Salary} from "./Salary";

function beforeLoad(context: EntryPoints.UserEvent.beforeLoadContext) {

    let salary = new Salary().createFromRecord(context.newRecord);
    let salaryRule = salary.relations.salaryRule().first(['internalid']);

    if (salaryRule)
        salary.getField('salary_rule').value = salaryRule.getField('internalid').value;
}

export = {
    beforeLoad: beforeLoad
}