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

// Fetch peak demand data for every minute of a specific date
async function getPeakDemandForDate(date, currentDateTime) {
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
    ORDER BY minute
    `,
    [startOfDay, endOfDay]
  );

  const result = rows.map(entry => ({
    minute: entry.minute,
    total_kVA: parseFloat(entry.total_kVA).toFixed(1) // Round to one decimal point
  }));

  // Log values with their timestamps
  result.forEach(entry => {
    console.log(`Timestamp: ${entry.minute}, Total kVA: ${entry.total_kVA}`);
  });

  return result;
}

// API handler
router.get('/opeakdemand', async (req, res) => {
  const { date, currentDateTime } = req.query;

  if (!date || !currentDateTime) {
    return res.status(400).json({ error: 'Date and currentDateTime are required' });
  }

  // Log the received parameters
  console.log('Date received from frontend:', date);
  console.log('Current DateTime received from frontend:', currentDateTime);

  try {
    const peakDemandData = await getPeakDemandForDate(date, currentDateTime);
    res.status(200).json({ peakDemandData });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

module.exports = router;