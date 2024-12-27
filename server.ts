
import { walkSync } from '@std/fs';
import { contentType } from '@std/media-types';
import { extname } from "@std/path";
import { STEVE } from '@codingap/steve';
import { Handler } from "./src/types.ts";
import { getNotFoundResponse } from "./src/middleware.ts";

const PORT = 1337;

STEVE.includeDirectory = './views/includes';

// read in static files
const staticDirectory = 'static';
const STATIC_CONTENT: { [key: string]: Uint8Array } = {};
Array.from(walkSync(staticDirectory)).filter(file => file.isFile).forEach(file => STATIC_CONTENT[file.path] = Deno.readFileSync(file.path));

// routing time

// ~~~ this should be the only part you need to modify
import MAIN_ROUTES from './src/routes.ts';
import API_ROUTES from './src/api.ts';

const routers = [{ router: MAIN_ROUTES, startingPath: '' }, { router: API_ROUTES, startingPath: '/api' }];
// ~~~ end modification ~~~

// combine all routers together

const ROUTES: { [key: string]: { match: (path: string) => { match: boolean, url: { [key: string]: string }}, handler: Handler }[] } = {};
routers.forEach(({ router, startingPath }) => {
    Object.keys(router).forEach(method => {
        if (ROUTES[method] === undefined) ROUTES[method] = [];
        Object.keys(router[method]).forEach(route => {
            const routeParts = (startingPath + route).split('/').filter(part => part.length > 0);

            ROUTES[method].push({
                match: (path) => {
                    const pathParts = path.split('/').filter(part => part.length > 0);
                    if (pathParts.length !== routeParts.length) return { match: false, url: {} };

                    let match = true;
                    const url: { [key: string]: string } = {};

                    for (let i = 0; i < pathParts.length; i++) {
                        // parse url parameter if needed
                        if (routeParts[i][0] === ':') url[routeParts[i].slice(1)] = pathParts[i];
                        else if (routeParts[i] !== pathParts[i]) {
                            match = false;
                            break;
                        }
                    }

                    return { match, url };
                },
                handler: router[method][route]
            });
        });
    });
});

Deno.serve({
    port: PORT,
    handler: async (request) => {
        // handle static files
        const url = new URL(request.url);
        const path = url.pathname.slice(1);
        if (path.startsWith(staticDirectory)) {
            const mimeType = contentType(extname(path)) || 'text/plaintext';
            if (STATIC_CONTENT[path] !== undefined) {
                return new Response(STATIC_CONTENT[path], {
                    status: 200,
                    headers: {
                        'Content-Type': mimeType
                    }
                });
            } else return getNotFoundResponse();
        }

        // try getting routes
        const method = request.method.toUpperCase(); 
        if (ROUTES[method] !== undefined) {
            for (const route of ROUTES[method]) {
                const { match, url } = route.match(path);
                if (match) return await route.handler(request, url);
            }
        }

        // else, return not found
        return getNotFoundResponse();
    },
    onListen: () => {
        console.log(`https://codingap.dev is listening on port ${PORT} (http://localhost:${PORT})`);
    }
});