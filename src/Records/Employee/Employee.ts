import { LeaveBalance } from '../LeaveBalance/LeaveBalance';
import { BaseModel, ColumnType } from '../../Core/Model/BaseModel';


export class Employee extends BaseModel {

    recordType = 'employee';

    typeMap = {
        'jobtitle': ColumnType.STRING,
        'subsidiary': ColumnType.LIST,
        'supervisor': ColumnType.LIST,
        'department': ColumnType.LIST,
    }

    vacationBalance(year) {
        let idField = this._record.getValue('entityid');
        return new LeaveBalance().where('emp_name', '==', idField).where('year', '==', year);
    }

}


// new Employee().createFromRecord(currentRecord).vacationBalance().first();