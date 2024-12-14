# Mini-SQL-Database

A file-based SQL database that parses and executes SQL statements, implements indexing for optimization, and provides concurrency control with a locking mechanism.

## Folder Structure

```plaintext
Mini-SQL-Database/
|--- lib/
|    |--- backup.js      # Backup and restore operations
|    |--- indexing.js    # Indexing and search operations
|    |--- locks.js       # Locking and unlocking tables
|    |--- mutex.js       # Mutex implementation for table locks
|    |--- query.js       # Query parsing and execution
|    |--- storage.js     # Creating JSON files to run read/write operations
|--- logger/
|    |--- logger.js      # Logging utilities
|--- test/
|    |--- test_db.js     # All test functions
|--- .env                # Environment variables (Create your own)
|--- .gitignore          # Ignored files and folders
|--- .npmrc              # NPM configuration
|--- index.js            # Entry point (re-exports required functions)
|--- package.json
|--- README.md
```

## Setup

- Clone the project
- Run `npm install` inside the project
- Create a `.env` file at root
- Add `MINI_SQL_DB_PATH="./database/"` in `.env` file

## Test

- Run `node test/test_db.js` # This is the test file of all library functions

### Last known Output

```bash
[14 Dec 2024, 07:00:38 am] [SUCCESS] Table 'users' created successfully
[14 Dec 2024, 07:00:38 am] [TEST] Table creation test passed

[14 Dec 2024, 07:00:38 am] [SUCCESS] Row inserted into table 'users' successfully
[14 Dec 2024, 07:00:38 am] [SUCCESS] Row inserted into table 'users' successfully
[14 Dec 2024, 07:00:38 am] [SUCCESS] Row inserted into table 'users' successfully
[14 Dec 2024, 07:00:38 am] [SUCCESS] Row inserted into table 'users' successfully
[14 Dec 2024, 07:00:38 am] [TEST] Insertion test passed

[14 Dec 2024, 07:00:38 am] [SUCCESS] SELECT Query executed successfully
┌─────────┬─────┬───────────┐
│ (index) │ age │ name      │
├─────────┼─────┼───────────┤
│ 0       │ 19  │ 'Zyad'    │
│ 1       │ 20  │ 'Mohamed' │
│ 2       │ 22  │ 'Zyad'    │
│ 3       │ 19  │ 'Ahmed'   │
└─────────┴─────┴───────────┘
[14 Dec 2024, 07:00:38 am] [SUCCESS] SELECT Query executed successfully
┌─────────┬────┬───────────┬─────┐
│ (index) │ id │ name      │ age │
├─────────┼────┼───────────┼─────┤
│ 0       │ 13 │ 'Zyad'    │ 19  │
│ 1       │ 1  │ 'Mohamed' │ 20  │
│ 2       │ 2  │ 'Zyad'    │ 22  │
│ 3       │ 99 │ 'Ahmed'   │ 19  │
└─────────┴────┴───────────┴─────┘
[14 Dec 2024, 07:00:38 am] [TEST] Selection test passed

[14 Dec 2024, 07:00:38 am] [SUCCESS] SELECT Query executed successfully
┌─────────┬─────┬───────────┐
│ (index) │ age │ name      │
├─────────┼─────┼───────────┤
│ 0       │ 20  │ 'Mohamed' │
│ 1       │ 22  │ 'Zyad'    │
└─────────┴─────┴───────────┘
[14 Dec 2024, 07:00:38 am] [SUCCESS] SELECT Query executed successfully
┌─────────┬────┬─────────┬─────┐
│ (index) │ id │ name    │ age │
├─────────┼────┼─────────┼─────┤
│ 0       │ 99 │ 'Ahmed' │ 19  │
└─────────┴────┴─────────┴─────┘
[14 Dec 2024, 07:00:38 am] [TEST] Selection with Where test passed

[14 Dec 2024, 07:00:38 am] [SUCCESS] SELECT Query executed successfully
┌─────────┬─────┐
│ (index) │ avg │
├─────────┼─────┤
│ 0       │ 21  │
│ 1       │ 1.5 │
└─────────┴─────┘
[14 Dec 2024, 07:00:38 am] [SUCCESS] SELECT Query executed successfully
┌─────────┬───────┐
│ (index) │ count │
├─────────┼───────┤
│ 0       │ 1     │
└─────────┴───────┘
[14 Dec 2024, 07:00:38 am] [TEST] Selection with Aggregations test passed

[14 Dec 2024, 07:00:38 am] [SUCCESS] Index created successfully on column 'name' of table 'users'
[14 Dec 2024, 07:00:38 am] [SUCCESS] Index created successfully on column 'age' of table 'users'
[14 Dec 2024, 07:00:38 am] [TEST] Index creation test passed

[14 Dec 2024, 07:00:38 am] [INFO] Found matching rows for value 'Zyad' in table 'users' [ { id: 13, name: 'Zyad', age: 19 }, { id: 2, name: 'Zyad', age: 22 } ]
[14 Dec 2024, 07:00:38 am] [INFO] Found matching rows for value '19' in table 'users' [
  { id: 13, name: 'Zyad', age: 19 },
  { id: 99, name: 'Ahmed', age: 19 }
]
[14 Dec 2024, 07:00:38 am] [TEST] Index search test passed

[14 Dec 2024, 07:00:38 am] [SUCCESS] Database backup completed successfully. Available at: ./backup/
[14 Dec 2024, 07:00:38 am] [TEST] Backup DB test passed

[14 Dec 2024, 07:00:38 am] [SUCCESS] Database restored successfully
[14 Dec 2024, 07:00:38 am] [TEST] Database restoration test passed

[14 Dec 2024, 07:00:38 am] [INFO] [LOCK] Mutex created for table 'users'
[14 Dec 2024, 07:00:38 am] [DEBUG] [MUTEX] Lock aquired
[14 Dec 2024, 07:00:38 am] [DEBUG] [MUTEX] Lock busy, request queued
[14 Dec 2024, 07:00:38 am] [INFO] [LOCK] Lock aquired for table 'users'
[14 Dec 2024, 07:00:38 am] [TEST] 'Task 1' started

[14 Dec 2024, 07:00:38 am] [SUCCESS] Row inserted into table 'users' successfully
[14 Dec 2024, 07:00:38 am] [TEST] Locks test passed

[14 Dec 2024, 07:00:43 am] [TEST] 'Task 1' finished

[14 Dec 2024, 07:00:43 am] [INFO] [LOCK] Task performed successfully on table 'users'
[14 Dec 2024, 07:00:43 am] [DEBUG] [MUTEX] Passing the lock to the next function
[14 Dec 2024, 07:00:43 am] [DEBUG] [MUTEX] Lock aquired
[14 Dec 2024, 07:00:43 am] [INFO] [LOCK] Lock released for table 'users'
[14 Dec 2024, 07:00:43 am] [INFO] [LOCK] Lock aquired for table 'users'
[14 Dec 2024, 07:00:43 am] [TEST] 'Task 2' started

[14 Dec 2024, 07:00:43 am] [SUCCESS] Row inserted into table 'users' successfully
[14 Dec 2024, 07:00:48 am] [TEST] 'Task 2' finished

[14 Dec 2024, 07:00:48 am] [INFO] [LOCK] Task performed successfully on table 'users'
[14 Dec 2024, 07:00:48 am] [DEBUG] [MUTEX] Lock released
[14 Dec 2024, 07:00:48 am] [INFO] [LOCK] Lock released for table 'users'

```
