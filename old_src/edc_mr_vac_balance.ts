/**
 * @NScriptName Scheduled Script Vacation Rules For Employees
 * @NApiVersion 2.0
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 * 
 */



/* What this script do?
 *       1. Loop through all employees in the company (Who have a Hiring Date & Birth Date)                        - #getInputData
 *       2. Extract some data from the employees records (id, hiredate)                                            - #map
 *       3. Get a Script Parameter (Allowed Vacation Days) from the Admin: (Setup => Company => General Preferences => Custom Preferences)
 *       4. Map/Reduce Script to be run annually to loop through all employees and set the vacation days with the
 *          the value in the script parameter and also calculate the employment period                             - #UI
 *       5. Creating new 'Employee Vacation' Record for each employee with the value pased on employment period    - #reduce
 */

import { EntryPoints } from 'N/types';
import search = require('N/search');
import record = require('N/record');
import runtime = require('N/runtime');
import email = require('N/email');
import serverWidget = require('N/ui/serverWidget');
import redirect = require('N/redirect');


export function getInputData(context: EntryPoints.MapReduce.getInputDataContext) {

    // ========================================== [ Creating a New Search (Employees' Loop) ] ==========================================

    var empSearch = search.create({
        type: search.Type.EMPLOYEE,
        filters: [
            /* SEARCH EXPRESSION:  ['hiredate', search.Operator.ISNOTEMPTY] - instead of creating a search filter */
            search.createFilter({
                // The ID of the Search Filter (Check the Records Browser)
                // Link: http://www.netsuite.com/help/helpcenter/en_US/srbrowser/Browser2016_1/script/record/employee.html [Search Filters]
                name: 'hiredate',
                // The Operator which can be applied using the type (Check the 'Search Operator' from the Help Center)
                // Link: https://system.netsuite.com/app/help/helpcenter.nl?fid=section_n3005172.html   [Date]
                operator: search.Operator.ISNOTEMPTY
            }),
            // Another Search Criteria
            search.createFilter({
                name: 'birthdate',
                operator: search.Operator.ISNOTEMPTY
            })
        ],
        // What Columns (Data) that would be gotten from the Employee Record
        // Link: http://www.netsuite.com/help/helpcenter/en_US/srbrowser/Browser2016_1/script/record/employee.html [Search Columns] 
        /* NOTE : If there is a join to get data from another table, use this format: search.createColumn({name: 'title', join 'customer'})
        and that means get the title of the customer which have a relation with this Employee */
        columns: [
            search.createColumn({ name: 'custentity_edc_emp_exp_years' }),
            search.createColumn({ name: 'hiredate' }),
            search.createColumn({ name: 'birthdate' }),
            search.createColumn({ name: 'subsidiary' }),
            search.createColumn({ name: 'department' }),
            search.createColumn({ name: 'supervisor' }),
            search.createColumn({ name: 'title' }),              // Employee's Job Title
            search.createColumn({ name: 'isinactive' }),
        ]
    });

    // Return the search to the system to be used later in 'Map' and/or 'Reduce' functions
    return empSearch;
}


export function map(context: EntryPoints.MapReduce.mapContext) {

    // ================================== [ Grouping the Employees' Data into Key/Value Objects ] ==================================

    // Receiving ONE object from search results object and parsing it into JSON object
    var emp_Result = JSON.parse(context.value);

    // ============== logging the SearchResult Object to know the structure of that JSON object ============= \\
    // use this website: https://jsoneditoronline.org/ to see the JSON object hierarchy
    // log.debug('JSON Structure', emp_Result);

    var emp_id = emp_Result.id;  // Employee's ID
    var emp_hiredate = emp_Result.values.hiredate;
    var emp_birthdate = emp_Result.values.birthdate;
    var emp_subsidiary = emp_Result.values.subsidiary.value;
    var emp_department = emp_Result.values.department.value;
    var emp_supervisor = emp_Result.values.supervisor.value;
    var emp_jobtitle = emp_Result.values.title;
    var emp_isinactive = emp_Result.values.isinactive;
    var emp_experience = Number(emp_Result.values.custentity_edc_emp_exp_years)


    if (emp_isinactive == 'F') {
        // Getting Current Date (Server-Based | GMT-7 [PDT])
        var today = new Date();     // Current Date (based on the local time on the server)
        // var thisMonth = today.getMonth() + 1;       // 0 = January
        var thisYear = today.getFullYear();

        // // Converting the Hire Date from D/M/Y to M/Y/D (like JS default date format)
        // var hiredate_arr = emp_hiredate.split('/');
        // var hiredate_modified = hiredate_arr[1] + '/' + hiredate_arr[0] + '/' + hiredate_arr[2];

        // Getting Month & Year Data of HireDate
        var hiredate = new Date(emp_hiredate);
        var hireYear = hiredate.getFullYear();
        // var hireMonth = hiredate.getMonth() + 1;    // 0 = January

        // // Converting the Birth Date from D/M/Y to M/Y/D (like JS default date format)
        // var birthdate_arr = emp_birthdate.split('/');
        // var birthdate_modified = birthdate_arr[1] + '/' + birthdate_arr[0] + '/' + birthdate_arr[2];

        // Getting Month & Year Data of BirthDate
        var birthdate = new Date(emp_birthdate);
        // var birthYear = birthdate.getFullYear();
        // var birthMonth = birthdate.getMonth() + 1;    // 0 = January

        // Setting data to ZERO to make sure there is no any undefined/null values
        var workingPeriod = Math.floor((today - hiredate) / 2629800000);
        var currentAge = Math.floor((today - birthdate) / 31557600000);
        var annualVacations = 0;
        var transferredVacs = 0;
        var totalVacations = 0;

        var vacRule = search.create({
            type: 'customrecord_edc_vac_rule',
            filters: [search.createFilter({
                name: 'custrecord_edc_vac_rule_year',
                operator: search.Operator.CONTAINS,
                values: thisYear
            }),
            search.createFilter({
                name: 'custrecord_edc_vac_rule_subsidiary',
                operator: search.Operator.ANYOF,
                values: emp_subsidiary
            })],
            columns: [
                search.createColumn({ name: 'custrecord_edc_vac_rule_casual_days' }),
                search.createColumn({ name: 'custrecord_edc_vac_rule_sick_days' }),
                search.createColumn({ name: 'custrecord_edc_vac_rule_probation_period' }),
                search.createColumn({ name: 'custrecord_edc_vac_rule_elderly_emp_age' }),
                search.createColumn({ name: 'custrecord_edc_vac_rule_elderly_emp_vacs' }),
                search.createColumn({ name: 'custrecord_edc_vac_rule_regvac_less10y' }),
                search.createColumn({ name: 'custrecord_edc_vac_rule_regvac_more10y' }),
                // [ Configurations ]
                search.createColumn({ name: 'custrecord_edc_vac_rule_exp_hiredate' }),          // Boolean
                search.createColumn({ name: 'custrecord_edc_vac_rule_transfer_days' }),         // Boolean
                search.createColumn({ name: 'custrecord_edc_vac_rule_casual_as_annual' }),      // Boolean
                search.createColumn({ name: 'custrecord_edc_vac_rule_weekend_apply' }),         // Boolean
                //search.createColumn({ name: 'custrecord_edc_vac_rule_weekend_days' }),          // Array
            ]
        }).run().getRange({ start: 0, end: 1 });

        var casualVacations = Number(vacRule[0].getValue('custrecord_edc_vac_rule_casual_days'));
        var sickDaysVacs = Number(vacRule[0].getValue('custrecord_edc_vac_rule_sick_days'));
        var probationPeriod = Number(vacRule[0].getValue('custrecord_edc_vac_rule_probation_period'));
        var elderlyEmpAge = Number(vacRule[0].getValue('custrecord_edc_vac_rule_elderly_emp_age'));
        var elderlyEmpVacDays = Number(vacRule[0].getValue('custrecord_edc_vac_rule_elderly_emp_vacs'));
        var lessThan10yrsVac = Number(vacRule[0].getValue('custrecord_edc_vac_rule_regvac_less10y'));
        var moreThan10yrsVac = Number(vacRule[0].getValue('custrecord_edc_vac_rule_regvac_more10y'));
        // [ Configurations ]
        var experience_hiredate = Boolean(vacRule[0].getValue('custrecord_edc_vac_rule_exp_hiredate'));         // Boolean
        var transferVacations = Boolean(vacRule[0].getValue('custrecord_edc_vac_rule_transfer_days'));          // Boolean
        var casualFromAnnual_cb = Boolean(vacRule[0].getValue('custrecord_edc_vac_rule_casual_as_annual'));     // Boolean
        var isWeekEndsApplied_cb = Boolean(vacRule[0].getValue('custrecord_edc_vac_rule_weekend_apply'));       // Boolean
        // var weekendDays_list = vacRule[0].getText('custrecord_edc_vac_rule_weekend_days');                     // Array

        // Comparing the Hire Date to Current Date                   :: BUSINESS LOGIC IN VACATIONS CACULATIONS ::

        if (workingPeriod >= probationPeriod) {       // If the employee finished the probation period
            // Checking the Experience Years Validation (Based on HireDate or Not)
            if (!experience_hiredate) {     // The default
                if (emp_experience >= 10) annualVacations = moreThan10yrsVac;
                else annualVacations = lessThan10yrsVac;
            } else {    // Expeience Years Calculations based-on hiredate
                if ((thisYear - hireYear) >= 10) annualVacations = moreThan10yrsVac;
                else annualVacations = lessThan10yrsVac;
            }
        } else {
            // prevent adding Casual & Sick Vacations for Employees who exceeded the probation period
            casualVacations = 0;
            sickDaysVacs = 0;
        }



        // Checking if the employee is elderly, override all above
        if (elderlyEmpAge <= currentAge) {
            annualVacations = elderlyEmpVacDays;
        }

        totalVacations = annualVacations;       // Setting the default TOTAL Vacations = ANNUAL vacations (without posted vacations)

        // Posting Unused Vacations
        if (transferVacations == true) {
            // ================================ [ Getting Latest Employee's Vacations Balance ] ================================
            var vacRecord = search.create({
                type: 'customrecord_edc_emp_vac_balance',
                filters: [
                    search.createFilter({
                        name: 'custrecord_edc_vac_balance_year',
                        operator: search.Operator.CONTAINS,
                        values: thisYear - 1
                    }),
                    search.createFilter({
                        name: 'custrecord_edc_vac_balance_emp_name',
                        operator: search.Operator.ANYOF,
                        values: emp_id
                    })
                ],
                columns: [search.createColumn({ name: 'custrecord_edc_vac_balance_annual' })]
            });
            var vacRecordResults = vacRecord.run().getRange({
                start: 0,
                end: 1
            });
            //Getting the Remaining Annual Vacations from the last year
            if (vacRecordResults) {
                if (vacRecordResults[0]) {
                    // The Remaining Annual Vacation Days from the Last Year
                    transferredVacs = vacRecordResults[0].getValue('custrecord_edc_vac_balance_annual');
                    if (isNaN(transferredVacs)) {
                        transferredVacs = 0;
                    }
                }
            }
            totalVacations += Number(transferredVacs);
        }
        // context.write(emp_id, emp_hiredate);    //Passing the Key: (id) and the value (hiredate)



        // ===================================== [ Creating Employee's Vacations Balace Record ] =====================================

        // Saving the Vacation days of the employee in a 'Vacations Balance Record
        var empVacBalanceRecord = record.create({
            type: 'customrecord_edc_emp_vac_balance',
            isDynamic: true,
        });
        // Vacations Year
        empVacBalanceRecord.setValue('custrecord_edc_vac_balance_year', thisYear.toString());
        // Employee's Name (Employee List/Record)
        empVacBalanceRecord.setValue('custrecord_edc_vac_balance_emp_name', emp_id);
        // Employee's Subsidiary
        empVacBalanceRecord.setValue('custrecord_edc_vac_balance_subsidiary', emp_subsidiary);
        // Employee's JobTitle
        empVacBalanceRecord.setValue('custrecord_edc_vac_balance_jobtitle', emp_jobtitle);
        // Employee's Department
        empVacBalanceRecord.setValue('custrecord_edc_vac_balance_department', emp_department);
        // Employee's Supervisor
        empVacBalanceRecord.setValue('custrecord_edc_vac_balance_supervisor', emp_supervisor);
        // Employee's Transferred Vacations
        empVacBalanceRecord.setValue('custrecord_edc_vac_balance_transferred', transferredVacs);
        // Employee's Annual Default Vacations
        empVacBalanceRecord.setValue('custrecord_edc_vac_balance_annual', annualVacations);
        // Employee's Casual Vacations
        empVacBalanceRecord.setValue('custrecord_edc_vac_balance_casual', casualVacations);
        // Employee's Sick Vacation Days
        empVacBalanceRecord.setValue('custrecord_edc_vac_balance_sick', sickDaysVacs);
        // Employee's Total Vacations
        empVacBalanceRecord.setValue('custrecord_edc_vac_balance_total_regular', totalVacations);
        // Employee's Transferred Vacations
        empVacBalanceRecord.setValue('custrecord_edc_vac_balance_replacement', 0);
        // Employee's Unpaid Vacations
        empVacBalanceRecord.setValue('custrecord_edc_vac_balance_unpaid', 0);

        // ======================= [ CONFIGURATIONS ] =======================((Hidden Fields))====================
        // Check-Box to determine if the casual vacations deducted from both casual & annual balance
        empVacBalanceRecord.setValue('custrecord_edc_vac_balance_casual_cb', casualFromAnnual_cb);
        // Check-Box to determine if the weekends are always normal vacations and won't be counted as workdays
        empVacBalanceRecord.setValue('custrecord_edc_vac_balance_weekends_cb', isWeekEndsApplied_cb);
        // Weekends Array if its defined                
        //                empVacBalanceRecord.setText({
        //                    fieldId: 'custrecord_edc_vac_balance_weekends_list',
        //                    value: weekendDays_list
        //                });


        empVacBalanceRecord.save();


        // Incrementing the Year of Experience by 1
        emp_experience++;
        record.submitFields({
            type: record.Type.EMPLOYEE,
            id: emp_id,
            values: { 'custentity_edc_emp_exp_years': emp_experience }
        });
    }
}

// log.debug('Employee Vacation Info', 'Emp ID: ' + emp_id + '\n' + 'Vacation Days: ' + totalVacations +
//     '\n' + 'Causal Vacations: ' + casualVacations + '\n' + 'Hire Month: ' + hireMonth + 'HireDate:' + hiredate + 'OLD hiredate: ' +
//     emp_hiredate + '\n' + 'Hire Year: ' + hireYear + '***' + thisMonth);

// log.debug('hiredate', 'From Search: ' + emp_hiredate + '*** Hire Month: ' + hireMonth
// + '*** hire day' + hiredate.getDay() + 'birthMonth '+ birthMonth);


export function summarize(summary: EntryPoints.MapReduce.summarizeContext) {

    log.audit('Usage Consumed', summary.usage);

    log.audit('Number of Queues', summary.concurrency);

    log.audit('Number of Yields Done', summary.yields);

    if (summary.inputSummary.error) {
        log.error('Input Error', summary.inputSummary.error);
    }

    summary.mapSummary.errors.iterator().each(function (key, error) {
        log.error('Map Error for key: ' + key, error);
        return true;
    });
}
















// Stopped Working!
export function reduce(context: EntryPoints.MapReduce.reduceContext) {

    // ============================= [ Calculating the Employment Period & Allowed Vacation Days ] =============================

    // Getting the Number of Vacation Days from Script Parameters
    var vacationDays_std = runtime.getCurrentScript().getParameter({
        name: 'custscript_edc_vacation_days'
    });

    var vacationDays_exp = runtime.getCurrentScript().getParameter({
        name: 'custscript_edc_vacations_experienced'
    });

    // Getting the Employee's Data from the Map Stage Object
    var empId = context.key;
    var emp_Hiredate = context.values;


    // Getting Current Date (Server-Based | GMT-7 [PDT])
    var today = new Date();     // Current Date (based on the local time on the server)
    var thisMonth = today.getMonth() + 1;       // 0 = January
    var thisYear = today.getFullYear();

    // Converting the HireDate from D/M/Y to M/Y/D (like JS default date format)
    var hiredate_arr = emp_Hiredate.split('/');
    var hiredate_modified = hiredate_arr[1] + '/' + hiredate_arr[0] + '/' + hiredate_arr[2];

    // Getting data about Hiring Date to be Compared with Current Date
    var hiredate = new Date(hiredate_modified);
    var hireMonth = hiredate.getMonth() + 1;    // 0 = January
    var hireYear = hiredate.getFullYear();
    var monthsDiff = thisMonth - hireMonth;
    var vacationDays = 0

    // Comparing the Hire Date to Current Date                   :: BUSINESS LOGIC IN VACATIONS CACULATIONS ::
    if (thisYear == hireYear && hireMonth <= 12) {

        if (monthsDiff >= 3) {       // If the employee spent more than 3 months
            vacationDays = vacationDays_std;
        }

    } else if (thisYear > hireYear) {             // If the Employment period is more than 1 year
        var yearsDiff = thisYear - hireYear;
        monthsDiff += 12 * yearsDiff;
        vacationDays = vacationDays_std;
    }

    if ((thisYear - hireYear) >= 10) {    // If the Employee has more than 10 years of Experience
        vacationDays_std = vacationDays_exp;

    }
    // if (hireMonth > 12) {
    //     log.error('Month is not valid', 'Month is = ' + hireMonth);
    // }


    // Saving the Vacation days of the employee in a 'Employee's Vacations' record (Table)
    var empVacBalanceRecord = record.create({
        type: 'customrecord_edc_emp_vacations',
        isDynamic: true,
    });

    empVacBalanceRecord.setValue({
        fieldId: 'name',
        value: thisYear + ' Vacations'
    });

    empVacBalanceRecord.setValue({
        fieldId: 'custrecord_edc_vacations_emp_name',
        value: empId
    });

    empVacBalanceRecord.setValue({
        fieldId: 'custrecord_edc_emp_vacation_days',
        value: vacationDays
    });

    empVacBalanceRecord.setValue({
        fieldId: 'custrecord_edc_emp_vacations_year',
        value: thisYear
    });

    empVacBalanceRecord.save();

    log.debug('Employee Vacation Info', 'Emp ID: ' + empId + '\n' + 'Vacation Days: ' + vacationDays);

}