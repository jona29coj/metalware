// mccons.js - Optimized Energy Consumption Module
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: '18.188.231.51',
  user: 'admin',
  password: '2166',
  database: 'metalware',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Constants
const METER_COUNT = 11;
const TIMESTAMP_REGEX = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

// Helper: Pad single-digit numbers with zero
const pad = (n) => n.toString().padStart(2, '0');

// Helper: Format date as "YYYY-MM-DD HH:mm:ss"
const formatDate = (d, h = 0, m = 0, s = 0) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(h)}:${pad(m)}:${pad(s)}`;

// Helper: Get meter consumption between two timestamps
async function getMeterConsumption(meterId, startTimestamp, endTimestamp) {
  const [rows] = await pool.query(`
    SELECT 
      (SELECT kWh FROM modbus_data 
       WHERE energy_meter_id = ? 
         AND timestamp >= ? 
         AND kWh > 0
       ORDER BY timestamp ASC LIMIT 1) as start,
      
      (SELECT kWh FROM modbus_data 
       WHERE energy_meter_id = ? 
         AND timestamp <= ? 
         AND kWh > 0
       ORDER BY timestamp DESC LIMIT 1) as end
  `, [meterId, startTimestamp, meterId, endTimestamp]);

  if (!rows[0].start || !rows[0].end) return 0;

  return Math.max(0, rows[0].end - rows[0].start);
}

// Calculate total consumption from all meters
router.get('/mccons', async (req, res) => {
  try {
    const { timestamp } = req.query;

    // Validate input
    if (!timestamp) {
      return res.status(400).json({ 
        error: 'Timestamp parameter is required',
        format: 'YYYY-MM-DD HH:mm:ss' 
      });
    }

    if (!TIMESTAMP_REGEX.test(timestamp)) {
      return res.status(400).json({ 
        error: 'Invalid timestamp format',
        expected: 'YYYY-MM-DD HH:mm:ss',
        received: timestamp
      });
    }

    const inputDate = new Date(timestamp);
    const now = new Date();
    const isToday = inputDate.toDateString() === now.toDateString();

    const startTimestamp = formatDate(inputDate, 0, 0, 0);
    const endTimestamp = isToday 
      ? formatDate(now, now.getHours(), now.getMinutes(), now.getSeconds()) 
      : formatDate(inputDate, 23, 59, 59);

    // Process all meters in parallel
    const meterPromises = [];
    for (let meterId = 1; meterId <= METER_COUNT; meterId++) {
      meterPromises.push(getMeterConsumption(meterId, startTimestamp, endTimestamp));
    }

    const results = await Promise.all(meterPromises);
    const totalConsumption = results.reduce((sum, current) => sum + current, 0);

    res.json({
      success: true,
      consumption: parseFloat(totalConsumption.toFixed(2)),
      unit: "kWh",
      startTimestamp,
      endTimestamp,
      meterCount: METER_COUNT
    });

  } catch (err) {
    console.error('Consumption calculation error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to calculate consumption',
      details: err.message
    });
  }
});

module.exports = router;
