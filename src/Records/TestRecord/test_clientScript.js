/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(["require", "exports", "N/runtime", "../../Core/BaseModel"], function (require, exports, runtime, BaseModel_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function pageInit(context) {
        // alert('Deployed!\nThe Script is running....');
        // Records IDs
        var vacBalance_Record = 'customrecord_edc_emp_vac_balance';
        // Fields IDs
        var annualBalance_Fld = 'custrecord_edc_vac_balance_annual';
        var casualBalance_Fld = 'custrecord_edc_vac_balance_casual';
        var unpaidBalance_Fld = 'custrecord_edc_vac_balance_unpaid';
        var totalRegual_Fld = 'custrecord_edc_vac_balance_total_regular';
        var emp_Fld = 'custrecord_edc_vac_balance_emp_name';
        var year_Fld = 'custrecord_edc_vac_balance_year';
        debugger;
        // Get a specific record
        // let specificVacBalance = new BaseModel(vacBalance_Record);
        // let empResults_01 = specificVacBalance.get(3904, DataType.value, [annualBalance_Fld, casualBalance_Fld]);
        // alert(annualBalance_Fld + ': ' + empResults_01[annualBalance_Fld] + '\n'
        //     + casualBalance_Fld + ': ' + empResults_01[casualBalance_Fld]);
        // debugger;
        // Search for a record
        var empVacBalance = new BaseModel_1.BaseModel(vacBalance_Record);
        var _empResults = empVacBalance
            .where(emp_Fld, 'list', '==', runtime.getCurrentUser().id);
        // .where(year_Fld, 'string', '==', new Date().getFullYear())
        var empName = _empResults.find('text', [emp_Fld], 1);
        var empResults = _empResults.find('value', [annualBalance_Fld, totalRegual_Fld, casualBalance_Fld, unpaidBalance_Fld, year_Fld], 10);
        var itemsCount = 1;
        if (empResults instanceof Array) {
            itemsCount = empResults.length;
        }
        var empInfo = "Name:\t " + empName[emp_Fld];
        for (var i = 0; i < itemsCount; i++) {
            empInfo += "\n ---------------------------------------------------\n Year:\t\t " + empResults[i][year_Fld] + "\n Annual Balance:\t " + empResults[i][annualBalance_Fld] + "\n Casual Balance:\t " + empResults[i][casualBalance_Fld] + "\n Unpaid Balance:\t " + empResults[i][unpaidBalance_Fld] + "\n Total Regular Balance:\t " + empResults[i][totalRegual_Fld];
        }
        context.currentRecord.setValue('custrecord_test_01', empInfo);
    }
    exports.pageInit = pageInit;
});
// empVacBalance.where({
//     fieldId: 'custrecord_edc_vac_balance_emp_name',
//     fieldType: 'list',
//     operator: '==',
//     fieldValue: 4
// }).where({
//     fieldId: 'custrecord_edc_vac_balance_year',
//     fieldType: 'string',
//     operator: '==',
//     fieldValue: new Date().getFullYear()
// }).find(DataType.value, 1, ['custrecord_edc_vac_balance_annual', 'custrecord_edc_vac_balance_casual']);
