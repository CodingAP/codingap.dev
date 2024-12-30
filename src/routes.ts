import { STEVE } from '@codingap/steve';
import { type Route } from "@std/http/unstable-route";
import posts from './posts.ts';
import { authenticated, getNotFoundResponse } from "./middleware.ts";

const defaultHeaders = new Headers();
defaultHeaders.append('Content-Type', 'text/html');

const ROUTES: Route[] = [
    {
        pattern: new URLPattern({ pathname: '/' }),
        handler: () => new Response(STEVE.renderFile('./views/home.html', { posts }), { status: 200, headers: defaultHeaders })
    },
    {
        pattern: new URLPattern({ pathname: '/blog' }),
        handler: () => new Response(STEVE.renderFile('./views/blog.html', { posts }), { status: 200, headers: defaultHeaders })
    },
    {
        pattern: new URLPattern({ pathname: '/blog/:title' }),
        handler: (_request, params) => {
            const post = posts.find(post => post.name === params?.pathname.groups.title);
            if (post !== undefined) {
                return new Response(STEVE.renderFile('./views/post.html', { ...post.data }), { status: 200, headers: defaultHeaders });
            } else {
                return getNotFoundResponse();
            }
        }
    },
    {
        pattern: new URLPattern({ pathname: '/about' }),
        handler: () => new Response(STEVE.renderFile('./views/about.html', { posts }), { status: 200, headers: defaultHeaders })
    },
    {
        pattern: new URLPattern({ pathname: '/projects' }),
        handler: () => new Response(STEVE.renderFile('./views/projects.html', { posts }), { status: 200, headers: defaultHeaders })
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
                return new Response(STEVE.renderFile('./views/cms/login.html', {}), { status: 200, headers: defaultHeaders }); 
            }
        }
    },
    {
        pattern: new URLPattern({ pathname: '/cms/dashboard' }),
        handler: async (request) => {
            if (await authenticated(request)) {
                return new Response(STEVE.renderFile('./views/cms/dashboard.html', {}), { status: 200, headers: defaultHeaders });   
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