/**
 * src/database.ts
 *
 * controls the sqlite database and all interactions with it
 * 
 * hold posts and project data to be display and edited by the cms
 *
 * by alex prosser
 * 9/15/2025
 */

import { Database } from '@db/sqlite';
import { existsSync } from '@std/fs';
import { mapPostFromDB, Post } from "../types.ts";

/**
 * global database reference (essentially a singleton)
 */
let database: Database | null = null;

/**
 * allow queries to be cached so we don't have to keep reading them from files
 */
const queryCache: { [key: string]: string } = {};

/**
 * gets an instance of the database and initializes the tables if needed
 * 
 * @returns an initialized database
 */
const getDatabase = (): Database => {
    if (database !== null) return database;

    // create directory for the database if needed
    if (!existsSync('./data/website-data.db')) Deno.mkdirSync('./data');
    
    // initialize database if needed
    database = new Database('./data/website-data.db');
    executeSqlFile('./src/database/sql/init-table.sql');

    return database;
};

/**
 * executes a sql file on the database
 * 
 * used only for creates/inserts/updates
 * 
 * @param file path to the sql file
 * @param args all arguments needed for sql
 */
const executeSqlFile = (file: string, args?: { [key: string]: string }) => {
    const database = getDatabase(); 

    // cache the query to prevent file i/o from being taken up
    if (queryCache[file] === undefined) queryCache[file] = Deno.readTextFileSync(file);
    const sqlFile = queryCache[file];

    if (args === undefined) database.exec(sqlFile);
    else database.exec(sqlFile, args);
};

/**
 * run a select using a sql file on the database
 * 
 * used only for selects
 * 
 * @param file path to the sql file
 */
const selectSqlFile = (file: string) => {
    const database = getDatabase();

    // cache the query to prevent file i/o from being taken up
    if (queryCache[file] === undefined) queryCache[file] = Deno.readTextFileSync(file);
    const sqlFile = queryCache[file];

    return database.prepare(sqlFile);
};

/**
 * creates a post with default values with the provided title
 * 
 * @param title title of post
 */
const createPost = (title: string, id: string) => {
    const timestamp = new Date().toISOString();

    executeSqlFile('./src/database/sql/create-post.sql', { id, title, timestamp });
};

/**
 * gets a post from the database using the url id
 * 
 * @param id url id of the post
 * @returns the post from the database
 */
const getPostFromUrlID = (id: string): Post | undefined => {
    return mapPostFromDB(selectSqlFile('./src/database/sql/get-post-by-id.sql').get({ id }));
};

export {
    createPost, getPostFromUrlID
};
