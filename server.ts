import { route, type Route } from "@std/http/unstable-route";
import { serveDir } from '@std/http/file-server';
import { STEVE } from '@codingap/steve';
import { getNotFoundResponse } from "./src/middleware.ts";

const PORT = 1337;

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

Deno.serve({
    port: PORT,
    handler: route(routers, getNotFoundResponse),
    onListen: () => {
        console.log(`https://codingap.dev is listening on port ${PORT} (http://localhost:${PORT})`);
    }
});