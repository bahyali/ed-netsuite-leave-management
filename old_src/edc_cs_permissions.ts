/**
 * @NScriptName ClientScript Permissions
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

import { EntryPoints } from 'N/types';
import runtime = require('N/runtime');
import search = require('N/search');
import email = require('N/email');
import record = require('N/record');
import serverWidget = require('N/ui/serverWidget');
import redirect = require('N/redirect');
import url = require('N/url');
import { request } from '@hitc/netsuite-types/N/http';


//Shared Variables
var currentUser = runtime.getCurrentUser();
var wasApproved;
var preventSave;




export function pageInit(context: EntryPoints.Client.pageInitContext) {
    	
    // Hiding the 'List' and 'Search' Links from the Employee Center.
    if (currentUser.roleCenter == 'EMPLOYEE') {
        document.getElementById('NS_MENU_ID0-item0').setAttribute('style', 'display:none');
        document.getElementById('NS_MENU_ID0-item1').setAttribute('style', 'display:none');        
    }
    
    
    try {
        var empId = currentUser.id;
        var permissionRequest = context.currentRecord;
        var thisYear = new Date().getFullYear();

        if (context.mode == 'create') {

            permissionRequest.setValue('custrecord_edc_permission_year', thisYear);
            permissionRequest.setValue('custrecord_edc_permission_period', '');     // To Get Remaining Monthly Balance

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
                        permissionRequest.getField({ fieldId: 'custrecord_edc_permission_emp' }).isDisabled = false;

                        var employee = search.lookupFields({
                            type: search.Type.EMPLOYEE,
                            id: empId.toString(),
                            columns: ['title']  // title = JobTitle
                        });
                        permissionRequest.setValue('custrecord_edc_permission_jobtitle', employee.title);
                        break;
                    }
                }
            }

            // if (currentUser.role == 3 || currentUser.id == employee.supervisor[0].value || currentUser.role == roleCanRequest) {
            //     permissionRequest.getField({ fieldId: 'custrecord_edc_permission_status' }).isDisabled = false;
            // }

        } else if (context.mode = 'edit') {

            // var empId = permissionRequest.getValue('custrecord_edc_permission_emp');
            var supervisor = permissionRequest.getValue('custrecord_edc_permission_supervisor');
            var reqStatus = permissionRequest.getValue('custrecord_edc_permission_status');

            // Get the Remaining Permission Period (Refresh)
            var requestPeriod = permissionRequest.getValue('custrecord_edc_permission_period');
            permissionRequest.setValue('custrecord_edc_permission_period', requestPeriod);

            // Grapping the Job Title Field
            if (currentUser.role == 3 || currentUser.role == editorRole || currentUser.id == supervisor) {
                var employee = search.lookupFields({
                    type: search.Type.EMPLOYEE,
                    id: empId.toString(),
                    columns: ['title']  // title = JobTitle
                });
                permissionRequest.setValue('custrecord_edc_permission_jobtitle', employee.title);
            }

            // // Giving the Administrator & Employee's Supervisor ONLY the access to Approve/Reject the request (If it isn't already approved)
            // if ((currentUser.role == 3 || currentUser.id == supervisor) && reqStatus != 2) {    // 3 = Administrator Role
            //     permissionRequest.getField({ fieldId: 'custrecord_edc_permission_status' }).isMandatory = true;
            //     permissionRequest.getField({ fieldId: 'custrecord_edc_permission_status' }).isDisabled = false;
            // }

            // Disable Editing for the record if it's approved
            if (reqStatus == 2 || reqStatus == 3) {          // 2 = Approved || 3 = Rejected
                permissionRequest.getField({ fieldId: 'custrecord_edc_permission_status' }).isDisabled = true;
                permissionRequest.getField({ fieldId: 'custrecord_edc_permission_type' }).isDisabled = true;
                permissionRequest.getField({ fieldId: 'custrecord_edc_permission_date' }).isDisabled = true;
                permissionRequest.getField({ fieldId: 'custrecord_edc_permission_memo' }).isDisabled = true;
                permissionRequest.getField({ fieldId: 'custrecord_edc_permission_period' }).isDisabled = true;
                alert('Warning!\nApproved & Rejected Requests cannot be edited!');
                wasApproved = true;
                return;
            }
        }
    } catch (err) {
        alert('Something went wrong,\nPlease contact your system administrator');
        try {
            var ex = err.toJSON();
        } catch (error) {
            error.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t").replace(/\f/g, "\\f");
            var ex = JSON.parse(error);
        } finally {
            var errorMsg = 'Error: ' + ex.name + '\n' + 'Message: ' + ex.message + '\n' +
            'Script ID: ' + runtime.getCurrentScript().id + '\n' + 'Deployment ID: ' + runtime.getCurrentScript().deploymentId;
            log.error(ex.name, errorMsg);
        }
    }
}


export function fieldChanged(context: EntryPoints.Client.fieldChangedContext) {

    try {
        var permissionRequest = context.currentRecord;
        // Getting the selected Employee  
        var empId = permissionRequest.getValue('custrecord_edc_permission_emp');

        // When Choosing/Changing the Employee
        if (context.fieldId == 'custrecord_edc_permission_emp') {

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

            permissionRequest.setValue('custrecord_edc_permission_jobtitle', jobTitle);
            permissionRequest.setValue('custrecord_edc_permission_subsidiary', subsidiary);
            permissionRequest.setValue('custrecord_edc_permission_department', department);
            permissionRequest.setValue('custrecord_edc_permission_supervisor', supervisor);
            permissionRequest.setValue('custrecord_edc_permission_period', '');
        }



        // When Changing Permission Date
        if (context.fieldId == 'custrecord_edc_permission_date') {

            var requestDate = permissionRequest.getValue('custrecord_edc_permission_request_date');
            var permissionDate = permissionRequest.getValue('custrecord_edc_permission_date');

            // Checking if the request not in the past
            if (requestDate > permissionDate) {
                alert('You cannot request a permission in the past!');
                permissionRequest.setValue('custrecord_edc_permission_date', new Date());
                return false;
            }
        }


        /* *********************************** [TESTING] *********************************** *
        if (context.fieldId == 'custrecord_edc_mission_period_text_test') {
            var permissionPeriodString = permissionRequest.getText('custrecord_edc_mission_period_text_test');
            var actualPeriod = convertPeriodStrToMins(permissionPeriodString);
            permissionRequest.setText('custrecord_edc_permission_period', actualPeriod.toString());
        }
        /* ********************************************************************************** */


        if (context.fieldId == 'custrecord_edc_permission_period') {

            var permissionPeriodString = permissionRequest.getText('custrecord_edc_permission_period');
            var permissionPeriod = convertPeriodStrToMins(permissionPeriodString);
            var permissionDate = permissionRequest.getValue('custrecord_edc_permission_date');
            var empSubsidiary = Number(permissionRequest.getValue('custrecord_edc_permission_subsidiary'));

            var rulesSearch = search.create({
                type: 'customrecord_edc_vac_rule',
                filters: [
                    search.createFilter({
                        name: 'custrecord_edc_vac_rule_year',
                        operator: search.Operator.CONTAINS,
                        values: permissionDate.getFullYear(),
                    }),
                    search.createFilter({
                        name: 'custrecord_edc_vac_rule_subsidiary',
                        operator: search.Operator.ANYOF,
                        values: empSubsidiary
                    })],
                columns: ['custrecord_edc_vac_rule_permission_hours', 'custrecord_edc_vac_rule_month_beginning']
            }).run().getRange({ start: 0, end: 1 });

            if (rulesSearch[0]) {
                var monthBeginningDay = Number(rulesSearch[0].getValue('custrecord_edc_vac_rule_month_beginning'));
                var allowedPermissionHours = Number(rulesSearch[0].getValue('custrecord_edc_vac_rule_permission_hours'));

                var monthBeginning = (permissionDate.getMonth() + 1) + '/' + monthBeginningDay + '/' + permissionDate.getFullYear();

                var previousPermissionsThisMonth = search.create({
                    type: 'customrecord_edc_permissions',
                    filters: [
                        search.createFilter({
                            name: 'custrecord_edc_permission_emp',
                            operator: search.Operator.ANYOF,
                            values: Number(empId),
                        }),
                        search.createFilter({
                            name: 'custrecord_edc_permission_date',
                            operator: search.Operator.NOTBEFORE,
                            values: monthBeginning.toString()
                        }),
                        search.createFilter({
                            name: 'custrecord_edc_permission_status',
                            operator: search.Operator.ANYOF,
                            values: 2   // Approved
                        })
                    ],
                    columns: ['custrecord_edc_permission_period']
                }).run().getRange({ start: 0, end: 99 });

                var remainingPermissionMins = allowedPermissionHours * 60;

                for (var i = 0; i < previousPermissionsThisMonth.length; i++) {
                    var periodString = previousPermissionsThisMonth[i].getText('custrecord_edc_permission_period');
                    remainingPermissionMins -= convertPeriodStrToMins(periodString);
                }

                if (remainingPermissionMins > 0) {  // If the employee still has remaining permissions for this month (<120)
                    var newRemainMinutes = remainingPermissionMins - permissionPeriod;

                    if (newRemainMinutes < 0) {    // If the requested permission has exceeded the maximnum for this month.
                        alert('Warning:\nPermission Request exceeds the maximum allowed hours per month');
                        permissionRequest.setText('custrecord_edc_permission_period', '');
                    } else {
                        var periodStr = convertMinsToText(newRemainMinutes);
                        permissionRequest.setValue('custrecord_edc_permission_left_period', periodStr);
                    }
                } else {
                    alert('Warning:\nPermissions cannot exceed ' + allowedPermissionHours + ' hours per month');
                    permissionRequest.setText('custrecord_edc_permission_period', '');
                }
            } else {
                alert('Vacations rules have not been set for this year/subsidiary,\nPlease contact your system administrator.');
                preventSave = true;
            }
        }
    } catch (err) {
        alert('Something went wrong,\nPlease contact your system administrator');
        try {
            var ex = err.toJSON();
        } catch (error) {
            error.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t").replace(/\f/g, "\\f");
            var ex = JSON.parse(error);
        } finally {
            var errorMsg = 'Error: ' + ex.name + '\n' + 'Message: ' + ex.message + '\n' +
            'Script ID: ' + runtime.getCurrentScript().id + '\n' + 'Deployment ID: ' + runtime.getCurrentScript().deploymentId;
            log.error(ex.name, errorMsg);
        }
    }
}

export function saveRecord(context: EntryPoints.Client.saveRecordContext) {

    var permissionRequest = context.currentRecord;
    var reqStatus = permissionRequest.getValue('custrecord_edc_permission_status');

    if (!wasApproved && !preventSave) {         // There is no errors
        // Reset the Request Date & Time to the Time Now! 
        if (reqStatus == 1 || !reqStatus) {       // 1 = Pending Approval
            var now = new Date();
            permissionRequest.setValue('custrecord_edc_permission_request_date', now);
            permissionRequest.setValue('custrecord_edc_permission_request_time', now);
            permissionRequest.setValue('custrecord_edc_permission_status', 1);
        }
        return true;

    } else {
        alert('Warning!\nApproved & Rejected Requests cannot be edited!');
        return false;
    }
}





// ========================================= [ Helper Functions ] =========================================

function convertPeriodStrToMins(periodString) {
    var actualPeriod = 0;
    var periodStrArray = periodString.split(' ');

    if (periodStrArray[0][1]) {                // Hours don't have [0][1]
        actualPeriod = Number(periodStrArray[0]);

    } else {
        actualPeriod = Number(periodStrArray[0]) * 60;
        if (periodStrArray[3]) {        // Not Just an Hour ,but also have minutes (&)
            actualPeriod += Number(periodStrArray[3]);
        }
    }
    return actualPeriod;
}



function convertMinsToText(period) {

    var periodStr;
    if (period >= 60) {

        var hours = Math.floor(period / 60);
        var minutes = period - (hours * 60);
        periodStr = hours + ' hour';
        if (hours > 1) periodStr += 's';

        if (minutes) {
            periodStr += ' & ' + minutes + ' minutes';
        }
    } else {
        periodStr = period + ' minutes';
    }

    return periodStr;
}