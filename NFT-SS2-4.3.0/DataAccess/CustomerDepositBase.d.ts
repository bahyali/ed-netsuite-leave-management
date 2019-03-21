/**
 * Base Customer Deposit (customerdeposit) definition
 */
import { TransactionBase } from './Transaction';
import * as record from 'N/record';
/**
 * NetSuite Customer Deposit Record 'customerdeposit'
 */
export declare class CustomerDepositBase extends TransactionBase {
    static recordType: record.Type;
    account: number;
    currency: number;
    customer: number;
    paymentmethod: number;
    salesorder: number;
    payment: string;
}
