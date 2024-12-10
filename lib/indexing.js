/**
 * @module indexing
 * @description Implements indexing and optimised lookups
 */

import { getTableFilePath, readJSON, writeJSON } from "./storage.js";
import { logSuccess, logError, logInfo } from "../logger/logger.js";

/**
 * Creates an index on a specific column of a table
 * @param {string} tableName - The name of the table
 * @param {string} column - The column to index
 */
export function createIndex(tableName, column) {
    const data = readJSON(getTableFilePath(tableName, "data"));

    if (!data) {
        logError(`Table '${tableName}' doesn't exit`);
        throw new Error(`Table '${tableName}' doesn't exit`);
    }

    const index = {};
    data.forEach( (row,i) => {
        const key = row[column];
        if(!index[key]){
            index[key] = [];
        }
        index[key].push(i);
    });

    const indexPath = getTableFilePath(tableName, `${column}.index`);
    writeJSON(indexPath, index);
    logSuccess(`Index created successfully on column '${column}' of table '${tableName}'`);
}

/**
 * Searches for rows in a table using an index
 * @param {string} tableName - Name of the table
 * @param {string} column - Column to search
 * @param {string|number|boolean} value - Value to search for
 * @returns {Array<object>} The matching rows
 */
export function searchWithIndex(tableName, column, value){
    const indices = readJSON(getTableFilePath(tableName, `${column}.index`));
    const data = readJSON(getTableFilePath(tableName, "data"));

    if (!data) {
        logError(`Table '${tableName}' doesn't exit`);
        throw new Error(`Table '${tableName}' doesn't exit`);
    }

    if (!indices) {
        logError(`Index on table '${tableName}' doesn't exit`);
        throw new Error(`Index on table '${tableName}' doesn't exit`);
    }


    const positions = indices[value];
    if(!positions){
        logError(`No matching row for value '${value}' in table '${tableName}'`);
        throw new Error(`No matching row for value '${value}' in table '${tableName}`);
    }

    const matchedRows = positions.map(index => data[index]);

    logInfo(`Found matching rows for value '${value}' in table '${tableName}'`, matchedRows);
    return matchedRows;
}