import {LeaveType} from "../../Records/LeaveType/LeaveType";
import ClientScript from '../../Records/LeaveType/cs_leave_type';
import {EntryPoints} from "../Mocks/N/types";
import pageInitContext = EntryPoints.Client.pageInitContext;
import validateFieldContext = EntryPoints.Client.validateFieldContext;

describe('LeaveType, ClientScript', () => {

    it('should init', function () {
        pageInitContext.currentRecord = new LeaveType().setRecord(1)._record;

        ['create', 'copy', 'edit'].forEach((value: any) => {
            expect(() => {

                pageInitContext.mode = value;
                ClientScript.pageInit(pageInitContext)

            }).not.toThrowError();
        });

    });

    it('should validate', function () {
        validateFieldContext.currentRecord = new LeaveType().setRecord(1)._record;
        validateFieldContext.fieldId = 'fld_id';
        ClientScript.validateField(validateFieldContext)
    });

});