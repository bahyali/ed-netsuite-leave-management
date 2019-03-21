import { EntryPoints } from 'N/types';
import search = require('N/search');
import record = require('N/record');
import runtime = require('N/runtime');
import serverWidget = require('N/ui/serverWidget');
import redirect = require('N/redirect');
import file = require('N/file');
import url = require('N/url');
import { request } from '@hitc/netsuite-types/N/http';


export function beforeLoad(context: EntryPoints.UserEvent.beforeLoadContext) {

    /**
     * Everything works fine with that script ,but the JS on the NetSuite Server doesn't allow this type of Date,
     * so, we should change the date from the "attendance system" to be (MM/DD/YYY) or change it here!
     * from (DD-MON-YYY) to (MM/DD/YYYY)
     */

    //Text
    var note = '';

    // Defaulting File Location
    var now = new Date();
    var today = now.getDate() + '-' + now.getMonth() + 1 + '-' + now.getFullYear();
    context.newRecord.setValue('custrecord_ahk_attendance_file', 'AHK Employees Attendance/' + today + '.csv');


    var attFile = file.load({ id: 'AHK Employees Attendance/test.csv' });
    var fileContent = attFile.getContents();    // Getting the inside data
    var checkInList = [];
    var fileRows = fileContent.split('\r\n');

    for (var i = 1; i < fileRows.length; i++) {

        var empData = fileRows[i].split(',');
        var empName = empData[1];
        if (empName) {            // Checking this Row has a record
            var empAttDate = dateConverter(empData[2]);
            var empAttStatus = empData[3];
            // Getting Day and Time Separately
            // var empAttDay = empData[2].split(' ')[0];
            // var empAttTime = empData[2].slice(empAttDate.length + 1, empData[2].length);

            if (empAttStatus == 'C/In') {
                checkInList.push({ name: empName, date: empAttDate });
            } else if (empAttStatus == 'C/Out') {
                for (var j = 0; j < checkInList.length; j++) {
                    if (empName == checkInList[j].name) {
                        //Calculating Working Hours
                        var empCheckInDate = checkInList[j].date;
                        var workHours = Math.floor((new Date(empAttDate) - new Date(empCheckInDate)) / 3600000);
                        var workMins = ((new Date(empAttDate) - new Date(checkInList[j].date)) / 60000) % 60;
                        // Removing Employee's Checked-In Record from the list
                        checkInList.splice(j, 1);

                        // Concatenating the Note
                        note += '\n' + empName + ' worked for: ' + workHours + ' Hours & ' + workMins + ' Minutes';
                        note += ' on ' + empCheckInDate;
                    }
                }
            }
        }
    }

    context.newRecord.setValue('custrecord_ahk_attendance_note', note);
}


export function beforeSubmit(context: EntryPoints.UserEvent.beforeSubmit) {

}

// ========================================= [ Helper Functions ] =========================================

function dateConverter(existDate) {

    // Getting Day and Time Separately
    var prevDate = existDate.split(' ')[0];
    var time = existDate.slice(prevDate.length + 1, existDate.length);

    var day = prevDate.split('-')[0];
    var year = prevDate.split('-')[2];
    var monthText = prevDate.split('-')[1].toLowerCase();
    var months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    var month = months.indexOf(monthText) + 1;
    var newDate = new Date(month + '/' + day + '/20' + year + ' ' + time);
    return newDate;
}