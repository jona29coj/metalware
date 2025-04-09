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

// Fetch energy consumption data with zone names
async function getConsumptionData(date, currentDateTime, period) {
  let startTime, endTime;
  
  // Calculate time range based on period
  if (period === 'day') {
    startTime = `${date} 00:00:00`;
    endTime = new Date(date).toDateString() === new Date(currentDateTime).toDateString()
      ? currentDateTime
      : `${date} 23:59:59`;
  } else if (period === 'week') {
    const dateObj = new Date(date);
    const startDate = new Date(dateObj.setDate(dateObj.getDate() - dateObj.getDay()));
    const endDate = new Date(dateObj.setDate(dateObj.getDate() + 6));
    
    startTime = `${startDate.toISOString().slice(0, 10)} 00:00:00`;
    endTime = `${endDate.toISOString().slice(0, 10)} 23:59:59`;
  } else if (period === 'month') {
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth();
    
    startTime = `${year}-${(month + 1).toString().padStart(2, '0')}-01 00:00:00`;
    endTime = `${year}-${(month + 1).toString().padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()} 23:59:59`;
  }

  // Get consumption data for the period
  const [rows] = await pool.promise().query(
    `
    SELECT
      energy_meter_id,
      MAX(kWh) - MIN(kWh) AS consumption
    FROM modbus_data
    WHERE timestamp BETWEEN ? AND ?
      AND energy_meter_id BETWEEN 1 AND 11
    GROUP BY energy_meter_id
    `,
    [startTime, endTime]
  );

  // Format response with meter ID and consumption
  return rows.map(row => ({
    meterId: row.energy_meter_id,
    consumption: parseFloat(row.consumption).toFixed(1)
  }));
}

// API endpoint for consumption data
router.get('/consumption', async (req, res) => {
  const { date, currentDateTime, period } = req.query;

  if (!date || !currentDateTime || !period) {
    return res.status(400).json({ 
      error: 'Date, currentDateTime, and period are required' 
    });
  }

  try {
    const consumptionData = await getConsumptionData(date, currentDateTime, period);
    if (!consumptionData.length) {
      // If no data found, respond with 404
      return res.status(404).json({ error: 'No consumption data found' });
    }
    res.status(200).json({ consumptionData });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

module.exports = router;