# NetSuite Wrapper
A wrapper for speedy development on NetSuite.

## Features
- Model & Query Builder inspired by Eloquent and ActiveRecord.
- Error Handling & Logging
- Seamless integration with Suitescript 2.0 (You can just import Suitescript Modules)

**Included Examples**
- [Custom Leave Management](https://github.com/bahyali/ed-netsuite-leave-management/tree/master/src/Records)
- [Payroll](https://github.com/bahyali/ed-netsuite-leave-management/tree/master/src/Payroll)

**Technologies:**
- [NetSuite](www.netsuite.com/portal/home.shtml)
- [SuiteScript 2.0](https://docs.oracle.com/cloud/latest/netsuitecs_gs/NSAPI/NSAPI.pdf)
- [TypeScript](https://www.typescriptlang.org/docs/home.html)
- [Jest](https://github.com/facebook/jest)

**Key Concepts:**
- [Abstraction Layer](https://en.wikipedia.org/wiki/Abstraction_layer)
- [AMD](https://github.com/amdjs/amdjs-api/blob/master/AMD.md)
## Getting Started
### High level use
1. Create a new Record on Netsuite
2. Create a new Model extending [BaseModel](https://github.com/bahyali/ed-netsuite-leave-management/blob/master/src/Core/Model/BaseModel.ts)
3. Map Column Types
4. Build Relations

### Example
```js
import {LeaveBalance} from '../LeaveBalance/LeaveBalance';
import {BaseModel, ColumnType} from '../../Core/Model/BaseModel';


export class Employee extends BaseModel {
    
    recordType = 'employee';

    typeMap = {
        'jobtitle': ColumnType.STRING,
        'subsidiary': ColumnType.LIST,
        'supervisor': ColumnType.LIST,
        'department': ColumnType.LIST,
    };

    // Default columns
    columns: string[] = ['jobtitle'];

    relations = {
        vacationBalance: (model, year) => {
            // Access SuiteScript Record with ._record
            let idField = model._record.getValue('id');
            return new LeaveBalance()
                .where('emp_name', '==', idField)
                .where('year', '==', year);
        }
    }
    
    // validation
    validation = {
      'jobtitle': ['isNotEmpty'],
      'supervisor': [(field, model) => { return true }]
    }
    
```
**Transpile Project**

```
npm transpile
```
_OR_
```
tsc
```

### Testing
**Run tests**
```
npm test
```
### Testing Resources
- [ts-jest](https://github.com/kulshekhar/ts-jest)

Please check these repos for more details about these packages
- [SuiteScript 2.0 Typings](https://github.com/headintheclouddev/typings-suitescript-2.0)
- [Class Validator](https://github.com/typestack/class-validator)
