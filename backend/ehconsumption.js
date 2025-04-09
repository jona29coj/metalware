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

// Fetch hourly energy data for a specific date range
async function getHourlyConsumptionForRange(startDate, endDate, currentDateTime) {
  console.log(`Querying database from ${startDate} to ${endDate}, current time: ${currentDateTime}`);

  try {
    const [rows] = await pool.promise().query(
      `
      SELECT
        DATE_FORMAT(timestamp, '%Y-%m-%d') AS day,
        HOUR(timestamp) AS hour,
        energy_meter_id,
        MAX(kWh) - MIN(kWh) AS kWh_difference
      FROM modbus_data
      WHERE timestamp BETWEEN ? AND ?
        AND energy_meter_id BETWEEN 1 AND 11
        AND kWh > 0
        AND timestamp <= ?  -- Only include data up to current time
      GROUP BY day, hour, energy_meter_id
      HAVING MIN(kWh) > 0 AND MAX(kWh) > 0
      ORDER BY day, hour, energy_meter_id;
      `,
      [startDate, endDate, currentDateTime]
    );

    // Rest of the function remains the same...
    const hourlyConsumption = {};

    rows.forEach((entry) => {
      if (!hourlyConsumption[entry.day]) {
        hourlyConsumption[entry.day] = {};
      }
      if (!hourlyConsumption[entry.day][entry.hour]) {
        hourlyConsumption[entry.day][entry.hour] = 0;
      }
      hourlyConsumption[entry.day][entry.hour] += parseFloat(entry.kWh_difference);
    });

    const result = [];
    for (const day in hourlyConsumption) {
      for (const hour in hourlyConsumption[day]) {
        result.push({
          day,
          hour: parseInt(hour),
          total_consumption: hourlyConsumption[day][hour].toFixed(2)
        });
      }
    }

    console.log('Hourly consumption:', result);
    return result;
  } catch (error) {
    console.error('Database query failed:', error);
    throw error;
  }
}

// API handler
router.get('/ehconsumption', async (req, res) => {
  const { startDate, endDate, currentDateTime } = req.query;

  if (!startDate || !endDate || !currentDateTime) {
    // Default to last 30 days if no dates provided
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    
    try {
      const currentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const consumptionData = await getHourlyConsumptionForRange(
        startDate.toISOString().slice(0, 19).replace('T', ' '),
        endDate.toISOString().slice(0, 19).replace('T', ' '),
        currentDateTime
      );
      return res.status(200).json({ consumptionData });
    } catch (error) {
      console.error('Error handling request:', error);
      return res.status(500).json({ error: 'Database query failed' });
    }
  }

  try {
    const consumptionData = await getHourlyConsumptionForRange(startDate, endDate, currentDateTime);
    res.status(200).json({ consumptionData });
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

module.exports = router;