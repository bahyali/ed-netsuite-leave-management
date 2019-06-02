import {BaseModel, ColumnType} from '../../Core/Model/BaseModel';
import {SalaryRule} from "../SalaryRule/SalaryRule";

export class Salary extends BaseModel {

    recordType = 'customrecord_edc_pr_salary';

    columnPrefix = 'custrecord_edc_pr_sal_';

    typeMap = {
        'personal_insurance': ColumnType.NUMBER,
        'basic_salary': ColumnType.NUMBER,
        'salary_bf_tax': ColumnType.NUMBER,
        'net_salary': ColumnType.NUMBER,
        'total_insurance': ColumnType.NUMBER,
    };

    relations = {
        salaryRule: (year = new Date().getFullYear()) => {
                return new SalaryRule().where('year', '==', year)
        }
    };
}