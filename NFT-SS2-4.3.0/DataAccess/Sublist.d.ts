/**
 * Represents Sublists and their field access. Sublists use a different api than body fields in NS.
 * Note that in NFT-SS1.0 we collapsed the sublist and body descriptors into a common codebase. Decided not to do
 * that here (yet) in interest of code clarity. Also the fact that it's only two copies (usually use the rule of
 * three's for DRY).
 */
/// <reference types="lodash" />
import * as record from 'N/record';
import * as format from 'N/format';
import * as _ from '../lodash';
/**
 * decorators for sublist fields. Adorn your class properties with these to bind your class property name with
 * the specific behavior for the type of field it represents in NetSuite.
 */
export declare namespace SublistFieldType {
    var checkbox: typeof defaultSublistDescriptor;
    var currency: typeof defaultSublistDescriptor;
    var date: typeof defaultSublistDescriptor;
    var datetime: typeof defaultSublistDescriptor;
    var email: typeof defaultSublistDescriptor;
    var freeformtext: typeof defaultSublistDescriptor;
    var decimalnumber: typeof defaultSublistDescriptor;
    var float: typeof defaultSublistDescriptor;
    var hyperlink: typeof defaultSublistDescriptor;
    var image: typeof defaultSublistDescriptor;
    var inlinehtml: typeof defaultSublistDescriptor;
    var integernumber: typeof defaultSublistDescriptor;
    var longtext: typeof defaultSublistDescriptor;
    var multiselect: typeof defaultSublistDescriptor;
    var percent: _.Function2<any, string, any>;
    var select: typeof defaultSublistDescriptor;
    var textarea: typeof defaultSublistDescriptor;
}
/**
 * Generic property descriptor with basic default algorithm that exposes the field value directly with no
 * other processing.
 * @returns an object property descriptor to be used
 * with Object.defineProperty
 */
export declare function defaultSublistDescriptor(target: any, propertyKey: string): any;
/**
 * Generic property descriptor with algorithm for values that need to go through the NS format module
 * note: does not take into account timezone
 * @param {string} formatType the NS field type (e.g. 'date')
 * @param target
 * @param propertyKey
 * @returns  an object property descriptor to be used
 * with decorators
 */
export declare function formattedSublistDescriptor(formatType: format.Type, target: any, propertyKey: string): any;
/**
 * creates a sublist whose lines are of type T
 */
export declare class Sublist<T extends SublistLine> {
    readonly sublistLineType: {
        new (sublistId: string, nsrec: record.Record, line: number): T;
    };
    sublistId: string;
    nsrecord: record.Record;
    [i: number]: T;
    /**
     * array-like length property (linecount)
     * @returns {number} number of lines in this list
     */
    readonly length: number;
    /**
     * adds a new line to this sublist
     * @param ignoreRecalc
     */
    addLine(ignoreRecalc?: boolean): T;
    /**
     * Removes all existing lines of this sublist, leaving effectively an empty array
     * @param ignoreRecalc passed through to nsrecord.removeLine (ignores firing recalc event as each line is removed )
     */
    removeAllLines(ignoreRecalc?: boolean): this;
    /**
     * commits the currently selected line on this sublist. When adding new lines you don't need to call this method
     */
    commitLine(): void;
    selectLine(line: number): void;
    /**
     * Defines a descriptor for nsrecord so as to prevent it from being enumerable. Conceptually only the
     * field properties defined on derived classes should be seen when enumerating
     * @param value
     */
    private makeRecordProp;
    constructor(sublistLineType: {
        new (sublistId: string, nsrec: record.Record, line: number): T;
    }, rec: record.Record, sublistId: string);
    toJSON(): any[];
}
/**
 * contains minimum requirements for a sublist line - 1. which sublist are we working with, 2. on which record
 * 3. which line on the sublist does this instance represent
 */
export declare abstract class SublistLine {
    sublistId: string;
    _line: number;
    /**
     * Defines a descriptor for nsrecord so as to prevent it from being enumerable. Conceptually only the
     * field properties defined on derived classes should be seen when enumerating
     * @param value
     */
    protected makeRecordProp(value: any): void;
    nsrecord: record.Record;
    /**
     * Note that the sublistId and _line are used by the Sublist decorators to actually implement functionality, even
     * though they are not referenced directly in this class. We mark them as not-enumerable because they are an implementation
     * detail and need not be exposed to the typical consumer
     * @param {string} sublistId netsuite internal id (string name) of the sublist
     * @param {Record} rec netsuite record on which the sublist exists
     * @param {number} _line the line number needed in decorator calls to underlying sublist. That's also why this is
     * public - so that the decorators have access to it.
     */
    constructor(sublistId: string, rec: record.Record, _line: number);
}
