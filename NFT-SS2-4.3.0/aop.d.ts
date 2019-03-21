/**
* jQuery AOP - jQuery plugin to add features of aspect-oriented programming (AOP) to jQuery.
* http://jquery-aop.googlecode.com/
*
* Licensed under the MIT license:
* http://www.opensource.org/licenses/mit-license.php
*
* Version: 1.3
*
* Cross-frame type detection based on Daniel Steigerwald's code (http://daniel.steigerwald.cz)
* http://gist.github.com/204554
*
*/
declare var aop: {
    /**
     * Creates an advice after the defined point-cut. The advice will be executed after the point-cut method
     * has completed execution successfully, and will receive one parameter with the result of the execution.
     * This function returns an array of weaved aspects (Function).
     *
     * @example aop.after( {target: window, method: 'MyGlobalMethod'}, function(result) {
     *                alert('Returned: ' + result);
     *                return result;
     *          } );
     * @result Array<Function>
     *
     * @example aop.after( {target: String, method: 'indexOf'}, function(index) {
     *                alert('Result found at: ' + index + ' on:' + this);
     *                return index;
     *          } );
     * @result Array<Function>
     *
     * @name after
     * @param Map pointcut Definition of the point-cut to apply the advice. A point-cut is the definition of the object/s and method/s to be weaved.
     * @option Object target Target object to be weaved.
     * @option String method Name of the function to be weaved. Regex are supported, but not on built-in objects.
     * @param Function advice Function containing the code that will get called after the execution of the point-cut. It receives one parameter
     *                        with the result of the point-cut's execution. The function can choose to return this same value or a different one.
     *
     * @type Array<Function>
     * @cat Plugins/General
     */
    after: (pointcut: any, advice: any) => any;
    /**
     * Creates an advice after the defined point-cut only for unhandled exceptions. The advice will be executed
     * after the point-cut method only if the execution failed and an exception has been thrown. It will receive one
     * parameter with the exception thrown by the point-cut method.
     * This function returns an array of weaved aspects (Function).
     *
     * @example aop.afterThrow( {target: String, method: 'indexOf'}, function(exception) {
     *                alert('Unhandled exception: ' + exception);
     *                return -1;
     *          } );
     * @result Array<Function>
     *
     * @example aop.afterThrow( {target: calculator, method: 'Calculate'}, function(exception) {
     *                console.log('Unhandled exception: ' + exception);
     *                throw exception;
     *          } );
     * @result Array<Function>
     *
     * @name afterThrow
     * @param Map pointcut Definition of the point-cut to apply the advice. A point-cut is the definition of the object/s and method/s to be weaved.
     * @option Object target Target object to be weaved.
     * @option String method Name of the function to be weaved. Regex are supported, but not on built-in objects.
     * @param Function advice Function containing the code that will get called after the execution of the point-cut. It receives one parameter
     *                        with the exception thrown by the point-cut method.
     *
     * @type Array<Function>
     * @cat Plugins/General
     */
    afterThrow: (pointcut: any, advice: any) => any;
    /**
     * Creates an advice after the defined point-cut. The advice will be executed after the point-cut method
     * regardless of its success or failure, and it will receive two parameters: one with the
     * result of a successful execution or null, and another one with the exception thrown or null.
     * This function returns an array of weaved aspects (Function).
     *
     * @example aop.afterFinally( {target: window, method: 'MyGlobalMethod'}, function(result, exception) {
     *                if (exception == null)
     *                    return 'Returned: ' + result;
     *                else
     *                    return 'Unhandled exception: ' + exception;
     *          } );
     * @result Array<Function>
     *
     * @name afterFinally
     * @param Map pointcut Definition of the point-cut to apply the advice. A point-cut is the definition of the object/s and method/s to be weaved.
     * @option Object target Target object to be weaved.
     * @option String method Name of the function to be weaved. Regex are supported, but not on built-in objects.
     * @param Function advice Function containing the code that will get called after the execution of the point-cut regardless of its success or failure.
     *                        It receives two parameters, the first one with the result of a successful execution or null, and the second one with the
     *                        exception or null.
     *
     * @type Array<Function>
     * @cat Plugins/General
     */
    afterFinally: (pointcut: any, advice: any) => any;
    /**
     * Creates an advice before the defined point-cut. The advice will be executed before the point-cut method
     * but cannot modify the behavior of the method, or prevent its execution.
     * This function returns an array of weaved aspects (Function).
     *
     * @example aop.before( {target: window, method: 'MyGlobalMethod'}, function() {
     *                alert('About to execute MyGlobalMethod');
     *          } );
     * @result Array<Function>
     *
     * @example aop.before( {target: String, method: 'indexOf'}, function(index) {
     *                alert('About to execute String.indexOf on: ' + this);
     *          } );
     * @result Array<Function>
     *
     * @name before
     * @param Map pointcut Definition of the point-cut to apply the advice. A point-cut is the definition of the object/s and method/s to be weaved.
     * @option Object target Target object to be weaved.
     * @option String method Name of the function to be weaved. Regex are supported, but not on built-in objects.
     * @param Function advice Function containing the code that will get called before the execution of the point-cut.
     *
     * @type Array<Function>
     * @cat Plugins/General
     */
    before: (pointcut: any, advice: any) => any;
    /**
     * Creates an advice 'around' the defined point-cut. This type of advice can control the point-cut method execution by calling
     * the functions '.proceed()' on the 'invocation' object, and also, can modify the arguments collection before sending them to the function call.
     * This function returns an array of weaved aspects (Function).
     *
     * @example aop.around( {target: window, method: 'MyGlobalMethod'}, function(invocation) {
     *                alert('# of Arguments: ' + invocation.arguments.length);
     *                return invocation.proceed();
     *          } );
     * @result Array<Function>
     *
     * @example aop.around( {target: String, method: 'indexOf'}, function(invocation) {
     *                alert('Searching: ' + invocation.arguments[0] + ' on: ' + this);
     *                return invocation.proceed();
     *          } );
     * @result Array<Function>
     *
     * @example aop.around( {target: window, method: /Get(\d+)/}, function(invocation) {
     *                alert('Executing ' + invocation.method);
     *                return invocation.proceed();
     *          } );
     * @desc Matches all global methods starting with 'Get' and followed by a number.
     * @result Array<Function>
     *
     *
     * @name around
     * @param Map pointcut Definition of the point-cut to apply the advice. A point-cut is the definition of the object/s and method/s to be weaved.
     * @option Object target Target object to be weaved.
     * @option String method Name of the function to be weaved. Regex are supported, but not on built-in objects.
     * @param Function advice Function containing the code that will get called around the execution of the point-cut. This advice will be called with one
     *                        argument containing one function '.proceed()', the collection of arguments '.arguments', and the matched method name '.method'.
     *
     * @type Array<Function>
     * @cat Plugins/General
     */
    around: (pointcut: any, advice: any) => any;
    /**
     * Creates an introduction on the defined point-cut. This type of advice replaces any existing methods with the same
     * name. To restore them, just unweave it.
     * This function returns an array with only one weaved aspect (Function).
     *
     * @example aop.introduction( {target: window, method: 'MyGlobalMethod'}, function(result) {
     *                alert('Returned: ' + result);
     *          } );
     * @result Array<Function>
     *
     * @example aop.introduction( {target: String, method: 'log'}, function() {
     *                alert('Console: ' + this);
     *          } );
     * @result Array<Function>
     *
     * @name introduction
     * @param Map pointcut Definition of the point-cut to apply the advice. A point-cut is the definition of the object/s and method/s to be weaved.
     * @option Object target Target object to be weaved.
     * @option String method Name of the function to be weaved.
     * @param Function advice Function containing the code that will be executed on the point-cut.
     *
     * @type Array<Function>
     * @cat Plugins/General
     */
    introduction: (pointcut: any, advice: any) => any;
    /**
     * Configures global options.
     *
     * @name setup
     * @param Map settings Configuration options.
     * @option Boolean regexMatch Enables/disables regex matching of method names.
     *
     * @example aop.setup( { regexMatch: false } );
     * @desc Disable regex matching.
     *
     * @type Void
     * @cat Plugins/General
     */
    setup: (settings: any) => void;
};
export = aop;
