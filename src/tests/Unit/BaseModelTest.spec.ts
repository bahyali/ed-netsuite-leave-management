import {BaseModel, ColumnType} from "../../Core/Model/BaseModel";
import {Field} from "../../Core/Model/Field";
import {Record as NsRecord} from "../Mocks/N/record";
import * as record from "@hitc/netsuite-types/N/record";
import * as search from "@hitc/netsuite-types/N/search";

describe('BaseModel ', () => {

    it('should retrieve Record by Id', function () {

        // Load NsRecord by Id
        let record = new TestRecord()
            .setRecord(1);

        // Has field
        expect(record).toEqual(expect.objectContaining({
            'emp_name': expect.any(Field),
            'jobtitle': expect.any(Field)
        }));

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

    it('should prepare from Result Instance ', function () {
        // Build Model from Result
        let record = new TestRecord()
            // .createFromResult(<search.Result>NsRecord);

        // Has field
        // expect(record).toEqual(expect.objectContaining({
        //     'emp_name': expect.any(Field),
        //     'jobtitle': expect.any(Field)
        // }));
    });
});

class TestRecord extends BaseModel {
    recordType: string = 'customrecord_edc_emp_vac_balance';

    columnPrefix: string = 'custrecord_edc_vac_balance';

    // Mapping
    typeMap: object = {
        "year": ColumnType.STRING,
        "emp_name": ColumnType.LIST,
        "subsidiary": ColumnType.LIST,
        "jobtitle": ColumnType.STRING,
    };

    // Default Columns
    columns = Object.keys(this.typeMap);
}
