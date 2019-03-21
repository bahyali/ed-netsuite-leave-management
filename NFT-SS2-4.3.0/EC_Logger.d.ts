/**
 * Provides a rich logging facility with more control and flexibility than the native NetSuite logger.
 *
 * Utilizes the [Aurelia logger](https://aurelia.io/docs/api/logging) under the hood.
 * This logger library adopts the common pattern of separating _how_ you log
 * (e.g. `log.debug()`) from _where_ the log messages are sent.
 *
 * By default, log messages are sent to the NetSuite Execution Log - *except* for client scripts which log to the
 * *browser console* by default.
 *
 * You can create as many named loggers as you like, but most often you'll work with the [Default Logger](#defaultlogger)
 *
 * @NApiVersion 2.x
 */
import { Appender, Logger } from './aurelia-logging';
export { logLevel, Logger, getAppenders, clearAppenders, addAppender, getLogger, removeAppender, addCustomLevel, getLevel, setLevel, removeCustomLevel, Appender } from './aurelia-logging';
/**
 * Value to be prepended to each log message title. Defaults to a random 4 digit integer
 */
export declare let correlationId: string;
/**
 * if true then log message include a random integer (or your custom) prefix to each log entry title.
 * which is fixed for the duration of this script run. This can be used to correlate between different runs
 * of the same script (e.g. multiple runs of a scheduled script or discerning between multiple simultaneous calls
 * to a RESTlet or Suitelet)
 */
export declare let includeCorrelationId: boolean;
/**
 * Controls whether the correlation id prefixes should be included in log messages or not.
 * @param enable if true, adds correlationid to the log messages, otherwise no correlation id prefix is added
 * returns the newly set value
 */
export declare const setIncludeCorrelationId: (enable: boolean) => boolean;
/**
 * Log appender targeting the NS execution log
 * Severities are mapped as follows:
 *
 * debug -> NS 'DEBUG'
 *
 * info -> NS 'AUDIT'
 *
 * warn -> NS 'ERROR'
 *
 * error -> NS 'EMERGENCY'
 */
export declare class ExecutionLogAppender implements Appender {
    debug(logger: Logger, ...rest: any[]): void;
    /**
     * Info about info
     * @param logger
     * @param rest
     */
    info(logger: Logger, ...rest: any[]): void;
    warn(logger: Logger, ...rest: any[]): void;
    error(logger: Logger, ...rest: any[]): void;
}
/**
 * Uses AOP to automatically log method entry/exit with arguments to the netsuite execution log.
 * Call this method at the end of your script. Log entries are 'DEBUG' level by default but may be overridden
 * as described below.
 *
 * @param methodsToLogEntryExit array of pointcuts
 * @param {Object} config configuration settings
 * @param {Boolean} [config.withArgs] true if you want to include logging the arguments passed to the method in the
 * details. Default is true.
 * @param {Boolean} [config.withReturnValue] true if you want function return values to be logged
 * @param {Boolean} [config.withProfiling] set true if you want elapsed time info printed for each function
 * @param {Boolean} [config.withGovernance] set true if you want remaining governance units info printed for
 * each function
 * false. Colors not configurable so that we maintain consistency across all our scripts.
 * @param {number} [config.logType] the logging level to use, logLevel.debug, logLevel.info, etc.
 * @returns {} an array of jquery aop advices
 *
 * @example log all methods on the object `X`
 * ```
 * namespace X {
 *   export onRequest() {
 *     log.debug('hello world')
 *   }
 * }
 * LogManager.autoLogMethodEntryExit({ target:X, method:/\w+/})
 *
 * ```
 * The above results in automatic log entries similar to:
 *
 * |Log Title   | Detail |
 * |--------|--------|
   |Enter onRequest()| args:[] |
   |hello world |   |
   |Exit onRequest() | returned: undefined |
 */
export declare function autoLogMethodEntryExit(methodsToLogEntryExit: {
    target: Object;
    method: string | RegExp;
}, config?: AutoLogConfig): any;
/**
 * Configuration options for AutoLogMethodEntryExit
 */
export interface AutoLogConfig {
    /**
     * set true to include automatically include passed method arguments in the logs
     */
    withArgs?: boolean;
    /**
     * If true, includes the function return value in the log
     */
    withReturnValue?: boolean;
    /**
     * If true, including function (execution time) statistics
     */
    withProfiling?: boolean;
    /**
     * If true, includes governance before and after function execution
     */
    withGovernance?: boolean;
    /**
     * Name of logger to use for autologging, defaults to 'default'
     */
    logger?: Logger;
    /**
     * The logging level autologging uses - defaults to 'debug'
     */
    logLevel?: number;
}
/**
 * The default logger - this should be the main top level logger used in scripts
 *
 * This logger defaults to log level 'debug' and is named 'default'.
 * For client scripts, it logs to the _browser console_ (not NS execution log because it incurs significant
 * overhead). For server-side scripts it logs to the NS Exectuion Log.
 *
 * @example To make a client script log to both the local browser console and the NS script execution log
 *```
 * import * as LogManager from "./NFT/EC_Logger"
 *
 * LogManager.addAppender(new LogManager.ExecutionLogAppender())
 *```
 * @example
 *```
 * import * as LogManager from "./NFT/EC_Logger"
 * const log = LogManager.DefaultLogger
 * log.debug('hello world')
 * ```
 */
export declare let DefaultLogger: Logger;
/**
 * Use to set the correlation id to a value other than the default random number
 * @param value new correlation id, will be used on all subsequent log messages
 */
export declare const setCorrelationId: (value: string) => string;
