/**
 * @module locks
 * @description Implements table-level locking using Mutex
 */

import Mutex from "./mutex.js";
import { logError, logInfo } from "../logger/logger.js";

const locks = new Map();

/**
 * Acquires a lock for a table
 * @param {string} tableName - The name of the table to lock
 * @returns {Promise<Function>} - A promise that resolves to an unlock function
 */
export async function lockTable(tableName){
    if(!locks.has(tableName)){
        locks.set(tableName, new Mutex());
        logInfo(`[LOCK] Mutex created for table '${tableName}'`);
    }

    const mutex = locks.get(tableName);
    const unlock = await mutex.lock();
    logInfo(`[LOCK] Lock aquired for table '${tableName}'`);
    return unlock;
}

/**
 * Executes a callback function with a table lock
 * @param {string} tableName
 * @param {Function} callback
 */
export async function performWithLock(tableName, callback){
    const unlock = await lockTable(tableName);
    try {
        await callback();
        logInfo(`[LOCK] Task performed successfully on table '${tableName}'`);
    } catch (error) {
        logError(`[LOCK] Task did not perform on table '${tableName}'`, error);
        throw error;
    } finally {
        unlock();
        logInfo(`[LOCK] Lock released for table '${tableName}'`);
    }
}
