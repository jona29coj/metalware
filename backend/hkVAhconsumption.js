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
});

async function fetchHourlyConsumption(startDateTime, endDateTime) {
  const query = `
  SELECT
    DATE_FORMAT(timestamp, '%Y-%m-%d %H:00:00') AS hour,
    energy_meter_id,
    MAX(kVAh) - COALESCE(
      LAG(MAX(kVAh)) OVER (PARTITION BY energy_meter_id ORDER BY DATE_FORMAT(timestamp, '%Y-%m-%d %H:00:00')),
      MIN(kVAh)
    ) AS kVAh_difference
  FROM modbus_data
  WHERE timestamp BETWEEN ? AND ?
    AND energy_meter_id BETWEEN 1 AND 11
  GROUP BY energy_meter_id, hour
  ORDER BY hour ASC;
  `;

  try {
    const [rows] = await pool.promise().query(query, [startDateTime, endDateTime]);

    const hourlyConsumption = rows.reduce((acc, { hour, kVAh_difference }) => {
      const roundedDifference = parseFloat(kVAh_difference || 0).toFixed(1);
      acc[hour] = (acc[hour] || 0) + parseFloat(roundedDifference);
      return acc;
    }, {});

    return hourlyConsumption;
  } catch (error) {
    throw error;
  }
}

router.get('/hkVAhconsumption', async (req, res) => {
  const { startDateTime, endDateTime } = req.query;

  if (!startDateTime || !endDateTime) {
    console.warn('Missing required query parameters:', { startDateTime, endDateTime });
    return res.status(400).json({ error: 'startDateTime and endDateTime are required' });
  }

  try {
    const consumptionData = await fetchHourlyConsumption(startDateTime, endDateTime);

    const roundedConsumptionData = Object.entries(consumptionData).reduce((acc, [hour, value]) => {
      acc[hour] = parseFloat(value).toFixed(1);
      return acc;
    }, {});

    res.status(200).json({ consumptionData: roundedConsumptionData }); 
  } catch (error) {
    console.error('Error in /hconsumption route:', error.message);
    res.status(500).json({ error: 'Database query failed' });
  }
});

module.exports = router;