import { LeaveBalance } from '../LeaveBalance/LeaveBalance';
import { BaseModel } from '../../Core/Model/BaseModel';
import { ColumnType } from '../../Core/Model/QueryBuilder';


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