const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

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

// Fetch energy data for a specific date
async function getMeterWiseConsumptionForDate(date, currentDateTime) {
  const startOfDay = `${date} 00:00:00`;
  const endOfDay = new Date(date).toDateString() === new Date(currentDateTime).toDateString()
    ? currentDateTime
    : `${date} 23:59:59`;

  const [rows] = await pool.promise().query(
    `
    SELECT
      energy_meter_id,
      MAX(CASE WHEN kWh > 0 THEN kWh ELSE NULL END) - MIN(CASE WHEN kWh > 0 THEN kWh ELSE NULL END) AS kWh_difference
    FROM modbus_data
    WHERE timestamp BETWEEN ? AND ?
      AND energy_meter_id BETWEEN 1 AND 11
      AND kWh > 0
    GROUP BY energy_meter_id
    `,
    [startOfDay, endOfDay]
  );

  const meterWiseConsumption = rows.map((entry) => ({
    energy_meter_id: entry.energy_meter_id,
    consumption: entry.kWh_difference !== null 
      ? parseFloat(entry.kWh_difference).toFixed(1) // Round to one decimal point
      : 0 // Ensure no NaN values
  }));

  console.log('Meter-wise consumption:', meterWiseConsumption);

  return meterWiseConsumption;
}

// API handler
router.get('/econsumption', async (req, res) => {
  const { date, currentDateTime } = req.query;

  if (!date || !currentDateTime) {
    return res.status(400).json({ error: 'Date and currentDateTime are required' });
  }

  try {
    const consumptionData = await getMeterWiseConsumptionForDate(date, currentDateTime);
    res.status(200).json({ consumptionData });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

module.exports = router;
