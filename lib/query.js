/**
* @module query
* @description Parses and executes SQL queries
*/

import { getTableFilePath, readJSON, writeJSON } from "./storage.js";
import { logError, logSuccess } from "../logger/logger.js";

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
    try {
        const parsedQuery = parseSelectQuery(query);
        const data = readJSON(getTableFilePath(parsedQuery.tableName, "data"));

        if (!data) {
            logError(`Tabe '${parsedQuery.tableName}' doesn't exist`);
            throw new Error(`Tabe '${parsedQuery.tableName}' doesn't exist`);
        }

        const filteredData = parsedQuery.whereClause ? data.filter((row) => {
            return evaluateWhereClause(row, parsedQuery.whereClause);
        }) : data;

        if (parsedQuery.aggregations.length > 0) {
            const result = [];
            parsedQuery.aggregations.forEach(agg => {
                let avg = 0, count = 0;
                filteredData.forEach(row => {
                    if (row[agg.column]) {
                        avg += row[agg.column];
                        count++;
                    }
                });
                if (agg.type == "count") {
                    result.push({ "count": count });
                } else if (agg.type == "avg") {
                    result.push({ "avg": avg / count });
                }
            });
            logSuccess("SELECT Query executed successfully");
            return result;
        }

        if (parsedQuery.columns.includes("*")) {
            logSuccess("SELECT Query executed successfully");
            return filteredData;
        } else {
            const schema = readJSON(getTableFilePath(parsedQuery.tableName, "schema"));
            const selectedData = [];
            filteredData.forEach((row) => {
                const selectedRow = {};
                parsedQuery.columns.forEach((col) => {
                    if(!schema[col]){
                        logError(`Columns '${col}' doesn't exist in table '${parsedQuery.tableName}'`);
                        throw new Error(`Columns '${col}' doesn't exist in table '${parsedQuery.tableName}'`);
                    }
                    selectedRow[col] = row[col];
                });
                selectedData.push(selectedRow);
            });

            logSuccess("SELECT Query executed successfully");
            return selectedData;
        }
    }
    catch (error) {
        logError("SELECT Query failed", error);
        throw new Error("SELECT Query failed");
    }
}

/**
* Parses a SELECT query to extract table name, columns, and aggregations.
* Supports COUNT and AVG functions.
* @param {string} query - The SELECT query to parse.
* @returns {Object} Parsed query components.
*/
export function parseSelectQuery(query) {
    const match = query.match(/SELECT\s+(.*?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+))?/i);

    if (!match) {
        logError("Invalid SELECT query syntax");
        throw new Error("Invalid SELECT query syntax");
    }

    const columnsSplit = match[1].split(",").map(col => col.trim());
    const tableName = match[2];
    const whereClause = match[3];

    const aggregations = [];
    const columns = [];

    columnsSplit.forEach((col) => {
        const countMatch = col.match(/COUNT\((\w+)\)/i);
        const avgMatch = col.match(/AVG\((\w+)\)/i);

        if (countMatch) {
            aggregations.push({
                type: "count",
                column: countMatch[1]
            });
        }
        if (avgMatch) {
            aggregations.push({
                type: "avg",
                column: avgMatch[1]
            });
        }
        if (!countMatch && !avgMatch) {
            columns.push(col);
        }
    });

    return { aggregations, columns, tableName, whereClause };
}

/**
* Evaluates the WHERE clause for a given row.
* @param {Object} row - The data row.
* @param {string|null} whereClause - The WHERE clause condition.
* @returns {boolean} Whether the row satisfies the condition.
*/
export function evaluateWhereClause(row, whereClause) {
    if (!whereClause) {
        return true;
    }
    const words = whereClause.split(' ');
    const newWords = [];

    for (const word of words) {
        if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(word) && !["AND", "OR", "NOT", "<", ">", "="].includes(word)) {
            newWords.push(`row.${word}`);
        } else if (word === "=") {
            newWords.push("===");
        } else {
            newWords.push(word);
        }
    }
    try {
        const func = new Function("row", `return ${newWords.join(' ')}`);
        return func(row);
    } catch (error) {
        logError("Error evaluating WHERE clause", error);
        return false;
    }
}
