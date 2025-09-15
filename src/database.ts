import { Database } from '@db/sqlite';
import { mapPostFromDB, Post } from "./types.ts";

/**
 * global database reference (essentially a singleton)
 */
let database: Database | null = null;

/**
 * gets an instance of the database and initializes the tables if needed
 * 
 * @returns an initialized database
 */
const getDatabase = (): Database => {
    if (database !== null) return database;
    
    database = new Database('./data/website-data.db');
    
    database.exec(`
        CREATE TABLE IF NOT EXISTS 'POSTS' (
            'POST_ID' INTEGER NOT NULL UNIQUE,
            'URL_ID' TEXT NOT NULL,
            'TITLE' TEXT NOT NULL,
            'AUTHOR' TEXT NOT NULL,
            'CREATED' TEXT NOT NULL,
            'UPDATED' TEXT NOT NULL,
            'POST' BLOB NOT NULL,
            'VISIBLE' INTEGER NOT NULL,
            PRIMARY KEY('POST_ID' AUTOINCREMENT)
        );
    `);

    return database;
};

/**
 * creates a post with default values with the provided title
 * 
 * @param title title of post
 */
const createPost = (title: string, id: string) => {
    const database = getDatabase();
    const timestamp = new Date().toISOString();

    database.exec(`
        INSERT INTO 'POSTS' ('URL_ID', 'TITLE', 'AUTHOR', 'CREATED', 'UPDATED', 'POST', 'VISIBLE')
        VALUES (?, ?, 'Alex Prosser', ?, ?, 'This is a new post!', FALSE);
    `, id, title, timestamp, timestamp);

    return database.lastInsertRowId;
};

/**
 * gets a post from the database using the url id
 * 
 * @param id url id of the post
 * @returns the post from the database
 */
const getPostFromUrlID = (id: string): Post | undefined => {
    const database = getDatabase();
    const getPostStatement = database.prepare(`SELECT * FROM POSTS WHERE URL_ID = ?`);

    return mapPostFromDB(getPostStatement.get(id));
};

export {
    getDatabase,
    createPost, getPostFromUrlID
}