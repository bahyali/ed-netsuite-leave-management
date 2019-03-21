import * as moment from "./moment";
/**
 * returns a predicate function which returns true if we're not out of governance, false if we have reached time
 * remaining and/or units thresholds.
 * @param starttime when to start counting elapsed time for clock-time governance, defaults to 'now'
 * @param units threshold for minimum remaining governance units
 * @param minutes threshold for maximum number of minutes allowed to elapse
 * @example
 *
 * // defaults to 200 units threshold and starts elapsed time tracking at this invocation
 * sequence.takeWhile(governanceRemains())
 *
 */
export declare const governanceRemains: (starttime?: moment.Moment, minutes?: number, units?: number) => () => boolean;
/**
 * Reschedules the current script using the same deployment id if we're out of governance
 * @param params optional script parameters to provide to the newly scheduled script
 * @param governancePredicate governance checker - if it returns false then script will reschedule.
 * typically this would be your invocation of `governanceRemains()`
 * @example
 * results.takeWhile( rescheduleIfNeeded(governanceRemains()) ).filter(...).map(...)
 * @returns a function that returns the same boolean that the governancePredicate() does
 * ( so it can be invoked by takeWhile() as well)
 *
 */
export declare function rescheduleIfNeeded(governancePredicate: () => boolean, params?: object): () => boolean;
