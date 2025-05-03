const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: '18.188.231.51',
  user: 'admin',
  password: '2166',
  database: 'metalware',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

router.get('/mcpeak', async (req, res) => {
  const { startDateTime, endDateTime } = req.query;

  if (!startDateTime || !endDateTime) {
    return res.status(400).json({
      error: 'Both startDateTime and endDateTime are required',
    });
  }

  try {
    const [rows] = await pool.query(
      `
      SELECT 
    MAX(peakDemand) AS peakDemand
FROM (
    SELECT 
        SUM(ROUND(total_kVA, 1)) AS peakDemand
    FROM modbus_data
    WHERE DATE(timestamp) = DATE(?)
      AND timestamp <= ?
      AND energy_meter_id BETWEEN 1 AND 11
    GROUP BY DATE_FORMAT(timestamp, '%Y-%m-%d %H:%i:00')
) AS subquery;
    `,
      [startDateTime, endDateTime]
    );

    res.status(200).json({
      peakDemand: rows[0]?.peakDemand || 0, 
    });
  } catch (err) {
    console.error('Error fetching peak demand:', err);
    res.status(500).json({
      error: 'Failed to fetch peak demand data',
      details: err.message,
    });
  }
});

module.exports = router;