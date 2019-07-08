import {BaseModel, ColumnType} from '../../Core/Model/BaseModel';


export class TaxTier extends BaseModel {

    recordType = 'customrecord_edc_pr_tax_tier';

    typeMap = {
        'from': ColumnType.NUMBER,
        'to': ColumnType.NUMBER,
        'tax_rate': ColumnType.NUMBER,
        'tax_credit': ColumnType.NUMBER,

    };

    columnPrefix = 'custrecord_edc_pr_tax_tier_';
}