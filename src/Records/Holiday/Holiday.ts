import {BaseModel, ColumnType} from '../../Core/Model/BaseModel';

export class Holiday extends BaseModel {

    recordType = 'customrecord_edc_holiday';

    // todo don't prefix
    dontPrefix = [
        'id',
        'name',
        'isinactive'
    ];

    columnPrefix = 'custrecord_edc_holiday_';

    typeMap = {
        'date': ColumnType.DATE
    };

}