const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const moment = require('moment-timezone');

const pool = mysql.createPool({
  host: '18.188.231.51',
  user: 'admin',
  password: '2166',
  database: 'metalware',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

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
      MAX(CASE WHEN kWh > 0 THEN kWh ELSE NULL END) - MIN(CASE WHEN kWh > 0 THEN kWh ELSE NULL END) AS kWh_difference
    FROM modbus_data
    WHERE timestamp BETWEEN ? AND ?
      AND energy_meter_id = ?
      AND kWh > 0
    GROUP BY energy_meter_id, hour
    `,
    [startOfDay, endOfDay, zone]
  );

  const totalConsumptionByHour = {};
  rows.forEach((entry) => {
    totalConsumptionByHour[entry.hour] = (totalConsumptionByHour[entry.hour] || 0) + parseFloat(entry.kWh_difference || 0);
  });

  // Generate full list of hourly periods for the given date
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

  return result;
}


router.get('/zconsumption', async (req, res) => {
  const { date, currentDateTime, zone } = req.query;

  if (!date || !currentDateTime || !zone) {
    return res.status(400).json({ error: 'Date, currentDateTime, and zone are required' });
  }

  try {
    const consumptionData = await getTotalConsumptionForZone(date, currentDateTime, zone);
    res.status(200).json({ consumptionData });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

module.exports = router;