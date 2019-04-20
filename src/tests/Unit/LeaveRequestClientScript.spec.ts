import {LeaveRequest} from "../../Records/LeaveRequest/LeaveRequest";
import ClientScript from '../../Records/LeaveRequest/cs_leave_request';
import {EntryPoints} from "../Mocks/N/types";
import pageInitContext = EntryPoints.Client.pageInitContext;
import validateFieldContext = EntryPoints.Client.validateFieldContext;

describe('LeaveRequest ClientScript', () => {

    it('should init', function () {
        pageInitContext.currentRecord = new LeaveRequest().setRecord(1)._record;

        ['create', 'copy', 'edit'].forEach((value: any) => {
            expect(() => {

                pageInitContext.mode = value;
                ClientScript.pageInit(pageInitContext)

            }).not.toThrowError();
        });

    });


});