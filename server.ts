/**
 * server.ts
 *
 * the entrypoint for the web server, handles routing and hosting
 *
 * by alex prosser
 * 9/15/2025
 */

import { route, type Route } from '@std/http/unstable-route';
import { serveDir } from '@std/http/file-server';
import { STEVE } from '@codingap/steve';
import { getNotFoundResponse } from './src/middleware.ts';
import { getLogger } from "./src/logger.ts";

/**
 * defined port for the reverse proxy to identify
 */
const PORT = 1337;

// point to the include directory for the rest of the views
STEVE.includeDirectory = './views/includes';

// routing time
import MAIN_ROUTES from './src/routes.ts';
import API_ROUTES from './src/api.ts';

const routers: Route[] = [
    ...MAIN_ROUTES,
    ...API_ROUTES,
    {
        pattern: new URLPattern({ pathname: '/static/*' }),
        handler: (request) => serveDir(request, { quiet: true })
    }
];

const logger = getLogger();

// serve the routes passed on the object built above
Deno.serve({
    port: PORT,
    handler: route(routers, getNotFoundResponse),
    onListen: () => {
        logger.info(`Deno.serve - https://codingap.dev is listening on port ${PORT} (http://localhost:${PORT})`);
    }
});