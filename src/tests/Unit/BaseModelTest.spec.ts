import {BaseModel} from "../../Core/Model/BaseModel";
import {Field} from "../../Core/Model/Field";
import {Record as NsRecord} from "../Mocks/N/record";
import * as record from "@hitc/netsuite-types/N/record";
import {Validation} from "../../Core/Validation";
import {ColumnType} from "../../Core/Model/QueryBuilder";

describe('BaseModel ', () => {

    it('should retrieve Record by Id', function () {

        // Load NsRecord by Id
        let record = new TestRecord()
            .setRecord(1);

        // Has field
        expect(record).toBeInstanceOf(BaseModel);

    });

    it('should prepare from Record Instance ', function () {
        // Build Model from NsRecord
        let record = new TestRecord()
            .createFromRecord(<record.ClientCurrentRecord | record.Record>NsRecord);

        // Has field
        expect(record).toEqual(expect.objectContaining({
            'emp_name': expect.any(Field),
            'jobtitle': expect.any(Field)
        }));
    });


    it('should get a FieldGroup ', function () {
        // Build Model from NsRecord
        let record = new TestRecord()
            .createFromRecord(<record.ClientCurrentRecord | record.Record>NsRecord);

        let fields = record.getFields(['emp_name', 'jobtitle']);

        // Has field
        expect(fields).toHaveLength(2);

        expect(fields[0]).toBeTruthy();
    });

    it('should prepare from Result Instance ', function () {
        // Build Model from Result
        // let record = new TestRecord()
        // .createFromResult(<search.Result>NsRecord);

        // Has field
        // expect(record).toEqual(expect.objectContaining({
        //     'emp_name': expect.any(Field),
        //     'jobtitle': expect.any(Field)
        // }));
    });

    it('should validate fields ', function () {
        // Build Model from NsRecord
        let record = new TestRecord()
            .createFromRecord(<record.ClientCurrentRecord | record.Record>NsRecord);

        let valid = record.validateField('year');
        // Has field
        expect(valid).toBeFalsy();

    });
});

class TestRecord extends BaseModel {
    recordType: string = 'customrecord_edc_emp_vac_balance';

    columnPrefix: string = 'custrecord_edc_vac_balance_';

    // Mapping
    typeMap: object = {
        "year": ColumnType.STRING,
        "emp_name": ColumnType.LIST,
        "subsidiary": ColumnType.LIST,
        "jobtitle": ColumnType.STRING,
    };

    validation = {
        'year': [
            // 'isNotEmpty', //simple only
            'isUnique', //simple
            (field, model) => {
                return Validation.isUnique(field, model)();
            }, //
            // {isEmpty: []}
        ]
    };

    // Default Columns
    columns = Object.keys(this.typeMap);
}
