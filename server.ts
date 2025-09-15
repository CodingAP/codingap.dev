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

/**
 * updates the certificate and the private key given all the information in the .env
 * 
 * will not work if any information is not there
 */
const updateCertificates = () => {
    const secretKey = Deno.env.get('PORKBUN_SECRET_KEY');
    const apiKey = Deno.env.get('PORKBUN_API_KEY');
    const certificatePath = Deno.env.get('CERTIFICATE_PATH');
    const privateKeyPath = Deno.env.get('PRIVATE_KEY_PATH');
    const reloadCommand = Deno.env.get('RELOAD_COMMAND')

    if (secretKey !== undefined && apiKey !== undefined && certificatePath !== undefined && privateKeyPath !== undefined && reloadCommand !== undefined) {
        fetch('https://api.porkbun.com/api/json/v3/ssl/retrieve/codingap.dev', {
            method: 'POST',
            body: JSON.stringify({ secretapikey: secretKey, apikey: apiKey }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'SUCCESS') {
                    Deno.writeFileSync(certificatePath, data.certificatechain);
                    Deno.writeFileSync(privateKeyPath, data.privatekey)
                    console.log(`INFO (${new Date().toISOString()}): Successfully updated certificates, reloading service...`);

                    const command = new Deno.Command(reloadCommand);
                    return command.output();
                }
            })
            .then(output => {
                if (output !== undefined) {
                    if (output.code === 0) console.log(`INFO (${new Date().toISOString()}): Successfully reloaded service!`);
                    else console.log(`WARN (${new Date().toISOString()}): Something went wrong with the reload - ${new TextDecoder().decode(output.stderr)}`);
                }
            })
    } else {
        console.log(`WARN (${new Date().toISOString()}): Cannot update certificates as there is something missing in the .env file!`);
    }
}

Deno.serve({
    port: PORT,
    handler: route(routers, getNotFoundResponse),
    onListen: () => {
        // update certificates every week
        if (Deno.env.get('ENVIRONMENT') === 'PROD') {
            const DELAY = 1000 * 60// * 60 * 24 * 7;
            updateCertificates();
            setInterval(updateCertificates, DELAY);
        }

        console.log(`INFO (${new Date().toISOString()}): https://codingap.dev is listening on port ${PORT} (http://localhost:${PORT})`);
    }
});