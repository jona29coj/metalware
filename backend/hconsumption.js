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

  // Populate the totalConsumptionByHour map with data from the query
  rows.forEach((entry) => {
    totalConsumptionByHour[entry.hour] = (totalConsumptionByHour[entry.hour] || 0) + parseFloat(entry.kWh_difference || 0);
  });

  // Create an array of all hours from 00:00:00 to 23:59:59
  const result = [];
  let currentTime = new Date(startOfDay);

  while (currentTime <= new Date(endOfDay)) {
    const hour = `${currentTime.getFullYear()}-${(currentTime.getMonth() + 1).toString().padStart(2, '0')}-${currentTime.getDate().toString().padStart(2, '0')} ${currentTime.getHours().toString().padStart(2, '0')}:00:00`;

    // Check if we have consumption data for this hour, otherwise set it to 0
    result.push({
      hour,
      total_consumption: (totalConsumptionByHour[hour] || 0).toFixed(1), // Set to 0 if not found
    });

    currentTime.setHours(currentTime.getHours() + 1);
  }

  // Sort the result array by hour (in case there are missing hours)
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