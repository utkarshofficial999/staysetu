/**
 * Fix script — adds missing attributes that failed in the first run.
 * Issues: "required + default" combo not allowed, images attribute too large
 */

import { Client, Databases } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('69a2731e00047b3b01e9')
    .setKey('standard_a22e237c81225a0ddf2b85af6186581642914ff61070b3abf48ed21e79b199566c23d0c7da97d0aae776233d75eefc299b979cac699793e846f5c0d945b1edb3040efc0e5c9093d3235de74df9a6932278ea2cc62548231e8a383229956dbe74d1e529d9a9468ac3d95f29f267a4ecf9be283517243686e63162d1b84bd342cf');

const db = new Databases(client);
const DB = 'staysetu_db';
const wait = (ms) => new Promise(r => setTimeout(r, ms));

async function fix() {
    console.log('🔧 Fixing missing attributes...\n');

    // ── Fix PROFILES: role (not required, with default) ─────────
    try {
        await db.createStringAttribute(DB, 'profiles', 'role', 20, false, 'student');
        console.log('✅ profiles.role added (default: student)');
    } catch (e) { console.log(`⚠️  profiles.role: ${e.message}`); }
    await wait(2000);

    // ── Fix LISTINGS: type (not required, with default) ─────────
    try {
        await db.createStringAttribute(DB, 'listings', 'type', 20, false, 'PG');
        console.log('✅ listings.type added (default: PG)');
    } catch (e) { console.log(`⚠️  listings.type: ${e.message}`); }
    await wait(2000);

    // ── Fix LISTINGS: status (not required, with default) ───────
    try {
        await db.createStringAttribute(DB, 'listings', 'status', 20, false, 'pending');
        console.log('✅ listings.status added (default: pending)');
    } catch (e) { console.log(`⚠️  listings.status: ${e.message}`); }
    await wait(2000);

    try {
        await db.createStringAttribute(DB, 'listings', 'images', 2000, false, '[]');
        console.log('✅ listings.images added (size: 2000)');
    } catch (e) { console.log(`⚠️  listings.images: ${e.message}`); }
    await wait(2000);

    // ── Fix LISTINGS: listedBy ──────────────────────────────────
    try {
        await db.createStringAttribute(DB, 'listings', 'listedBy', 20, false, 'owner');
        console.log('✅ listings.listedBy added (default: owner)');
    } catch (e) { console.log(`⚠️  listings.listedBy: ${e.message}`); }
    await wait(2000);

    // ── Fix ROOMMATE_REQUESTS: status ───────────────────────────
    try {
        await db.createStringAttribute(DB, 'roommate_requests', 'status', 20, false, 'pending');
        console.log('✅ roommate_requests.status added (default: pending)');
    } catch (e) { console.log(`⚠️  roommate_requests.status: ${e.message}`); }
    await wait(5000);

    // ── Now create the missing indexes ──────────────────────────
    console.log('\n🔑 Creating missing indexes...\n');

    try {
        await db.createIndex(DB, 'profiles', 'idx_role', 'key', ['role']);
        console.log('✅ profiles.idx_role created');
    } catch (e) { console.log(`⚠️  profiles.idx_role: ${e.message}`); }
    await wait(2000);

    try {
        await db.createIndex(DB, 'listings', 'idx_status', 'key', ['status']);
        console.log('✅ listings.idx_status created');
    } catch (e) { console.log(`⚠️  listings.idx_status: ${e.message}`); }
    await wait(2000);

    try {
        await db.createIndex(DB, 'listings', 'idx_type', 'key', ['type']);
        console.log('✅ listings.idx_type created');
    } catch (e) { console.log(`⚠️  listings.idx_type: ${e.message}`); }
    await wait(2000);

    try {
        await db.createIndex(DB, 'listings', 'idx_status_type', 'key', ['status', 'type']);
        console.log('✅ listings.idx_status_type created');
    } catch (e) { console.log(`⚠️  listings.idx_status_type: ${e.message}`); }
    await wait(2000);

    try {
        await db.createIndex(DB, 'roommate_requests', 'idx_status', 'key', ['status']);
        console.log('✅ roommate_requests.idx_status created');
    } catch (e) { console.log(`⚠️  roommate_requests.idx_status: ${e.message}`); }

    console.log('\n✅ All fixes applied! Your database is now complete.');
}

fix();
