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

  rows.forEach((entry) => {
    if (!totalConsumptionByHour[entry.hour]) {
      totalConsumptionByHour[entry.hour] = 0;
    }
    totalConsumptionByHour[entry.hour] += parseFloat(entry.kVAh_difference);
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