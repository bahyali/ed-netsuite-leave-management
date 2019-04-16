
import {ColumnType} from "../../Core/Model/QueryBuilder";
import { BaseModel } from '../../Core/Model/BaseModel';



class VacationBalance extends BaseModel {
    recordType: string = 'customrecord_edc_emp_vac_balance';

    columnPrefix: string = 'custrecord_edc_vac_balance';
    // Mapping
    typeMap: object = {
        'annual': ColumnType.STRING,
    }


}