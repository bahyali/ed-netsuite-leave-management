/**
 * @NScriptName ClientScript Missions
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

import { EntryPoints } from 'N/types';
import runtime = require('N/runtime');
import search = require('N/search');
import record = require('N/record');
import serverWidget = require('N/ui/serverWidget');
import redirect = require('N/redirect');
import { request } from '@hitc/netsuite-types/N/http';


//Shared Variables
var currentUser = runtime.getCurrentUser();
var isEdited;

export function pageInit(context: EntryPoints.Client.pageInitContext) {
    try {
        // // Add (Day) word beside the period
        // var periodFld = document.getElementById('custrecord_edc_mission_period_fs').innerHTML;
        // periodFld += '<div> Days </div>'

        var empId = currentUser.id;
        var missionReq = context.currentRecord;
        var thisYear = new Date().getFullYear();
        var supervisor = missionReq.getValue('custrecord_edc_mission_supervisor');

        if (context.mode == 'create') {
            missionReq.setValue('custrecord_edc_mission_year', thisYear);
            
            // Giving the Administrator ONLY the role to change the Employee        // 3 = Administrator Role
            if (currentUser.roleCenter != 'EMPLOYEE') {
                // Getting current Record ID from the current URL
                var recordId = Number(document.URL.split('rectype=')[1].split('&')[0]);
                var rolesSearch = search.create({
                    type: 'customrecord_edc_roles_management',
                    filters: [search.createFilter({
                        name: 'custrecord_edc_role_mng_record_type',
                        operator: search.Operator.ANYOF,
                        values: recordId,
                    })],
                    columns: ['custrecord_edc_role_mng_roles_list']
                }).run().getRange({ start: 0, end: 1 });

                var accessRoles = [3];             // 3 = Administrator Role
                if (rolesSearch[0]) {
                    accessRoles = rolesSearch[0].getValue('custrecord_edc_role_mng_roles_list').toString().split(',');
                }

                for (var i = 0; i < accessRoles.length; i++) {
                    if (currentUser.role == 3 || currentUser.role == accessRoles[i]) {
                        missionReq.getField({ fieldId: 'custrecord_edc_mission_emp' }).isDisabled = false;

                        var employee = search.lookupFields({
                            type: search.Type.EMPLOYEE,
                            id: empId.toString(),
                            columns: ['title']  // title = JobTitle
                        });
                        missionReq.setValue('custrecord_edc_mission_jobtitle', employee.title);
                        break;
                    }
                }
            }

        } else if (context.mode = 'edit') {

            missionReq.getField({ fieldId: 'custrecord_edc_mission_emp' }).isDisabled = true;
            missionReq.getField({ fieldId: 'custrecord_edc_mission_date' }).isDisabled = true;
            missionReq.getField({ fieldId: 'custrecord_edc_mission_type' }).isDisabled = true;
            missionReq.getField({ fieldId: 'custrecord_edc_mission_period' }).isDisabled = true;
            alert('Past missions cannot be edited');
            isEdited = true;
            return;
        }
    } catch (err) {
        alert('Something went wrong,\nPlease contact your system administrator');
        var ex = err.toJSON();
        var errorMsg = 'Error: ' + ex.name + '\n' + 'Message: ' + ex.message + '\n' +
            'Script ID: ' + runtime.getCurrentScript().id + '\n' + 'Deployment ID: ' + runtime.getCurrentScript().deploymentId;
        log.error(ex.name, errorMsg);
    }
}




export function fieldChanged(context: EntryPoints.Client.fieldChangedContext) {
    try {
        var missionReq = context.currentRecord;
        // When Choosing/Changing the Employee
        if (context.fieldId == 'custrecord_edc_mission_emp') {
            // Getting the selected Employee  
            var empId = missionReq.getValue('custrecord_edc_mission_emp');

            // Setting the Employee's Basic Data
            var thisEmployee = search.lookupFields({
                type: search.Type.EMPLOYEE,
                id: empId.toString(),
                columns: ['title', 'subsidiary', 'supervisor', 'department']
            });

            var jobTitle = thisEmployee.title;
            var subsidiary = (thisEmployee.subsidiary.length) ? thisEmployee.subsidiary[0].value : '';
            var supervisor = (thisEmployee.supervisor.length) ? thisEmployee.supervisor[0].value : '';
            var department = (thisEmployee.department.length) ? thisEmployee.department[0].value : '';

            missionReq.setValue('custrecord_edc_mission_jobtitle', jobTitle);
            missionReq.setValue('custrecord_edc_mission_subsidiary', subsidiary);
            missionReq.setValue('custrecord_edc_mission_department', department);
            missionReq.setValue('custrecord_edc_mission_supervisor', supervisor);
        }
        if (context.fieldId == 'custrecord_edc_mission_date') {

            var missionReq = context.currentRecord;
            var missionDate = new Date(missionReq.getValue('custrecord_edc_mission_date').toString());
            var requestDate = new Date(missionReq.getValue('custrecord_edc_mission_request_date').toString());

            if (requestDate > missionDate) {
                alert('You cannot request a mission in the past!');
                missionReq.setValue('custrecord_edc_mission_date', '');
            }
        }
    } catch (err) {
        alert('Something went wrong,\nPlease contact your system administrator');
        var ex = err.toJSON();
        var errorMsg = 'Error: ' + ex.name + '\n' + 'Message: ' + ex.message + '\n' +
            'Script ID: ' + runtime.getCurrentScript().id + '\n' + 'Deployment ID: ' + runtime.getCurrentScript().deploymentId;
        log.error(ex.name, errorMsg);
    }
}


export function saveRecord(context: EntryPoints.Client.saveRecordContext) {

    if (!isEdited) {         // There is no errors
        // Reset the Request Date & Time to the Time Now! 
        var now = new Date();
        var missionReq = context.currentRecord;
        missionReq.setValue('custrecord_edc_mission_request_date', now);
        missionReq.setValue('custrecord_edc_mission_request_time', now);
        return true;
    } else {
        alert('Past missions cannot be edited or saved!');
        return false;
    }
}
