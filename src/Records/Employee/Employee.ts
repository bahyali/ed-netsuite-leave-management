import {LeaveBalance} from '../LeaveBalance/LeaveBalance';
import {BaseModel, ColumnType} from '../../Core/Model/BaseModel';


export class Employee extends BaseModel {

    recordType = 'employee';

    typeMap = {
        'jobtitle': ColumnType.STRING,
        'subsidiary': ColumnType.LIST,
        'supervisor': ColumnType.LIST,
        'department': ColumnType.LIST,
    };

    relations = {
        vacationBalance: (model, year) => {
            let idField = model._record.getValue('id');
            return new LeaveBalance().where('emp_name', '==', idField)
                .where('year', '==', year);
        }
    }

}