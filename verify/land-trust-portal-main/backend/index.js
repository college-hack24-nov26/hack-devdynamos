require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// ─── PostgreSQL Connection Pool ───────────────────────────────────────────────
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.connect()
  .then(async (client) => {
    console.log(`✅ Connected to PostgreSQL – database: ${process.env.DB_NAME}`);
    client.release();
    // Auto-migrate: add survey_number and total_area columns if missing
    try {
      await pool.query(`ALTER TABLE farmers_land_records ADD COLUMN IF NOT EXISTS survey_number VARCHAR(50)`);
      await pool.query(`ALTER TABLE farmers_land_records ADD COLUMN IF NOT EXISTS total_area NUMERIC(10,4)`);
      // Seed sample data where null
      const rows = await pool.query(`SELECT land_id FROM farmers_land_records WHERE survey_number IS NULL`);
      for (let i = 0; i < rows.rows.length; i++) {
        const id = rows.rows[i].land_id;
        const surveyNum = `21/${i + 1}`;
        const area = (0.80 + i * 0.12).toFixed(4);
        await pool.query(
          `UPDATE farmers_land_records SET survey_number=$1, total_area=$2 WHERE land_id=$3`,
          [surveyNum, area, id]
        );
      }
      console.log('✅ Migration complete: survey_number and total_area columns ready');
    } catch (err) {
      console.error('⚠️  Migration warning:', err.message);
    }
  })
  .catch((err) => {
    console.error('❌ PostgreSQL connection error:', err.message);
    process.exit(1);
  });

// ─── GET /api/farmers ─────────────────────────────────────────────────────────
// Query params:
//   ?status=Pending|Verified|Rejected   → filter by request_status
//   ?search=name_fragment               → search by land_owner_name (case-insensitive)
app.get('/api/farmers', async (req, res) => {
  try {
    const { status, search } = req.query;
    const values = [];
    const conditions = [];

    if (status && status !== 'All') {
      values.push(status);
      conditions.push(`request_status = $${values.length}`);
    }
    if (search && search.trim()) {
      values.push(`%${search.trim()}%`);
      conditions.push(`land_owner_name ILIKE $${values.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = `SELECT * FROM farmers_land_records ${whereClause} ORDER BY land_id`;
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error('GET /api/farmers error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/farmers/counts ──────────────────────────────────────────────────
// Returns { total, pending, verified, rejected }
app.get('/api/farmers/counts', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*)                                             AS total,
        COUNT(*) FILTER (WHERE request_status = 'Pending')  AS pending,
        COUNT(*) FILTER (WHERE request_status = 'Verified') AS verified,
        COUNT(*) FILTER (WHERE request_status = 'Rejected') AS rejected
      FROM farmers_land_records
    `);
    const row = result.rows[0];
    res.json({
      total: parseInt(row.total),
      pending: parseInt(row.pending),
      verified: parseInt(row.verified),
      rejected: parseInt(row.rejected),
    });
  } catch (err) {
    console.error('GET /api/farmers/counts error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/farmers/:id ─────────────────────────────────────────────────────
app.get('/api/farmers/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM farmers_land_records WHERE land_id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Farmer not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('GET /api/farmers/:id error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── PATCH /api/farmers/:id/status ───────────────────────────────────────────
// Body: { status: "Verified" | "Rejected" }
app.patch('/api/farmers/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    console.log(`\n📝 PATCH received → ID: "${id}", new status: "${status}"`);
    if (!['Verified', 'Rejected', 'Pending'].includes(status)) {
      console.log(`❌ Invalid status: "${status}"`);
      return res.status(400).json({ error: 'Invalid status value' });
    }
    const result = await pool.query(
      'UPDATE farmers_land_records SET request_status = $1 WHERE land_id = $2 RETURNING *',
      [status, id]
    );
    if (result.rows.length === 0) {
      console.log(`❌ No record found with land_id: "${id}"`);
      return res.status(404).json({ error: 'Farmer not found' });
    }
    console.log(`✅ DB updated: ${result.rows[0].land_owner_name} → ${result.rows[0].request_status}`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('PATCH /api/farmers/:id/status error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /api/farmers/:id ──────────────────────────────────────────────────
app.delete('/api/farmers/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM farmers_land_records WHERE land_id = $1 RETURNING land_id',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Farmer not found' });
    }
    res.json({ message: `Record ${req.params.id} deleted successfully` });
  } catch (err) {
    console.error('DELETE /api/farmers/:id error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Land Trust API running at http://localhost:${PORT}`);
  console.log('   Endpoints:');
  console.log('   GET    /api/farmers          (all, ?status=, ?search=)');
  console.log('   GET    /api/farmers/counts   (status counts)');
  console.log('   GET    /api/farmers/:id      (single record)');
  console.log('   PATCH  /api/farmers/:id/status');
  console.log('   DELETE /api/farmers/:id');
});
