import { type Route } from '@std/http/unstable-route';
import { setCookie } from '@std/http/cookie';
import { crypto } from '@std/crypto';
import { encodeHex } from '@std/encoding/hex';
import { authenticated, encrypt } from './middleware.ts';
import { LoginRequestBody } from './types.ts';

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
                    const cookie = await encrypt(JSON.stringify({ loggedIn: new Date().toISOString(), id: 'codingap' }));
                    const headers = new Headers();
                    headers.append('Content-Type', 'application/json');
                    setCookie(headers, { name: 'session', value: cookie, path: '/', sameSite: 'Lax' });
    
                    return new Response(JSON.stringify({ message: 'Success!', error: false }), { status: 200, headers });
                } else {
                    return new Response(JSON.stringify({ message: 'Incorrect password!', error: true }), { status: 400, headers: defaultHeaders });
                }
            }
    
            return new Response(JSON.stringify({ message: 'Failed to login!', error: true }), { status: 400, headers: defaultHeaders });
        }
    },
];

export default ROUTES;