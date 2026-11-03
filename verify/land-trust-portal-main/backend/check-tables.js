require('dotenv').config();
const { Client } = require('pg');

async function verify() {
    const c = new Client({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        database: 'postgres',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    });
    await c.connect();

    // Check all user tables
    const tables = await c.query(`SELECT schemaname, tablename FROM pg_tables WHERE schemaname NOT IN ('information_schema','pg_catalog')`);
    console.log('Tables in postgres DB:', JSON.stringify(tables.rows));

    // Try querying farmers_land_records
    try {
        const rows = await c.query(`SELECT land_id, land_owner_name, request_status FROM farmers_land_records LIMIT 5`);
        console.log('\n✅ farmers_land_records exists! Sample data:');
        rows.rows.forEach(r => console.log(`  ${r.land_id} | ${r.land_owner_name} | ${r.request_status}`));
        console.log(`\nTotal columns found!`);
    } catch (e) {
        console.log('Error:', e.message);
    }
    await c.end();
}
verify().catch(e => console.error(e.message));
