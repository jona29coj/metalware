const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: '18.188.231.51',
  user: 'admin',
  password: '2166',
  database: 'metalware',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const pool = mysql.createPool(dbConfig);

async function getTotalConsumption(startDateTime, endDateTime) {
  const query = `
  SELECT 
  ROUND(SUM(kWh_difference), 1) AS consumption
FROM (
  SELECT 
    energy_meter_id,
    DATE(timestamp) AS day,
    (MAX(kWh) - MIN(kWh)) AS kWh_difference
  FROM 
    modbus_data
  WHERE 
    energy_meter_id BETWEEN 1 AND 11
    AND timestamp BETWEEN ? AND ?
  GROUP BY 
    energy_meter_id
) AS subquery;
  `;

  const [rows] = await pool.query(query, [startDateTime, endDateTime]);
  return rows[0]?.consumption || 0; 
}

router.get('/mccons', async (req, res) => {
  try {
    const { startDateTime, endDateTime } = req.query;

    if (!startDateTime || !endDateTime) {
      return res.status(400).json({
        error: 'Both startDateTime and endDateTime are required',
      });
    }

    const consumption = await getTotalConsumption(startDateTime, endDateTime);

    res.status(200).json({
      consumption, 
    });
  } catch (err) {
    console.error('Consumption calculation error:', err);
    res.status(500).json({
      error: 'Failed to calculate consumption',
      details: err.message,
    });
  }
});

module.exports = router;