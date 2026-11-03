require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Step 1: Migrate existing status values to proper case...');

        // Map: old value → new value
        await client.query(`UPDATE farmers_land_records SET request_status = 'Pending'  WHERE LOWER(request_status) = 'pending'`);
        await client.query(`UPDATE farmers_land_records SET request_status = 'Verified' WHERE LOWER(request_status) IN ('verified', 'approved')`);
        await client.query(`UPDATE farmers_land_records SET request_status = 'Rejected' WHERE LOWER(request_status) = 'rejected'`);
        // Anything else → Pending
        await client.query(`UPDATE farmers_land_records SET request_status = 'Pending'  WHERE request_status NOT IN ('Pending','Verified','Rejected')`);

        const vals = await client.query(`SELECT DISTINCT request_status FROM farmers_land_records`);
        console.log('Status values after migration:', vals.rows.map(r => r.request_status));

        console.log('Step 2: Drop old constraint...');
        await client.query(`ALTER TABLE farmers_land_records DROP CONSTRAINT IF EXISTS farmers_land_records_request_status_check`);

        console.log('Step 3: Add correct constraint...');
        await client.query(`
      ALTER TABLE farmers_land_records
      ADD CONSTRAINT farmers_land_records_request_status_check
      CHECK (request_status IN ('Pending', 'Verified', 'Rejected'))
    `);

        console.log('✅ Migration complete! Constraint now allows: Pending | Verified | Rejected');
    } catch (err) {
        console.error('Migration error:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
