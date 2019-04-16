#Records Validations


## Vacation Type

### Mapping
- Must be unique.
- Must not be empty. *(Can be ignored)*
### Max. No. Of Days Per Submission
- Cannot be more than the days limit.
#### Frequent Value and Frequent Type
- If any of them has a value, the other field must be mandatory and vice versa.



## Vacation Rule

### Subsidiary
- Must be unique in the same `year`.
### Week-End Days
- Must be enabled when `WEEKENDS NOT DEDUCTED FROM VACATION BALANCE` check-box is checked and vice versa.


## Vacation Request

### Employee
- Must be disabled when the current user is not an admin or HR specialist.
- Must not be empty.

### Vacation Type
- Must not be empty

### Vacation Start Date
- Can accept past dates only if the `LeaveRule` for the selected employee's `Subsidiary` in this year allows accepting the past dates for the selected `Vacation Type`.
- *RELATION:* Cannot be later than the `Vacation End Date`.

### Vacation End Date
- Cannot accept past dates except if the `LeaveRule` for the selected employee's `Subsidiary` in this year allows accepting the past dates for the selected `Vacation Type`.
- Must not be later than `Vacation Start Date`.
- *Relation:* Cannot enter a date that will count leave days more than the balance the employee has.

**Vacation Start Date & Vacation End Date**
If they have the same date and the selected `Vacation Type` is set to `Annual` (Regular):
- Make `Leave Days` euqal to `0` and hide it.
- Enable `Part-Day Leave` field.
*Should be reversed if the `Vacation Type` is changed or one of the **date fields**.*

### Leave Days *OR* `Part-Day Leave
- If the selected `Vacation Type` is set to `Casual`, `Sick` or `Replacemet`,should dedcut the value of LeaveDays from the selected balance.
- If the selected `Type` is set to `Unpaid`, it increments the `Unpaid Balance`.
- If the selected `Type` is set to `Annual`, it first deduct from the `Transferred Balance` *(If having enough balance)* then deduct from `Annual Balance`.
- If the selected `Type` is any other option it won't affect in any of standard balances.




## Business Trip

### Employee
The same as the one in **Vacation Request**.

### Departure Date
- Must not be in the past.

### Return Date
- Must not be in the past.
- Must not be later than `Departure Date`.

**Departure and Return Date** when filled must change the `Trip Days` to the calculated number of days *(They asked also to calculate holidays and weekends and push the value of these holidays in the `Replacement Days` field)*

**Trip Expenses Fields:** any of them must change the value of Total Expenses fields in EUR & EGP based on their `Currency` selected.




## Permissions

### Employee
The same as the records above

### Remaining Permissions Period
- Calculate all permission record in this month at the PageInit.

## Permission Period
- Must not select a value more than it is allowed in `Remaining Permissions Period`.
- If the value is less than or equal to `Reamining Permissions`, it must deduct this value from it.



## Missions
### Employee
The same as the records above