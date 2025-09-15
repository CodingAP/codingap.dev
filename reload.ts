/**
 * reload.ts
 * 
 * updates the certificate and the private key given all the information in the .env
 * 
 * will not work if any information is not there
 * 
 * by alex prosser
 * 9/15/2025
 */

import { getLogger } from './src/logger.ts';

const logger = getLogger();

// import all environment variables needed to renew certificates
const secretKey = Deno.env.get('PORKBUN_SECRET_KEY');
const apiKey = Deno.env.get('PORKBUN_API_KEY');
const certificatePath = Deno.env.get('CERTIFICATE_PATH');
const privateKeyPath = Deno.env.get('PRIVATE_KEY_PATH');

// if all variables are there, try to renew the certificates
if (secretKey !== undefined && apiKey !== undefined && certificatePath !== undefined && privateKeyPath !== undefined) {
    const response = await fetch('https://api.porkbun.com/api/json/v3/ssl/retrieve/codingap.dev', {
        method: 'POST',
        body: JSON.stringify({ secretapikey: secretKey, apikey: apiKey }),
        headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();
    
    // write the certificates to the provided file paths
    // note: this is only going to be used on the actual server, so paths are linux-based
    if (data.status === 'SUCCESS') {
        await Deno.writeTextFile(certificatePath, data.certificatechain);
        await Deno.writeTextFile(privateKeyPath, data.privatekey);

        logger.info(`Renew Certificates - Successfully updated certificates!`);
    }
} else {
    logger.error(`Renew Certificates - Cannot update certificates as there is something missing in the .env file!`);
}