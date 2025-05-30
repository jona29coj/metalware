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
      SELECT MAX(total_kVA) AS peakDemand
      FROM modbus_data
      WHERE energy_meter_id = 12
        AND timestamp BETWEEN ? AND ?
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