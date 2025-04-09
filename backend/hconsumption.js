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
async function getTotalConsumptionForDate(date, currentDateTime) {
  const startOfDay = `${date} 00:00:00`;
  const endOfDay = new Date(date).toDateString() === new Date(currentDateTime).toDateString()
    ? currentDateTime
    : `${date} 23:59:59`;

  const [rows] = await pool.promise().query(
    `
    SELECT
      DATE_FORMAT(timestamp, '%Y-%m-%d %H:00:00') AS hour,
      energy_meter_id,
      MAX(CASE WHEN kWh > 0 THEN kWh ELSE NULL END) - MIN(CASE WHEN kWh > 0 THEN kWh ELSE NULL END) AS kWh_difference
    FROM modbus_data
    WHERE timestamp BETWEEN ? AND ?
      AND energy_meter_id BETWEEN 1 AND 11
      AND kWh > 0
    GROUP BY energy_meter_id, hour
    `,
    [startOfDay, endOfDay]
  );

  const totalConsumptionByHour = {};

  rows.forEach((entry) => {
    if (!totalConsumptionByHour[entry.hour]) {
      totalConsumptionByHour[entry.hour] = 0;
    }
    totalConsumptionByHour[entry.hour] += parseFloat(entry.kWh_difference || 0); // Handle NULL values
  });

  const result = Object.keys(totalConsumptionByHour).map((hour) => ({
    hour,
    total_consumption: totalConsumptionByHour[hour].toFixed(1) // Round to one decimal point
  }));

  // Sort the result array by hour
  result.sort((a, b) => new Date(a.hour) - new Date(b.hour));

  result.forEach((entry) => {
    console.log(`Hour: ${entry.hour}, Total Consumption: ${entry.total_consumption}`);
  });

  return result;
}


// API handler
router.get('/hconsumption', async (req, res) => {
  const { date, currentDateTime } = req.query;

  if (!date || !currentDateTime) {
    return res.status(400).json({ error: 'Date and currentDateTime are required' });
  }

  // Log the date and currentDateTime received from the frontend
  console.log('Date received from frontend:', date);
  console.log('Current DateTime received from frontend:', currentDateTime);

  try {
    const consumptionData = await getTotalConsumptionForDate(date, currentDateTime);
    res.status(200).json({ consumptionData });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

module.exports = router;