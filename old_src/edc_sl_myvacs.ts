/**
 * @NScriptName Suitelet My Vacations (Employee's Vacations Records)
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

    // Employee's Basic Information
    var jobTitle;
    var supervisor;
    // Employee's Balance
    var transferredBalance = 0;
    var annualBalance = 0;
    var replacementBalance = 0;
    var casualBalance = 0;
    var sickBalance = 0;
    var unpaidBalance = 0;
    var totalRegularBalance = 0;

    var currentUser = runtime.getCurrentUser();
    var thisYear = new Date().getFullYear();
    var newVacURL;


    // =========================[ Load the Employee's current vacations balance ]=========================
    var vacBalance = search.create({
        type: 'customrecord_edc_emp_vac_balance',
        filters: [
            search.createFilter({
                name: 'custrecord_edc_vac_balance_emp_name',
                operator: search.Operator.ANYOF,
                values: currentUser.id,
            }),
            search.createFilter({
                name: 'custrecord_edc_vac_balance_year',
                operator: search.Operator.CONTAINS,
                values: thisYear,
            })],
        columns: [
            'custrecord_edc_vac_balance_jobtitle',
            'custrecord_edc_vac_balance_supervisor',
            'custrecord_edc_vac_balance_transferred',
            'custrecord_edc_vac_balance_annual',
            'custrecord_edc_vac_balance_replacement',
            'custrecord_edc_vac_balance_total_regular',
            'custrecord_edc_vac_balance_unpaid',
            'custrecord_edc_vac_balance_casual',
            'custrecord_edc_vac_balance_sick',
            'custrecord_edc_vac_balance_overtime_days'
        ]
    }).run().getRange({ start: 0, end: 1 });


    if (vacBalance[0]) {
        jobTitle = vacBalance[0].getValue('custrecord_edc_vac_balance_jobtitle');
        supervisor = vacBalance[0].getValue('custrecord_edc_vac_balance_supervisor');
        annualBalance = Number(vacBalance[0].getValue('custrecord_edc_vac_balance_annual'));
        transferredBalance = Number(vacBalance[0].getValue('custrecord_edc_vac_balance_transferred'));
        replacementBalance = Number(vacBalance[0].getValue('custrecord_edc_vac_balance_replacement'));
        totalRegularBalance = Number(vacBalance[0].getValue('custrecord_edc_vac_balance_total_regular'));
        casualBalance = Number(vacBalance[0].getValue('custrecord_edc_vac_balance_casual'));
        sickBalance = Number(vacBalance[0].getValue('custrecord_edc_vac_balance_sick'));
        unpaidBalance = Number(vacBalance[0].getValue('custrecord_edc_vac_balance_unpaid'));
    }


    // ================================[ Load the Employee's Vacation Records ]================================
    var vacRecords = search.create({
        type: 'customrecord_edc_vac_request',
        filters: [
            search.createFilter({
                name: 'custrecord_edc_vac_req_emp_name',
                operator: search.Operator.ANYOF,
                values: currentUser.id
            }),
            search.createFilter({
                name: 'custrecord_edc_vac_req_year',
                operator: search.Operator.IS,
                values: thisYear
            })],
        columns: [
            'custrecord_edc_vac_req_type',
            'custrecord_edc_vac_req_start',
            'custrecord_edc_vac_req_end',
            'custrecord_edc_vac_req_leave_days',
            'custrecord_edc_vac_req_leave_partday',
            'custrecord_edc_vac_req_status',
            'custrecord_edc_vac_req_jobtitle',
            'custrecord_edc_vac_req_supervisor'
        ]
    }).run().getRange({ start: 0, end: 365 });

    if (vacRecords[0]) {
        newVacURL = url.resolveRecord({
            recordType: 'customrecord_edc_vac_request',
            recordId: vacRecords[0].id,
        }).split('&id=')[0];

        if (!jobTitle) jobTitle = vacRecords[0].getValue('custrecord_edc_vac_req_jobtitle');
        if (!supervisor) supervisor = vacRecords[0].getValue('custrecord_edc_vac_req_supervisor');
    }




    // =========================[ Creating a Form to contain the desired data ]=========================
    var form = serverWidget.createForm({
        title: 'My Vacations',
    });

    // =================< Adding Field Groups >=================
    var empFldGrp = form.addFieldGroup({
        id: 'custpage_edc_emp_grpfld',
        label: 'My Information'
    });

    var vacBalanceFldGrp = form.addFieldGroup({
        id: 'custpage_edc_balance_grpfld',
        label: 'Remaining Vacations Balance in ' + thisYear
    });



    // ======================< Adding Fields >=======================
    // ------------ Employee's Information Group ------------
    // _________ Employee Name Field _________
    var empFld = form.addField({
        id: 'custpage_edc_emp_fld',
        label: 'Employee',
        type: serverWidget.FieldType.SELECT,
        source: record.Type.EMPLOYEE,
        container: 'custpage_edc_emp_grpfld'
    });
    empFld.updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });
    empFld.defaultValue = currentUser.id;

    // _________ JobTitle Field _________
    var jobTitleFld = form.addField({
        id: 'custpage_edc_jobtitle_fld',
        label: 'Job Title',
        type: serverWidget.FieldType.TEXT,
        container: 'custpage_edc_emp_grpfld'
    });
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
    deptFld.updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });
    deptFld.defaultValue = supervisor;









    // ------------ Vacations Balance Group ------------
    // _________ Annual Vacations Field _________
    var annualFld = form.addField({
        id: 'custpage_edc_annual_fld',
        label: 'Annual Vacations',
        type: serverWidget.FieldType.TEXT,
        container: 'custpage_edc_balance_grpfld'
    });
    annualFld.updateBreakType({ breakType: serverWidget.FieldBreakType.STARTCOL });
    annualFld.updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });
    annualFld.defaultValue = annualBalance;

    // _________ Transferred Vacations Field _________
    var transFld = form.addField({
        id: 'custpage_edc_transferred_fld',
        label: 'Transferred Vacations',
        type: serverWidget.FieldType.TEXT,
        container: 'custpage_edc_balance_grpfld'
    });
    transFld.updateBreakType({ breakType: serverWidget.FieldBreakType.STARTCOL });
    transFld.updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });
    transFld.defaultValue = transferredBalance;

    // _________ Replacement Vacations Field _________
    var replaceFld = form.addField({
        id: 'custpage_edc_replacement_fld',
        label: 'Replacement Vacations',
        type: serverWidget.FieldType.TEXT,
        container: 'custpage_edc_balance_grpfld'
    });
    replaceFld.updateBreakType({ breakType: serverWidget.FieldBreakType.STARTCOL });
    replaceFld.updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });
    replaceFld.defaultValue = replacementBalance;

    // _________ Total Regular Vacations Field _________
    var totalFld = form.addField({
        id: 'custpage_edc_total_fld',
        label: 'Total Regular Vacations',
        type: serverWidget.FieldType.TEXT,
        container: 'custpage_edc_balance_grpfld'
    });
    totalFld.updateBreakType({ breakType: serverWidget.FieldBreakType.STARTCOL });
    totalFld.updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });
    totalFld.defaultValue = totalRegularBalance;



    // _________ Casual Vacations Field _________
    var casualFld = form.addField({
        id: 'custpage_edc_casual_fld',
        label: 'Casual Vacations',
        type: serverWidget.FieldType.INTEGER,
        container: 'custpage_edc_balance_grpfld'
    });
    casualFld.updateBreakType({ breakType: serverWidget.FieldBreakType.STARTCOL });
    casualFld.updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });
    casualFld.defaultValue = casualBalance;

    // _________ Sick Vacations Field _________
    var sickFld = form.addField({
        id: 'custpage_edc_sick_fld',
        label: 'Sick Vacations',
        type: serverWidget.FieldType.INTEGER,
        container: 'custpage_edc_balance_grpfld'
    });
    sickFld.updateBreakType({ breakType: serverWidget.FieldBreakType.STARTCOL });
    sickFld.updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });
    sickFld.defaultValue = sickBalance;

    // _________ Unpaid Vacations Field _________
    var unpaidFld = form.addField({
        id: 'custpage_edc_unpaid_fld',
        label: 'Unpaid Vacations',
        type: serverWidget.FieldType.INTEGER,
        container: 'custpage_edc_balance_grpfld'
    });
    unpaidFld.updateBreakType({ breakType: serverWidget.FieldBreakType.STARTCOL });
    unpaidFld.updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });
    unpaidFld.defaultValue = unpaidBalance;








    // ======================= Add Sublist =======================
    var sublist = form.addSublist({
        id: 'custpage_edc_sublist',
        label: 'Vacation Requests in ' + thisYear,
        type: serverWidget.SublistType.LIST,
    });



    // Add Type Field to the Sublist
    sublist.addField({
        id: 'custpage_edc_sublist_type',
        label: 'Vacation Type',
        type: serverWidget.FieldType.TEXT,
    });

    // Add Start Date Field to the Sublist
    sublist.addField({
        id: 'custpage_edc_sublist_start',
        label: 'Start Date',
        type: serverWidget.FieldType.DATE,
    });

    // Add End Date Field to the Sublist
    sublist.addField({
        id: 'custpage_edc_sublist_end',
        label: 'End Date',
        type: serverWidget.FieldType.DATE,
    });

    // Add Period Field to the Sublist
    sublist.addField({
        id: 'custpage_edc_sublist_period',
        label: 'Leave Period',
        type: serverWidget.FieldType.TEXT,
    });


    // Add Status Field to the Sublist
    sublist.addField({
        id: 'custpage_edc_sublist_status',
        label: 'Approval Status',
        type: serverWidget.FieldType.TEXT,
    });

    // Add View Link Field to the Sublist
    sublist.addField({
        id: 'custpage_edc_sublist_view',
        label: 'View Record',
        type: serverWidget.FieldType.URL,
    });



    // ==================[ Vacations Records List ]==================
    for (var i = 0; i < vacRecords.length; i++) {

        // View URL Link
        sublist.setSublistValue({
            id: 'custpage_edc_sublist_view',
            line: i,
            value: url.resolveRecord({
                recordType: 'customrecord_edc_vac_request',
                recordId: vacRecords[i].id,
            })
        });

        // Leave Period
        var leavePeriod = '';
        var partDayLeave = vacRecords[i].getValue('custrecord_edc_vac_req_leave_partday');
        if (partDayLeave) {
            leavePeriod = partDayLeave + ' Day';
        } else {
            var leaveDays = vacRecords[i].getValue('custrecord_edc_vac_req_leave_days');
            leavePeriod = leaveDays.toString();
            leavePeriod += (Number(leaveDays) > 1) ? ' Days' : ' Day';
        }
        sublist.setSublistValue({
            id: 'custpage_edc_sublist_period',
            line: i,
            value: leavePeriod,
        });

        // Vacation Type
        sublist.setSublistValue({
            id: 'custpage_edc_sublist_type',
            line: i,
            value: vacRecords[i].getText('custrecord_edc_vac_req_type'),
        });

        // Approval Status
        sublist.setSublistValue({
            id: 'custpage_edc_sublist_status',
            line: i,
            value: vacRecords[i].getText('custrecord_edc_vac_req_status'),
        });

        // Start Date
        sublist.setSublistValue({
            id: 'custpage_edc_sublist_start',
            line: i,
            value: vacRecords[i].getValue('custrecord_edc_vac_req_start'),
        });

        // End Date
        sublist.setSublistValue({
            id: 'custpage_edc_sublist_end',
            line: i,
            value: vacRecords[i].getValue('custrecord_edc_vac_req_end'),
        });
    }

    var requestFunction = "window.location.replace('" + newVacURL + "')";

    try {
        form.clientScriptFileId = 2233;
    } catch (error) {

    }

    var requestBtn = form.addButton({
        id: 'custpage_new_request_btn',
        label: 'Request New Vacation',
        functionName: requestFunction,
    });

    if (!newVacURL) {
        requestBtn.isDisabled = true;
    }

    context.response.writePage(form);
}
