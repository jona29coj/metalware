const express = require('express');
const mysql = require('mysql2');
const router = express.Router();

const pool = mysql.createPool({
  host: '18.188.231.51',
  user: 'admin',
  password: '2166',
  database: 'metalware',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

router.get('/hlcons', async (req, res) => {
  const { date, currentDateTime, period } = req.query;

  try {
    console.log(`[INFO] Fetching consumption data for the date: ${date}, up to: ${currentDateTime}, period: ${period}`);

    // Calculate the start time and end time based on the provided date and current time
    const startTime = `${date} 00:00:00`;
    const endTime = currentDateTime;

    const [rows] = await pool.promise().query(`
      SELECT 
        energy_meter_id, 
        MAX(CASE WHEN kWh > 0 THEN kWh ELSE NULL END) AS max_kWh, 
        MIN(CASE WHEN kWh > 0 THEN kWh ELSE NULL END) AS min_kWh 
      FROM modbus_data 
      WHERE energy_meter_id BETWEEN 1 AND 11 
        AND timestamp BETWEEN ? AND ? 
        AND kWh > 0
      GROUP BY energy_meter_id
    `, [startTime, endTime]);

    console.log(`[INFO] Fetched ${rows.length} rows of data`);

    const consumptionData = rows.map(row => ({
      meter_id: row.energy_meter_id,
      consumption: row.max_kWh !== null && row.min_kWh !== null 
        ? parseFloat((row.max_kWh - row.min_kWh).toFixed(1))
        : 0 // Ensure we don't calculate NULL values
    }));

    consumptionData.forEach(data => {
      console.log(`[INFO] Meter ID: ${data.meter_id}, Consumption: ${data.consumption} kWh`);
    });

    // Identify high and low consumption zones
    const highZone = consumptionData.reduce(
      (prev, current) => (prev.consumption > current.consumption ? prev : current), 
      { meter_id: "N/A", consumption: 0 }
    );

    // Filter out zero consumption values to ensure lowZone is meaningful
    const validConsumptionData = consumptionData.filter(zone => zone.consumption > 0);
    const lowZone = validConsumptionData.length > 0
      ? validConsumptionData.reduce((prev, current) => (prev.consumption < current.consumption ? prev : current))
      : { meter_id: "N/A", consumption: 0 };

    console.log(`[INFO] High Zone: Meter ID ${highZone.meter_id}, Consumption ${highZone.consumption} kWh`);
    console.log(`[INFO] Low Zone: Meter ID ${lowZone.meter_id}, Consumption ${lowZone.consumption} kWh`);

    res.json({ consumptionData, highZone, lowZone });
  } catch (error) {
    console.error('[ERROR] Error fetching consumption data:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
