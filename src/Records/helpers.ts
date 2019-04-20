import * as UIMessage from "N/ui/message";
import * as search from "N/search";

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

    export function getWorkingDays(startDate, endDate, weekEnds = [5, 6]) {
        let result = 0;

        let currentDate = startDate;
        while (currentDate <= endDate) {
            let weekDay = currentDate.getDay();

            if (weekEnds.indexOf(weekDay) == -1)
                result++;

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return result;
    }
}