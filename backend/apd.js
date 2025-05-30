const express = require('express');
const mysql = require('mysql2');
const router = express.Router();

const pool = mysql.createPool({
  host: '18.188.231.51',
  user: 'admin',
  password: '2166',
  database: 'metalware',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function getPeakDemandAboveThreshold(startDateTime, endDateTime) {
  const [rows] = await pool.promise().query(
    `
    SELECT
      DATE_FORMAT(timestamp, '%Y-%m-%d %H:%i:00') AS minute,
      SUM(total_kVA) AS total_kVA
    FROM modbus_data
    WHERE energy_meter_id BETWEEN 1 AND 11
      AND timestamp BETWEEN ? AND ?
    GROUP BY minute
    HAVING SUM(total_kVA) > 596
    ORDER BY minute DESC
    `,
    [startDateTime, endDateTime]
  );

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
  });

  return result;
}

router.get('/apd', async (req, res) => { 
  const { startDateTime, endDateTime } = req.query;
  if (!startDateTime || !endDateTime) {
    return res.status(400).json({ error: 'Date and currentDateTime are required' });
  }

  try {
    const peakDemandAboveThresholdData = await getPeakDemandAboveThreshold(startDateTime, endDateTime);
    res.status(200).json({
      peakDemandAboveThreshold: peakDemandAboveThresholdData
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

module.exports = router;