define(["require", "exports", "../../Core/BaseModel"], function (require, exports, BaseModel_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function pageInit(context) {
        alert('Deployed!');
        var empVacBalance = new BaseModel_1.BaseModel('customrecord_edc_emp_vac_balance');
        empVacBalance.where({
            fieldId: 'custrecord_edc_vac_balance_emp_name',
            fieldType: 'list',
            operator: '==',
            fieldValue: 4
        }).where({
            fieldId: 'custrecord_edc_vac_balance_year',
            fieldType: 'string',
            operator: '==',
            fieldValue: new Date().getFullYear()
        }).find(BaseModel_1.DataType.value, 1, ['custrecord_edc_vac_balance_annual', 'custrecord_edc_vac_balance_casual']);
        debugger;
        console.log(empVacBalance);
    }
    exports.pageInit = pageInit;
});
