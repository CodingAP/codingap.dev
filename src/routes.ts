import { STEVE } from '@codingap/steve';
import { Router } from './types.ts';
import posts from './posts.ts';
import { getNotFoundResponse } from "./middleware.ts";

const ROUTES: Router = {};

ROUTES.GET = {
    '/': async (_request, _url) => {
        return new Response(STEVE.renderFile('./views/home.html', { posts }), {
            status: 200,
            headers: {
                'Content-Type': 'text/html'
            }
        });
    },
    '/blog': async (_request, _url) => {
        return new Response(STEVE.renderFile('./views/blog.html', { posts }), {
            status: 200,
            headers: {
                'Content-Type': 'text/html'
            }
        });
    },
    '/blog/:title': async (_request, url) => {
        const post = posts.find(post => post.name === url.title);
        if (post !== undefined) {
            return new Response(STEVE.renderFile('./views/post.html', { ...post.data }), {
                status: 200,
                headers: {
                    'Content-Type': 'text/html'
                }
            });
        } else {
            return getNotFoundResponse();
        }
    },
    '/about': async (_request, _url) => {
        return new Response(STEVE.renderFile('./views/about.html', {}), {
            status: 200,
            headers: {
                'Content-Type': 'text/html'
            }
        });
    },
    '/projects': async (_request, _url) => {
        return new Response(STEVE.renderFile('./views/projects.html', {}), {
            status: 200,
            headers: {
                'Content-Type': 'text/html'
            }
        });
    },
};

export default ROUTES;