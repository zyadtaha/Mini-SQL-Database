export { DATABASE_PATH, getTableFilePath, readJSON, writeJSON } from "./lib/storage.js";
export { createTable, insertInto, select } from "./lib/query.js";
export { createIndex, searchWithIndex } from "./lib/indexing.js";
export { lockTable, performWithLock } from "./lib/locks.js";
export { backupDatabase, restoreDatabase } from "./lib/backup.js";