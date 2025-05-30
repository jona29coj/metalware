const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: '18.188.231.51',
  user: 'admin',
  password: '2166',
  database: 'metalware',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function getTotalKVAForAllZonesPerMinute(startDateTime, endDateTime) {
  // Query to select data for all relevant energy_meter_ids (1 to 11)
  // for the given time range.
  const [rows] = await pool.promise().query(
    `
    SELECT
      DATE_FORMAT(timestamp, '%Y-%m-%d %H:%i:00') AS minute,
      energy_meter_id AS zone_id,
      total_kVA
    FROM modbus_data
    WHERE timestamp BETWEEN ? AND ?
      AND energy_meter_id BETWEEN 1 AND 11
    ORDER BY energy_meter_id ASC, timestamp ASC
    `,
    [startDateTime, endDateTime]
  );

  return rows;
}

router.get('/zkVAaz', async (req, res) => {
  const { startDateTime, endDateTime } = req.query;

  if (!startDateTime || !endDateTime) {
    return res.status(400).json({ error: 'startDateTime and endDateTime are required' });
  }

  try {
    const kvaAllZonesData = await getTotalKVAForAllZonesPerMinute(startDateTime, endDateTime);
    // Respond with an array containing data for all zones
    res.status(200).json({ kvaAllZonesData });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

module.exports = router;