import pc from "picocolors";
import { createTable, insertInto, select } from "../lib/query.js";
import { createIndex, searchWithIndex } from "../lib/indexing.js";
import { logger } from "../logger/logger.js";

function createTableTest() {
    const query = "CREATE TABLE users (id INT, name TEXT, age INT)";
    try {
        createTable(query);
        logger("[TEST]", pc.magenta, console.info, "Table creation test passed\n")
    } catch (error) {
        logger("[TEST]", pc.red, console.error, "Table creation test failed\n")
    }
}

function insertIntoTest() {
    const query1 = 'INSERT INTO users (id, name, age) VALUES (13, "Zyad", 19)';
    const query2 = 'INSERT INTO users (id, name, age) VALUES (1, "Mohamed", 55)';
    const query3 = 'INSERT INTO users (id, name, age) VALUES (2, "Zyad", 106)';
    const query4 = 'INSERT INTO users (id, name, age) VALUES (99, "Ahmed", 19)';
    try {
        insertInto(query1);
        insertInto(query2);
        insertInto(query3);
        insertInto(query4);
        logger("[TEST]", pc.magenta, console.info, "Insertion test passed\n")
    } catch (error) {
        logger("[TEST]", pc.red, console.error, "Insertion test failed\n")
    }
}

function selectTest() {
    const query1 = "SELECT age, name FROM users";
    const query2 = "SELECT * FROM users";
    try {
        console.table(select(query1));
        console.table(select(query2));
        logger("[TEST]", pc.magenta, console.info, "Selection test passed\n")
    } catch (error) {
        logger("[TEST]", pc.red, console.error, "Selection test failed\n")
    }
}

function createIndexTest() {
    try {
        createIndex("users", "name");
        createIndex("users", "age");
        logger("[TEST]", pc.magenta, console.info, "Index creation test passed\n")
    } catch (error) {
        logger("[TEST]", pc.red, console.error, "Index creation test failed\n")
    }
}

function searchWithIndexTest() {
    try {
        searchWithIndex("users", "name", "Zyad");
        searchWithIndex("users", "age", 19);
        logger("[TEST]", pc.magenta, console.info, "Index search test passed\n")
    } catch (error) {
        logger("[TEST]", pc.red, console.error, "Index search test failed\n")
    }
}

function main() {
    createTableTest();
    insertIntoTest();
    selectTest();
    createIndexTest();
    searchWithIndexTest();
}

main();