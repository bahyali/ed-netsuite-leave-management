import { BaseModel, ColumnType } from "../../Core/Model/BaseModel";
import { Field } from "../../Core/Model/Field";
import { Record as NsRecord } from "../Mocks/N/record";
import * as record from "@hitc/netsuite-types/N/record";
import * as search from "@hitc/netsuite-types/N/search";
import { LeaveType, LeaveTypeFields } from '../../Records/LeaveType/LeaveType';



describe('LeaveType ', () => {

    it('should return string of mapping', function () {
        let vacType = new LeaveType();
        let fieldId = vacType.getColumnId(LeaveTypeFields.MAPPING);

        expect(fieldId).toBe('custrecord_edc_vac_type_mapping');
    });
});