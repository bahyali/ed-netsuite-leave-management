/**
 * @NScriptName ClientScript Vacations Balance
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * 
 */

import { EntryPoints } from 'N/types';
import search = require('N/search');
import record = require('N/record');
import url = require('N/url');
import runtime = require('N/runtime');
import email = require('N/email');
import serverWidget = require('N/ui/serverWidget');
import redirect = require('N/redirect');
import config = require('N/config');
import a = require('N/currentRecord');


// config.load({type: config.Type.COMPANY_PREFERENCES}).getValue('');

// var netsuiteDomain = url.resolveDomain({
//     hostType: url.HostType.APPLICATION,
//     accountId: runtime.accountId,
// });

export function pageInit(context: EntryPoints.Client.pageInitContext) {
    try {
        var vacBalance = context.currentRecord;
        var currentUser = runtime.getCurrentUser();

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

                    if (context.mode == 'create') {
                        vacBalance.setValue('custrecord_edc_vac_balance_year', new Date().getFullYear());
                        vacBalance.getField({ fieldId: 'custrecord_edc_vac_balance_emp_name' }).isDisabled = false;
                        vacBalance.getField({ fieldId: 'custrecord_edc_vac_balance_emp_name' }).isMandatory = true;
                    }

                    if (context.mode == 'edit') {
                        var empName = vacBalance.getText('custrecord_edc_vac_balance_emp_name');
                        var enableEdit = confirm('Are you sure you want to edit ' + empName + '\'s vacations balance?');
                        if (enableEdit) {
                            // Enable All Fields
                            vacBalance.getField({ fieldId: 'custrecord_edc_vac_balance_casual' }).isDisabled = false;
                            vacBalance.getField({ fieldId: 'custrecord_edc_vac_balance_sick' }).isDisabled = false;
                            vacBalance.getField({ fieldId: 'custrecord_edc_vac_balance_annual' }).isDisabled = false;
                            vacBalance.getField({ fieldId: 'custrecord_edc_vac_balance_transferred' }).isDisabled = false;
                            vacBalance.getField({ fieldId: 'custrecord_edc_vac_balance_replacement' }).isDisabled = false;
                            vacBalance.getField({ fieldId: 'custrecord_edc_vac_balance_unpaid' }).isDisabled = false;
                            vacBalance.getField({ fieldId: 'custrecord_edc_vac_balance_overtime_days' }).isDisabled = false;
                            // Make All Fields Mandatory
                            vacBalance.getField({ fieldId: 'custrecord_edc_vac_balance_casual' }).isMandatory = true;
                            vacBalance.getField({ fieldId: 'custrecord_edc_vac_balance_sick' }).isMandatory = true;
                            vacBalance.getField({ fieldId: 'custrecord_edc_vac_balance_annual' }).isMandatory = true;
                            vacBalance.getField({ fieldId: 'custrecord_edc_vac_balance_transferred' }).isMandatory = true;
                            vacBalance.getField({ fieldId: 'custrecord_edc_vac_balance_replacement' }).isMandatory = true;
                            vacBalance.getField({ fieldId: 'custrecord_edc_vac_balance_unpaid' }).isMandatory = true;
                            vacBalance.getField({ fieldId: 'custrecord_edc_vac_balance_overtime_days' }).isMandatory = true;
                        }
                    }
                    break;
                }
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
        var vacBalance = context.currentRecord;
        if (context.fieldId == 'custrecord_edc_vac_balance_emp_name') {

            //Searching if the Employee has another vacations balance record
            var empId = Number(vacBalance.getValue('custrecord_edc_vac_balance_emp_name'));
            var empVacBalances = search.create({
                type: 'customrecord_edc_emp_vac_balance',
                filters: [
                    search.createFilter({
                        name: 'custrecord_edc_vac_balance_emp_name',
                        operator: search.Operator.ANYOF,
                        values: empId
                    }),
                    search.createFilter({
                        name: 'custrecord_edc_vac_balance_year',
                        operator: search.Operator.CONTAINS,
                        values: new Date().getFullYear(),
                    })
                ],
            }).run().getRange({ start: 0, end: 1 });

            if (empVacBalances[0]) {
                var empName = vacBalance.getText('custrecord_edc_vac_balance_emp_name');
                var goToEmpBalance = confirm(empName + ' already has another vacations balance record this year, \n' +
                    'Do you want to go to this record?');
                if (goToEmpBalance) {
                    var recordURL = url.resolveRecord({
                        recordType: 'customrecord_edc_emp_vac_balance',
                        recordId: empVacBalances[0].id,
                        isEditMode: false,
                    });
                    window.location = recordURL;
                }
                vacBalance.setValue('custrecord_edc_vac_balance_emp_name', '');
            } else {
                if (empId) {
                    // Get Employee's Basic Information
                    var employee = search.lookupFields({
                        type: search.Type.EMPLOYEE,
                        id: empId.toString(),
                        columns: ['title', 'supervisor', 'subsidiary', 'department']
                    });
                    var supervisor = (employee.supervisor.length) ? employee.supervisor[0].value : '';
                    var subsidiary = (employee.subsidiary.length) ? employee.subsidiary[0].value : '';
                    var department = (employee.department.length) ? employee.department[0].value : '';

                    vacBalance.setValue('custrecord_edc_vac_balance_jobtitle', employee.title);
                    vacBalance.setValue('custrecord_edc_vac_balance_supervisor', supervisor);
                    vacBalance.setValue('custrecord_edc_vac_balance_subsidiary', subsidiary);
                    vacBalance.setValue('custrecord_edc_vac_balance_department', department);

                    // Enable All Fields
                    vacBalance.getField({ fieldId: 'custrecord_edc_vac_balance_casual' }).isDisabled = false;
                    vacBalance.getField({ fieldId: 'custrecord_edc_vac_balance_sick' }).isDisabled = false;
                    vacBalance.getField({ fieldId: 'custrecord_edc_vac_balance_annual' }).isDisabled = false;
                    vacBalance.getField({ fieldId: 'custrecord_edc_vac_balance_transferred' }).isDisabled = false;
                    vacBalance.getField({ fieldId: 'custrecord_edc_vac_balance_replacement' }).isDisabled = false;
                    vacBalance.getField({ fieldId: 'custrecord_edc_vac_balance_unpaid' }).isDisabled = false;
                    vacBalance.getField({ fieldId: 'custrecord_edc_vac_balance_overtime_days' }).isDisabled = false;
                    // Make All Fields Mandatory
                    vacBalance.getField({ fieldId: 'custrecord_edc_vac_balance_casual' }).isMandatory = true;
                    vacBalance.getField({ fieldId: 'custrecord_edc_vac_balance_sick' }).isMandatory = true;
                    vacBalance.getField({ fieldId: 'custrecord_edc_vac_balance_annual' }).isMandatory = true;
                    vacBalance.getField({ fieldId: 'custrecord_edc_vac_balance_transferred' }).isMandatory = true;
                    vacBalance.getField({ fieldId: 'custrecord_edc_vac_balance_replacement' }).isMandatory = true;
                    vacBalance.getField({ fieldId: 'custrecord_edc_vac_balance_unpaid' }).isMandatory = true;
                    vacBalance.getField({ fieldId: 'custrecord_edc_vac_balance_overtime_days' }).isMandatory = true;
                }
            }
        }

        if (context.fieldId == 'custrecord_edc_vac_balance_annual' || context.fieldId == 'custrecord_edc_vac_balance_transferred' ||
            context.fieldId == 'custrecord_edc_vac_balance_replacement') {

            var vacBalance = context.currentRecord;
            var annual = Number(vacBalance.getValue('custrecord_edc_vac_balance_annual'));
            var transferred = Number(vacBalance.getValue('custrecord_edc_vac_balance_transferred'));
            var replacement = Number(vacBalance.getValue('custrecord_edc_vac_balance_replacement'));
            var totalRegular = annual + replacement + transferred;
            vacBalance.setValue('custrecord_edc_vac_balance_total_regular', totalRegular);
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


// var empBalanceURL = url.resolveRecord({
//     recordType: 'employee',
//     recordId: empId.toString(),
//     isEditMode: true,
// });