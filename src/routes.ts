import { STEVE } from '@codingap/steve';
import { type Route } from "@std/http/unstable-route";
import posts from './posts.ts';
import { authenticated, getNotFoundResponse } from "./middleware.ts";
import { getPostFromUrlID } from "./database.ts";

const defaultHeaders = new Headers();
defaultHeaders.append('Content-Type', 'text/html');

const ROUTES: Route[] = [
    {
        pattern: new URLPattern({ pathname: '/' }),
        handler: async (request) => new Response(STEVE.renderFile('./views/home.html', { authenticated: await authenticated(request), posts }), { status: 200, headers: defaultHeaders })
    },
    {
        pattern: new URLPattern({ pathname: '/blog' }),
        handler: async (request) => new Response(STEVE.renderFile('./views/blog.html', { authenticated: await authenticated(request), posts }), { status: 200, headers: defaultHeaders })
    },
    {
        pattern: new URLPattern({ pathname: '/blog/:title' }),
        handler: async (request, params) => {
            const post = posts.find(post => post.name === params?.pathname.groups.title);
            if (post !== undefined) {
                return new Response(STEVE.renderFile('./views/post.html', { authenticated: await authenticated(request), ...post.data }), { status: 200, headers: defaultHeaders });
            } else {
                return getNotFoundResponse();
            }
        }
    },
    {
        pattern: new URLPattern({ pathname: '/about' }),
        handler: async (request) => new Response(STEVE.renderFile('./views/about.html', { authenticated: await authenticated(request), posts }), { status: 200, headers: defaultHeaders })
    },
    {
        pattern: new URLPattern({ pathname: '/projects' }),
        handler: async (request) => new Response(STEVE.renderFile('./views/projects.html', { authenticated: await authenticated(request), posts }), { status: 200, headers: defaultHeaders })
    },
    {
        pattern: new URLPattern({ pathname: '/cms' }),
        handler: async (request) => {
            if (await authenticated(request)) {
                return new Response('', {
                    status: 307,
                    headers: {
                        Location: '/cms/dashboard'
                    },
                });  
            } else {
                return new Response(STEVE.renderFile('./views/cms/login.html', { authenticated: await authenticated(request) }), { status: 200, headers: defaultHeaders }); 
            }
        }
    },
    {
        pattern: new URLPattern({ pathname: '/cms/dashboard' }),
        handler: async (request) => {
            if (await authenticated(request)) {
                return new Response(STEVE.renderFile('./views/cms/dashboard.html', { authenticated: await authenticated(request) }), { status: 200, headers: defaultHeaders });   
            } else {
                return new Response('', {
                    status: 307,
                    headers: {
                        Location: '/cms'
                    },
                });
            }
        }
    },
    {
        pattern: new URLPattern({ pathname: '/cms/post/:id' }),
        handler: async (request, params) => {
            if (await authenticated(request)) {
                const urlID = params?.pathname.groups.id;
                if (urlID !== undefined) {
                    const post = getPostFromUrlID(urlID);
                    if (post !== undefined) {
                        return new Response(STEVE.renderFile('./views/cms/editor-post.html', { authenticated: await authenticated(request), post }), { status: 200, headers: defaultHeaders }); 
                    }
                }
                return getNotFoundResponse();
            } else {
                return new Response('', {
                    status: 307,
                    headers: {
                        Location: '/cms'
                    },
                });
            }
        }
    },
];

export default ROUTES;