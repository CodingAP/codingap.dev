import { STEVE } from '@codingap/steve';
import { Database } from '@db/sqlite';
import { encodeHex, decodeHex } from 'jsr:@std/encoding/hex';
import { JSONToken } from './types.ts';
import { getCookies } from '@std/http/cookie';

let database: Database | null = null;

// return default 404 response for any missing file
const getNotFoundResponse = () => {
    return new Response(STEVE.renderFile('./views/notfound.html', {}), {
        status: 404,
        headers: {
            'Content-Type': 'text/html'
        }
    });
};

// gets an instance of the database and initializes the tables if needed
const getDatabase = (): Database => {
    if (database !== null) return database;
    
    database = new Database('./data/website-data.db');
    
    database.exec(`
        CREATE TABLE IF NOT EXISTS 'POSTS' (
            'POST_ID' INTEGER NOT NULL UNIQUE,
            'TITLE' TEXT NOT NULL,
            'AUTHOR' TEXT NOT NULL,
            'DATE' TEXT NOT NULL,
            'POST' BLOB NOT NULL,
            PRIMARY KEY('POST_ID' AUTOINCREMENT)
        );
    `);

    return database;
};

const encrypt = async (plaintext: string) => {
    const text = new TextEncoder().encode(plaintext);
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(Deno.env.get('AUTH_KEY')), 'AES-CBC', true, ['encrypt', 'decrypt']);
    const iv = crypto.getRandomValues(new Uint8Array(16));
    const buffer = await crypto.subtle.encrypt({ name: 'AES-CBC', length: 256, iv }, key, text);
    return `${encodeHex(buffer)}.${encodeHex(iv)}`;
};

const decrypt = async (encrypted: string) => {
    const [buffer, iv] = encrypted.split('.').map(text => decodeHex(text));
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(Deno.env.get('AUTH_KEY')), 'AES-CBC', true, ['encrypt', 'decrypt']);
    const plaintext = await crypto.subtle.decrypt({ name: 'AES-CBC', iv }, key, buffer);
    return new TextDecoder().decode(plaintext);
};

// check if request is authenticated
const authenticated = async (request: Request): Promise<boolean> => {
    const cookies = getCookies(request.headers);
    if (cookies.session !== undefined) {
        try {
            const json = JSON.parse(await decrypt(cookies.session)) as JSONToken;
            return json.id === 'codingap';
        } catch (e) {
            return false;
        }
    }
    return false;
}

export {
    getNotFoundResponse,
    getDatabase,
    authenticated,
    encrypt
};