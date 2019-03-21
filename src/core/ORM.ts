/**
 * 
 * TEST FILE ...........................
 */

import { ExceptionHandler } from "./ExceptionHandler";


var err = 'Error in anything'

new ExceptionHandler(err).alert().sendEmail();



import * as search from "N/search";

var sd = search.lookupFields.promise({
    id: '',
    columns: [''],
    type: ''
}).catch(err => {
    ExceptionHandler
});

var ss = search.create({
    columns: [],
    filters: [],
    type: ''
}).run().each(() => {
    return false;
});

import * as record from 'N/record';

record.create.promise