import * as UIMessage from "N/ui/message";
import * as search from "N/search";


export enum ApprovalStatus {
    'PENDING_APPROVAL' = 1,
    'APPROVED' = 2,
    'REJECTED' = 3,
}

export enum PeriodFrequentType {
    Days = 'days',
    Months = 'months',
    Years = 'years',
    Lifetime = 'lifetime',
}

export namespace UI {
    export function showMessage(title, message, duration = 5000, type = UIMessage.Type.WARNING) {
        UIMessage.create({
            title: title,
            message: message,
            type: type
        }).show({duration: duration});
    }
}

export namespace Model {
    export function resultToObject(result, prefix = ''): object {
        let response = {};

        if (result.columns)
            result.columns.forEach((column) => {
                response[column.name.replace(prefix, '')] = result.getValue(column.name);
            });

        return response;
    }

    export function millisecondsToHuman(number) {
        return {
            'seconds': number / 1000,
            'minutes': number / (1000 * 60),
            'hours': number / (1000 * 60 * 60),
            'days': number / (1000 * 60 * 60 * 24)
        }
    }

    export function toNSDateString(date: Date) {
        return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
    }

    export function getWorkingDays(startDate, endDate, weekEnds: any = [5, 6], holidays = []) {
        let result = 0;

        let currentDate = startDate;
        while (currentDate <= endDate) {
            let weekDay = currentDate.getDay();

            if (
                weekEnds.indexOf(weekDay) == -1
                &&
                holidays.filter(holiday => holiday.toDateString() == currentDate.toDateString()).length == 0
            )
                result++;


            currentDate.setDate(currentDate.getDate() + 1);
        }

        return result;
    }


    export function convertPeriodStrToMins(periodString) {
        let actualPeriod = 0;
        let periodStrArray = periodString.split(' ');

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


    /** @param period Number of minutes to be converted */
    export function convertMinsToText(period: number) {

        let periodStr: string;
        if (period >= 60) {

            let hours = Math.floor(period / 60);
            let minutes = period - (hours * 60);
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
}