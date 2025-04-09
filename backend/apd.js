// apd.js
const express = require('express');
const mysql = require('mysql2');
const router = express.Router();

// Create a connection pool for MariaDB
const pool = mysql.createPool({
  host: '18.188.231.51',
  user: 'admin',
  password: '2166',
  database: 'metalware',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Fetch peak demand data for every minute of a specific date and filter kVA > 558.75
async function getPeakDemandAboveThreshold(date, currentDateTime, threshold = 558.75) {
  const startOfDay = `${date} 00:00:00`;
  const endOfDay = date === currentDateTime.split(' ')[0] ? currentDateTime : `${date} 23:59:59`;

  const [rows] = await pool.promise().query(
    `
    SELECT
      DATE_FORMAT(timestamp, '%Y-%m-%d %H:%i:00') AS minute,
      SUM(total_kVA) AS total_kVA
    FROM modbus_data
    WHERE energy_meter_id BETWEEN 1 AND 11
      AND timestamp BETWEEN ? AND ?
    GROUP BY minute
    HAVING SUM(total_kVA) > ?
    ORDER BY minute
    `,
    [startOfDay, endOfDay, threshold]
  );

  // Process the data with auto-incrementing IDs
  const result = [];
  let id = 1;

  rows.forEach(entry => {
    const kVA = parseFloat(entry.total_kVA).toFixed(1);
    const entryWithId = {
      id: id++,
      minute: entry.minute,
      total_kVA: kVA
    };
    result.push(entryWithId);

    // Log values with their timestamps
    console.log(`Timestamp (Above ${threshold}): ${entry.minute}, Total kVA: ${kVA}`);
  });

  return result;
}

// API handler to return kVA values above the threshold
router.get('/apd', async (req, res) => { // Changed the route to '/' as requested
  const { date, currentDateTime } = req.query;
  const threshold = 558.75; // Define the threshold here

  if (!date || !currentDateTime) {
    return res.status(400).json({ error: 'Date and currentDateTime are required' });
  }

  // Log the received parameters
  console.log('Date received from frontend:', date);
  console.log('Current DateTime received from frontend:', currentDateTime);

  try {
    const peakDemandAboveThresholdData = await getPeakDemandAboveThreshold(date, currentDateTime, threshold);
    res.status(200).json({
      peakDemandAboveThreshold: peakDemandAboveThresholdData
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

module.exports = router;