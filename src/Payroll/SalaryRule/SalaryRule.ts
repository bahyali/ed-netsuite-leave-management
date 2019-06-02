import {BaseModel, ColumnType} from '../../Core/Model/BaseModel';


export class SalaryRule extends BaseModel {

    recordType = 'customrecord_edc_pr_sal_rule';

    typeMap = {
        'year': ColumnType.STRING
    };

    columnPrefix = 'custrecord_edc_pr_sal_rul_';
}