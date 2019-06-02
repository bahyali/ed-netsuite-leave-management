/**
 * @NScriptName ClientScript - Salary
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

import {EntryPoints} from "N/types";
import {Salary} from "./Salary";
import {search} from "N";
import {Result} from "N/search";

let taxTiers = {};

let total = {
    insurance: null,
    taxes: null,
    tax_credit: null,
};

function trimPercentage(value) {
    return value.toString()
        .replace('%', '');
}

function pageInit(context: EntryPoints.Client.pageInitContext) {
    let salary = new Salary().createFromRecord(context.currentRecord);

    search.load({id: "customsearch_edc_srch_pr_tax_tiers"}).run()
        .each(function (result: Result) {
            taxTiers[Number(result.getValue('custrecord_edc_pr_tax_tier_from'))] = {
                name: result.getValue('name'),
                to: result.getValue('custrecord_edc_pr_tax_tier_to') ? result.getValue('custrecord_edc_pr_tax_tier_to') : null,
                taxRate: result.getValue('custrecord_edc_pr_tax_tax_rate') ? Number(trimPercentage(result.getValue('custrecord_edc_pr_tax_tax_rate'))) / 100 : 0,
                taxCredit: result.getValue('custrecord_edc_pr_tax_tax_credit') ? Number(trimPercentage(result.getValue('custrecord_edc_pr_tax_tax_credit')))
                    / 100 : 0,
            };

            return true;
        });


    calculateInsurance(salary);
    calculateTaxes(salary);
}


function fieldChanged(context: EntryPoints.Client.fieldChangedContext) {
    let salary = new Salary().createFromRecord(context.currentRecord);
    let field = salary.getField(salary.removePrefix(context.fieldId));

    // recalculate insurance
    if (field._id == 'personal_insurance' || field._id == 'basic_salary') {
        calculateInsurance(salary);
        calculateTaxes(salary);
        calculateSalary(salary);
    }

}

function calculateInsurance(salary: Salary) {
    const percentages = {
        'ins_basic': Number(salary.getField('ins_basic_percent').value) / 100,
        'ins_variable': Number(salary.getField('ins_var_percent').value) / 100
    };

    let amounts = {
        'personal_insurance': Number(salary.getField('personal_insurance').value),
        'ins_basic': Number(salary.getField('ins_basic').value),
        'ins_var': Number(salary.getField('ins_var').value)
    };

    let insurance = (amounts.ins_basic * percentages.ins_basic) + (amounts.ins_var * percentages.ins_variable);

    let totalInsurance = total.insurance =
        Number(amounts.personal_insurance + insurance);

    // show on UI
    salary.getField('total_insurance').value
        = totalInsurance.toFixed(2);

    return totalInsurance;
}

function calculateTaxes(salary: Salary) {
    let tiers = prepareTiers();

    // Annual Salary Before Tax (Basic - insurance) * 12
    let annualSalary = (Number(salary.getField('basic_salary').value) - total.insurance) * 12;
    annualSalary = annualSalary - Number(salary.getField('tax_exemption').value);

    // If no taxes. //dirty
    if (!annualSalary) {
        total.taxes = 0.0;
        // Update UI
        salary.getField('total_taxes').value = 0.0;
        return;
    }

    let annualTaxes = 0;

    if (annualSalary < 0)
        annualSalary = 1;

    let salaryTiers = Object.keys(tiers).map((amount) => {
        return Number(amount);
    }).filter((amount) => {
        return annualSalary > amount;
    }).sort((a, b) => a - b);

    let currentSalaryTierFrom = salaryTiers.pop();
    let currentTier = tiers[currentSalaryTierFrom];

    if (salaryTiers.length > 0) {
        salaryTiers.forEach(function (tierFrom) {
            let tier = tiers[tierFrom];
            annualTaxes += (Number(tier.to) - Number(tierFrom)) * tier.taxRate;
        });
    }

    annualTaxes += (annualSalary - Number(currentSalaryTierFrom)) * currentTier.taxRate;

    let annualTaxCredit = annualTaxes * currentTier.taxCredit;

    let totalTaxes = total.taxes = annualTaxes - annualTaxCredit;

    salary.getField('total_taxes').value = totalTaxes.toFixed(2);

    salary.getField('tax_tier').value = currentTier.name;
    salary.getField('tax_rate').value = currentTier.taxRate * 100;
    salary.getField('tax_credit').value = currentTier.taxCredit * 100;

    return totalTaxes;
}

function calculateSalary(salary: Salary) {
    let basicSalary = Number(salary.getField('basic_salary').value);
    let salaryBeforeTax = Number(salary.getField('basic_salary').value) - total.insurance;
    let monthlyTaxes = total.taxes / 12;

    let netSalary = basicSalary - monthlyTaxes - total.insurance;

    salary.getField('net_salary').value = netSalary.toFixed(2);
    salary.getField('salary_bf_tax').value = salaryBeforeTax.toFixed(2);

    return netSalary;
}

function prepareTiers(): object {
    return taxTiers;
}

export = {
    pageInit: pageInit,
    fieldChanged: fieldChanged
}