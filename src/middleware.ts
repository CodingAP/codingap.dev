import { STEVE } from "@codingap/steve";

// return default 404 response for any missing file
const getNotFoundResponse = () => {
    return new Response(STEVE.renderFile('./views/notfound.html', {}), {
        status: 404,
        headers: {
            'Content-Type': 'text/html'
        }
    });
}

export {
    getNotFoundResponse
};