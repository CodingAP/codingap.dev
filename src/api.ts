/**
 * src/api.ts
 *
 * handles all the routing for paths that start with /api
 * 
 * mostly used for requests that don't need a view
 *
 * by alex prosser
 * 9/15/2025
 */

import { crypto } from '@std/crypto';
import { encodeHex } from '@std/encoding/hex';
import { setCookie } from '@std/http/cookie';
import { type Route } from '@std/http/unstable-route';
import { createPost, getPostFromUrlID } from "./database/database.ts";
import { getLogger } from './logger.ts';
import { authenticated, encrypt } from './middleware.ts';
import { CreatePostRequestBody, LoginRequestBody } from './types.ts';

const logger = getLogger();

const defaultHeaders = new Headers();
defaultHeaders.append('Content-Type', 'application/json');

const ROUTES: Route[] = [
    {
        method: ['POST'],
        pattern: new URLPattern({ pathname: '/api/cms/login' }),
        handler: async (request) => {
            if (request.headers.get('Content-Type') === 'application/json') {
                const body = (await request.json()) as LoginRequestBody;
    
                // check to see if logged in
                if (body.check && await authenticated(request)) {
                    return new Response(JSON.stringify({ message: 'Already Logged In!', error: false }), { status: 200, headers: defaultHeaders });
                }
    
                // encrypted session token and send to client
                const passwordBuffer = new TextEncoder().encode(body.password + Deno.env.get('SALT'));
                const hashBuffer = await crypto.subtle.digest('SHA-256', passwordBuffer);
                if (Deno.env.get('HASH') === encodeHex(hashBuffer)) {
                    const cookie = await encrypt(JSON.stringify({ timestamp: new Date().toISOString(), id: 'codingap' }));
                    const headers = new Headers();
                    headers.append('Content-Type', 'application/json');
                    setCookie(headers, { name: 'session', value: cookie, path: '/', sameSite: 'Lax' });

                    logger.info('GET /api/cms/login - Successful log-in!');
                    return new Response(JSON.stringify({ message: 'Success!', error: false }), { status: 200, headers });
                } else {
                    logger.warn('GET /api/cms/login - Unsuccessful log-in!');      
                    return new Response(JSON.stringify({ message: 'Incorrect password!', error: true }), { status: 400, headers: defaultHeaders });
                }
            }

            logger.warn('GET /api/cms/login - Unsuccessful log-in!');
            return new Response(JSON.stringify({ message: 'Failed to login!', error: true }), { status: 400, headers: defaultHeaders });
        }
    },
    {
        method: ['POST'],
        pattern: new URLPattern({ pathname: '/api/cms/create-post' }),
        handler: async (request) => {
            if (request.headers.get('Content-Type') === 'application/json') {
                const body = (await request.json()) as CreatePostRequestBody;
    
                // check to see if logged in
                if (!(await authenticated(request))) {
                    return new Response(JSON.stringify({ message: 'Not Authenticated!', error: true }), { status: 401, headers: defaultHeaders });
                }

                // if no title, throw error
                if (!body.title) {
                    return new Response(JSON.stringify({ message: 'Title cannot be empty!', error: true }), { status: 400, headers: defaultHeaders });
                }

                // if no id, throw error
                if (!body.id) {
                    return new Response(JSON.stringify({ message: 'ID cannot be empty!', error: true }), { status: 400, headers: defaultHeaders });
                }
    
                // try to create the post
                createPost(body.title, body.id);
            
                // respond with the post id if successful
                logger.info(`POST /api/cms/create-post - Created a post with the id "${body.id}"!`);
                return new Response(JSON.stringify({ message: 'Successful!', error: false }), { status: 200, headers: defaultHeaders });
            }
    
            return new Response(JSON.stringify({ message: 'Failed to create a post!', error: true }), { status: 400, headers: defaultHeaders });
        }
    },
    {
        method: ['GET'],
        pattern: new URLPattern({ pathname: '/api/cms/get-post/:id' }),
        handler: async (request, params) => {
            // check to see if logged in
            if (!(await authenticated(request))) {
                return new Response(JSON.stringify({ message: 'Not Authenticated!', error: true }), { status: 401, headers: defaultHeaders });
            }

            const urlID = params?.pathname.groups.id;
            if (urlID !== undefined) {
                const post = getPostFromUrlID(urlID);
                if (post !== undefined) {
                    return new Response(JSON.stringify({ message: 'Successful!', post, error: false }), { status: 200, headers: defaultHeaders });
                } else {
                    return new Response(JSON.stringify({ message: 'Post doesn\'t exist!', error: true }), { status: 400, headers: defaultHeaders });
                }
            }

            return new Response(JSON.stringify({ message: 'Failed to get the post!', error: true }), { status: 400, headers: defaultHeaders });
        }
    }
];

export default ROUTES;