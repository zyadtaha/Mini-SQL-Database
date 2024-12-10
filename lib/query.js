/**
 * @module query
 * @description Parses and executes SQL queries
 */

import { logError, logSuccess } from "../logger/logger.js";
import { getTableFilePath, readJSON, writeJSON } from "./storage.js";

/**
 * Creates a new table schema and initialises the data file
 * @param {string} query - SQL query to create a table
 */
export function createTable(query) {
    const match = query.match(/CREATE TABLE (\w+) \((.+)\)/i);
    if (!match) {
        logError("Invalid CREATE TABLE query");
        throw new Error("Invalid CREATE TABLE query");
    }

    const tableName = match[1];
    if (tableName.toLowerCase === "columns" || tableName.toLowerCase === "tables") {
        logError(`Cannot create a table named '${tableName}'`)
        throw new Error(`Cannot create a table named '${tableName}'`);
    }

    const columns = match[2].split(',').map(col => col.trim());
    const schema = columns.reduce(function (acc, col) {
        const [name, type] = col.split(" ");
        if (!name || !type) {
            logError("Invalid column definition");
            throw new Error("Invalid column definition");
        }
        acc[name] = type.toUpperCase();
        return acc;
    }, {});

    const schemaPath = getTableFilePath(tableName, "schema");
    writeJSON(schemaPath, schema);

    const dataPath = getTableFilePath(tableName, "data");
    writeJSON(dataPath, []);

    logSuccess(`Table '${tableName}' created successfully`);
}

/**
 * Inserts a row into a table.
 * @param {string} query - SQL query to insert data
 */
export function insertInto(query) {
    const match = query.match(/INSERT INTO (\w+) \((.+)\) VALUES \((.+)\)/i);

    if (!match) {
        logError("Invalid INSERT INTO query");
        throw new Error("Invalid INSERT INTO query");
    }

    const tableName = match[1];
    const columns = match[2].split(",").map(col => col.trim());
    const records = match[3].split(",").map(rec => rec.trim().replace(/^['"]|['"]$/g, ""));

    const schema = readJSON(getTableFilePath(tableName, "schema"));

    if (!schema) {
        logError(`Table '${tableName}' doesn't exit`);
        throw new Error(`Table '${tableName}' doesn't exit`);
    }

    let row = {};
    for (let i = 0; i < columns.length; i++) {
        const key = columns[i];
        const value = (schema[key] === "INT" ? parseInt(records[i], 10) : records[i]);
        if (!schema[key]) {
            logError(`Column '${key}' doesn't exist in '${tableName}' table`);
            throw new Error(`Column '${key}' doesn't exist in '${tableName}' table`);
        }
        row[key] = value;
    }

    const dataPath = getTableFilePath(tableName, "data");
    const data = readJSON(dataPath);
    data.push(row);
    writeJSON(dataPath, data);
    logSuccess(`Row inserted into table '${tableName}' successfully`);
}


/**
 * Executes a SELECT query.
 * @param {string} query - The SELECT query to execute.
 * @returns {Array<Object>} The result set.
 */
export function select(query) {
    const match = query.match(/SELECT (.+) FROM (.+)/i);

    if (!match) {
        logError("Invalid SELECT query");
        throw new Error("Invalid SELECT query");
    }

    const columns = match[1].split(',').map(col => col.trim());
    const tableName = match[2];
    const data = readJSON(getTableFilePath(tableName, "data"));
    const schema = readJSON(getTableFilePath(tableName, "schema"));

    if (!schema) {
        logError(`Table '${tableName}' doesn't exit`);
        throw new Error(`Table '${tableName}' doesn't exit`);
    }

    if (columns[0] === '*') {
        logSuccess(`SELECT query executed successfully`);
        return data;
    } else {
        const selectedData = [];
        data.forEach(row => {
            const selectedRow = {};
            columns.forEach(col => {
                if (!schema[col]) {
                    logError(`Column '${col}' doesn't exist in '${tableName}' table`);
                    throw new Error(`Column '${col}' doesn't exist in '${tableName}' table`);
                }
                selectedRow[col] = row[col];
            });
            selectedData.push(selectedRow);
        });
        logSuccess(`SELECT query executed successfully`);
        return selectedData;
    }
}
