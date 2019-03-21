/**
 * @NScriptType ClientScript
 * @NApiVersion 2.0
 * @NScriptName ClientScript Test_Gulp
 * @NModuleScope SameAccount
 */


import { EntryPoints } from 'N/types';
import * as log from 'N/log';

import runtime = require('N/runtime');
import search = require('N/search');

//Shared Variables

export function pageInit(context: EntryPoints.Client.pageInitContext) {
    var currentUser = runtime.getCurrentUser();
    alert(`Hello ${currentUser.name}`);


    log.error('lklk', 'kjkjkjk');
    
    runtime.getCurrentUser();

    context.currentRecord.getField({fieldId: ''}).isMandatory = true;
}

export function validate (context: EntryPoints.Client.validateFieldContext){

    log.audit('remaing usage', runtime.getCurrentScript().getRemainingUsage());
    debugger;
}

