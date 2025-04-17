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
      MAX(CASE WHEN kVAh > 0 THEN kVAh ELSE NULL END) - MIN(CASE WHEN kVAh > 0 THEN kVAh ELSE NULL END) AS kVAh_difference
    FROM modbus_data
    WHERE timestamp BETWEEN ? AND ?
      AND energy_meter_id BETWEEN 1 AND 11
      AND kVAh > 0
    GROUP BY energy_meter_id, hour
    `,
    [startOfDay, endOfDay]
  );

  const totalConsumptionByHour = {};

  rows.forEach((entry) => {
    if (!totalConsumptionByHour[entry.hour]) {
      totalConsumptionByHour[entry.hour] = 0;
    }
    totalConsumptionByHour[entry.hour] += parseFloat(entry.kVAh_difference || 0);
  });

  const result = [];
  let currentTime = new Date(startOfDay);

  while (currentTime <= new Date(endOfDay)) {
    const hour = `${currentTime.getFullYear()}-${(currentTime.getMonth() + 1).toString().padStart(2, '0')}-${currentTime.getDate().toString().padStart(2, '0')} ${currentTime.getHours().toString().padStart(2, '0')}:00:00`;

    result.push({
      hour,
      total_consumption: (totalConsumptionByHour[hour] || 0).toFixed(1)
    });

    currentTime.setHours(currentTime.getHours() + 1);
  }

  result.sort((a, b) => new Date(a.hour) - new Date(b.hour));

  result.forEach((entry) => {
    console.log(`Hour: ${entry.hour}, Total Consumption: ${entry.total_consumption}`);
  });

  return result;
}



// API handler
router.get('/hkVAhconsumption', async (req, res) => {
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