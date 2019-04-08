/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

import { EntryPoints } from 'N/types';
import { ExceptionHandler } from '../../Core/ExceptionHandler';


function pageInit(context: EntryPoints.Client.pageInitContext) {
    try{
        throw 'LOL';
    }
    catch(e){
        console.log(e);
        new ExceptionHandler(e).toConsole();
    }
}


function fieldChanged(context: EntryPoints.Client.fieldChangedContext) {
}


export { pageInit, fieldChanged }

