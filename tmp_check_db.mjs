import { Client, Databases } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('69a2731e00047b3b01e9')
    .setKey('standard_a22e237c81225a0ddf2b85af6186581642914ff61070b3abf48ed21e79b199566c23d0c7da97d0aae776233d75eefc299b979cac699793e846f5c0d945b1edb3040efc0e5c9093d3235de74df9a6932278ea2cc62548231e8a383229956dbe74d1e529d9a9468ac3d95f29f267a4ecf9be283517243686e63162d1b84bd342cf');

const databases = new Databases(client);

async function check() {
    try {
        console.log('Listing collections for staysetu_db...');
        const res = await databases.listCollections('staysetu_db');
        console.log('COLLECTIONS:');
        console.log(JSON.stringify(res.collections.map(c => ({ id: c.$id, name: c.name })), null, 2));
    } catch (e) {
        console.error(e);
    }
}

check();
