/**
 * @module storage
 * @description Handles file-based storage operations
 */

import fs from "fs";
import path from "path";
import { logError, logInfo } from "../logger/logger.js";

export const DATABASE_PATH = process.env.MINI_SQL_DB_PATH || "./database/";

if (!fs.existsSync(DATABASE_PATH)) {
    fs.mkdirSync(DATABASE_PATH, { recursive: true });
    logInfo(`Created database path: ${DATABASE_PATH}`);
}

/**
 * Gets the file path for a table's schema or data file
 * @param {string} tableName - The name of the table.
 * @param {string} fileType - The type of file (schema or data).
 * @returns {string} - The file path
 */
export function getTableFilePath(tableName, fileType = "data") {
    return path.join(DATABASE_PATH, `${tableName}.${fileType}.json`);
}

/**
 * Reads a JSON file and returns its contents.
 * @param {string} filePath - Path to the JSON file
 * @returns {object|null} - Parsed JSON content or null if the file doesn't exist
 */
export function readJSON(filePath) {
    const parsedJSON = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath)) : null;
    if (!parsedJSON) {
        logError(`File not found: ${filePath}`);
    }
    return parsedJSON;
}

/**
 * Writes data to a JSON file
 * @param {string} filePath - Path to the JSON file
 * @param {object} data - Data to write
 */
export function writeJSON(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
}
