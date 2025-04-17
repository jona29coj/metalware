const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const moment = require('moment-timezone');

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

// Fetch energy data for a specific date and zone
async function getTotalConsumptionForZone(date, currentDateTime, zone) {
  const startOfDay = `${date} 00:00:00`;
  const endOfDay = moment(date).isSame(moment(currentDateTime), 'day')
    ? currentDateTime
    : `${date} 23:59:59`;

  const [rows] = await pool.promise().query(
    `
    SELECT
      DATE_FORMAT(timestamp, '%Y-%m-%d %H:00:00') AS hour,
      energy_meter_id,
      MAX(kVAh) - MIN(kVAh) AS kVAh_difference
    FROM modbus_data
    WHERE timestamp BETWEEN ? AND ?
      AND energy_meter_id = ?
    GROUP BY energy_meter_id, hour
    `,
    [startOfDay, endOfDay, zone]
  );

  const totalConsumptionByHour = {};

  // Accumulate actual consumption from query
  rows.forEach((entry) => {
    totalConsumptionByHour[entry.hour] = (totalConsumptionByHour[entry.hour] || 0) + parseFloat(entry.kVAh_difference || 0);
  });

  // Create hourly blocks between start and end time
  const result = [];
  let currentTime = moment(startOfDay);
  const finalTime = moment(endOfDay);

  while (currentTime <= finalTime) {
    const hour = currentTime.format('YYYY-MM-DD HH:00:00');
    result.push({
      hour,
      total_consumption: (totalConsumptionByHour[hour] || 0).toFixed(1),
    });
    currentTime.add(1, 'hour');
  }

  // Final sorting (just to be sure)
  result.sort((a, b) => new Date(a.hour) - new Date(b.hour));

  // Optional: log to console
  result.forEach((entry) => {
    console.log(`Hour: ${entry.hour}, Total Consumption: ${entry.total_consumption}`);
  });

  return result;
}


// API handler
router.get('/zkVAhconsumption', async (req, res) => {
  const { date, currentDateTime, zone } = req.query;

  if (!date || !currentDateTime || !zone) {
    return res.status(400).json({ error: 'Date, currentDateTime, and zone are required' });
  }

  // Log the received parameters
  console.log('Date received from frontend:', date);
  console.log('Current DateTime received from frontend:', currentDateTime);
  console.log('Zone received from frontend:', zone);

  try {
    const consumptionData = await getTotalConsumptionForZone(date, currentDateTime, zone);
    res.status(200).json({ consumptionData });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

module.exports = router;