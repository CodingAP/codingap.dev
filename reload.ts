/**
 * updates the certificate and the private key given all the information in the .env
 * 
 * will not work if any information is not there
 */

const secretKey = Deno.env.get('PORKBUN_SECRET_KEY');
const apiKey = Deno.env.get('PORKBUN_API_KEY');
const certificatePath = Deno.env.get('CERTIFICATE_PATH');
const privateKeyPath = Deno.env.get('PRIVATE_KEY_PATH');

if (secretKey !== undefined && apiKey !== undefined && certificatePath !== undefined && privateKeyPath !== undefined) {
    const response = await fetch('https://api.porkbun.com/api/json/v3/ssl/retrieve/codingap.dev', {
        method: 'POST',
        body: JSON.stringify({ secretapikey: secretKey, apikey: apiKey }),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();
    
    if (data.status === 'SUCCESS') {
        await Deno.writeTextFile(certificatePath, data.certificatechain);
        await Deno.writeTextFile(privateKeyPath, data.privatekey);

        console.log(`INFO (${new Date().toISOString()}): Successfully updated certificates!`);
    }
} else {
    console.log(`WARN (${new Date().toISOString()}): Cannot update certificates as there is something missing in the .env file!`);
}