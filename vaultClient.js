const vault = require('node-vault');

const TRANSIT_KEY = 'issuebot';


async function createClient() {
	const unauth = vault({ endpoint: process.env.VAULT_ADDR});
	const res = await unauth.approleLogin({
		role_id: process.env.VAULT_ROLE_ID,
		secret_id: process.env.VAULT_SECRET_ID
	});
	return vault({
		endpoint: process.env.VAULT_ADDR,
		token: res.auth.client_token
	});
}


async function decryptValue(client, ciphertext){
	const res = await client.write(`transit/issuebot/decrypt/${TRANSIT_KEY}`,{ ciphertext
});
	return Buffer.from(res.data.plaintext, 'base64').toString('utf-8').trim();

}

async function loadDecryptedSecrets(){
	const vaultClient = await createClient();
	const secrets = ['SLACK_BOT_TOKEN','SLACK_APP_TOKEN','SLACK_SIGNING_SECRET','JIRA_EMAIL','JIRA_API_TOKEN'];
	for (const key of secrets) {
		const cipher = process.env[`ENC_${key}`];
		if (!cipher) continue;
		const value = await decryptValue(vaultClient,cipher);
		process.env[key] = value.trim();
		console.log(`[VAULT] Decrypted ${key}:`, key.includes('token') ? value : value);

	}

}
module.exports = {loadDecryptedSecrets};
