/**
 * @NScriptName Suitelet My missions (Employee's missions Records)
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

import { EntryPoints } from 'N/types';
import search = require('N/search');
import record = require('N/record');
import runtime = require('N/runtime');
import serverWidget = require('N/ui/serverWidget');
import redirect = require('N/redirect');
import url = require('N/url');


export function onRequest(context: EntryPoints.Suitelet.onRequestContext) {

    // Employee's My Information
    var jobTitle;
    var supervisor;

    var currentUser = runtime.getCurrentUser();
    var thisYear = new Date().getFullYear();
    var newReqURL;


    // ================================[ Load Employee's missions Records ]================================
    var records = search.create({
        type: 'customrecord_edc_missions',
        filters: [
            search.createFilter({
                name: 'custrecord_edc_mission_emp',
                operator: search.Operator.ANYOF,
                values: currentUser.id
            }),
            search.createFilter({
                name: 'custrecord_edc_mission_year',
                operator: search.Operator.CONTAINS,
                values: thisYear
            })],
        columns: [
            'custrecord_edc_mission_jobtitle',
            'custrecord_edc_mission_supervisor',
            'custrecord_edc_mission_period',
            'custrecord_edc_mission_type',
            'custrecord_edc_mission_date',
        ]
    }).run().getRange({ start: 0, end: 365 });

    if (records[0]) {
        jobTitle = records[0].getValue('custrecord_edc_mission_jobtitle');
        supervisor = records[0].getValue('custrecord_edc_mission_supervisor');

        newReqURL = url.resolveRecord({
            recordType: 'customrecord_edc_missions',
            recordId: records[0].id,
        }).split('&id=')[0];
    }




    // =========================[ Creating a Form to contain the desired data ]=========================
    var form = serverWidget.createForm({
        title: 'My Missions',
    });

    // =================< Adding Field Groups >=================
    var empFldGrp = form.addFieldGroup({
        id: 'custpage_edc_emp_grpfld',
        label: 'My Information'
    });


    // ======================< Adding Fields >=======================
    // ------------ Employee's Information Group ------------
    // _________ Year Field _________
    // var yearFld = form.addField({
    //     id: 'custpage_edc_year_fld',
    //     label: 'Year',
    //     type: serverWidget.FieldType.TEXT,
    //     container: 'custpage_edc_emp_grpfld'
    // });
    // yearFld.updateBreakType({ breakType: serverWidget.FieldBreakType.STARTCOL });
    // yearFld.updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });
    // yearFld.defaultValue = thisYear.toString();

    // _________ Employee Name Field _________
    var empFld = form.addField({
        id: 'custpage_edc_emp_fld',
        label: 'Employee',
        type: serverWidget.FieldType.SELECT,
        source: record.Type.EMPLOYEE,
        container: 'custpage_edc_emp_grpfld'
    });
    empFld.updateBreakType({ breakType: serverWidget.FieldBreakType.STARTCOL });
    empFld.updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });
    empFld.defaultValue = currentUser.id;

    // _________ JobTitle Field _________
    var jobTitleFld = form.addField({
        id: 'custpage_edc_jobtitle_fld',
        label: 'Job Title',
        type: serverWidget.FieldType.TEXT,
        container: 'custpage_edc_emp_grpfld'
    });
    jobTitleFld.updateBreakType({ breakType: serverWidget.FieldBreakType.STARTCOL });
    jobTitleFld.updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });
    jobTitleFld.defaultValue = jobTitle;

    // _________ Subsidiary Field _________
    var subsidiaryFld = form.addField({
        id: 'custpage_edc_subsidiary_fld',
        label: 'Subsidiary',
        type: serverWidget.FieldType.SELECT,
        source: record.Type.SUBSIDIARY,
        container: 'custpage_edc_emp_grpfld'
    });
    subsidiaryFld.updateBreakType({ breakType: serverWidget.FieldBreakType.STARTCOL });
    subsidiaryFld.updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });
    subsidiaryFld.defaultValue = currentUser.subsidiary;

    // _________ Department Field _________
    var deptFld = form.addField({
        id: 'custpage_edc_department_fld',
        label: 'Department',
        type: serverWidget.FieldType.SELECT,
        source: record.Type.DEPARTMENT,
        container: 'custpage_edc_emp_grpfld'
    });
    deptFld.updateBreakType({ breakType: serverWidget.FieldBreakType.STARTCOL });
    deptFld.updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });
    deptFld.defaultValue = currentUser.department;


    // _________ Supervisor Field _________
    var deptFld = form.addField({
        id: 'custpage_edc_supervisor_fld',
        label: 'Supervisor',
        type: serverWidget.FieldType.SELECT,
        source: record.Type.EMPLOYEE,
        container: 'custpage_edc_emp_grpfld'
    });
    deptFld.updateBreakType({ breakType: serverWidget.FieldBreakType.STARTCOL });
    deptFld.updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });
    deptFld.defaultValue = supervisor;


    // ======================= Add Sublist =======================
    var sublist = form.addSublist({
        id: 'custpage_edc_sublist',
        label: 'Missions in ' + thisYear,
        type: serverWidget.SublistType.LIST,
    });



    // Add Date Field to the Sublist
    sublist.addField({
        id: 'custpage_edc_sublist_date',
        label: 'Date',
        type: serverWidget.FieldType.DATE,
    });

    // Add Period Field to the Sublist
    sublist.addField({
        id: 'custpage_edc_sublist_period',
        label: 'Period',
        type: serverWidget.FieldType.TEXT,
    });

    // Add Type Field to the Sublist
    sublist.addField({
        id: 'custpage_edc_sublist_type',
        label: 'Type',
        type: serverWidget.FieldType.TEXT,
    });

    // Add View Link Field to the Sublist
    sublist.addField({
        id: 'custpage_edc_sublist_view',
        label: 'View Record',
        type: serverWidget.FieldType.URL,
    });


    
    // ==================[ Records List ]==================
    for (var i = 0; i < records.length; i++) {

        sublist.setSublistValue({
            id: 'custpage_edc_sublist_view',
            line: i,
            value: url.resolveRecord({
                recordType: 'customrecord_edc_missions',
                recordId: records[i].id,
            })
        });

        sublist.setSublistValue({
            id: 'custpage_edc_sublist_type',
            line: i,
            value: records[i].getText('custrecord_edc_mission_type'),
        });

        sublist.setSublistValue({
            id: 'custpage_edc_sublist_date',
            line: i,
            value: records[i].getValue('custrecord_edc_mission_date'),
        });

        sublist.setSublistValue({
            id: 'custpage_edc_sublist_period',
            line: i,
            value: records[i].getText('custrecord_edc_mission_period') + ' Day',
        });

        sublist.setSublistValue({
            id: 'custpage_edc_sublist_status',
            line: i,
            value: records[i].getText('custrecord_edc_mission_status'),
        });
    }

    var requestFunction = "window.location.replace('" + newReqURL + "')";

    try {
        form.clientScriptFileId = 2233;
    } catch (error) {

    }

    var requestBtn = form.addButton({
        id: 'custpage_new_request_btn',
        label: 'New Mission',
        functionName: requestFunction,
    });

    if (!newReqURL) {
        requestBtn.isDisabled = true;
    }


    context.response.writePage(form);
}