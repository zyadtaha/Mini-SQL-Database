/**
 * @module backup
 * @description Handles database backup and restore functionality
 */

import fs from "fs";
import path from "path";
import { DATABASE_PATH } from "./storage.js";
import { logError, logSuccess } from "../logger/logger.js";

/**
 * Backs up the entire database directory to another specified directory
 * @param {string} backupPath - The directory to save the backup
 */
export function backupDatabase(backupPath) {
    fs.cpSync(DATABASE_PATH, backupPath, { recursive: true });
    logSuccess(`Database backup completed successfully. Available at: ${backupPath}`);
}

/**
 * Restrores the database from a backup directory.
 * @param {string} backupPath - The directory containing the backup files.
 */
export function restoreDatabase(backupPath) {
    if (!fs.existsSync(backupPath)) {
        logError(`No backup database found in '${backupPath}'`);
        throw new Error(`No backup database found in '${backupPath}'`);
    }

    fs.cpSync(backupPath, DATABASE_PATH, { recursive: true });
    logSuccess(`Database restored successfully`);
}