const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// MySQL connection pool
const pool = mysql.createPool({
  host: '18.188.231.51',
  user: 'admin',
  password: '2166',
  database: 'metalware',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Helper function to determine rate period
const getRateInfo = (date) => {
  const hours = date.getHours();
  let period, rate;

  if (hours >= 5 && hours < 10) {
    period = "Off-Peak Hour (05:00:00 - 10:00:00)";
    rate = 6.035;
  } else if (hours >= 10 && hours < 19) {
    period = "Normal Hour (10:00:00 - 19:00:00)";
    rate = 7.10;
  } else if ((hours >= 19 && hours <= 23) || (hours >= 0 && hours < 3)) {
    period = "Peak Hour (19:00:00 - 03:00:00)";
    rate = 8.165;
  } else if (hours >= 3 && hours < 5) {
    period = "Normal Hour (03:00:00 - 05:00:00)";
    rate = 7.10;
  }

  return { period, rate };
};

// GET /cc - Calculate consumption cost
router.get('/cc', async (req, res) => {
  console.log(`[${new Date().toISOString()}] Received request for consumption cost calculation`);
  console.log(`Request query parameters:`, req.query);

  try {
    const { timestamp } = req.query;
    const currentTime = new Date(timestamp);
    console.log(`Processing consumption cost for timestamp: ${currentTime}`);

    const midnight = new Date(currentTime);
    midnight.setHours(0, 0, 0, 0);
    console.log(`Calculating consumption from midnight: ${midnight}`);

    const readings = await getKVAhReadingsFromDB(midnight, currentTime);

    if (!readings || readings.length === 0) {
      console.error('No consumption data available for the specified period');
      return res.status(404).json({ error: "No consumption data available" });
    }

    console.log(`Retrieved ${readings.length} readings from database`);

    let totalCost = 0;
    let totalConsumption = 0;

    let currentPeriodStart = new Date(midnight);
    let currentPeriodEnd = new Date(midnight);

    const periods = [
      { start: 0, end: 3, rate: 8.165, type: "Peak" },
      { start: 3, end: 5, rate: 7.10, type: "Normal" },
      { start: 5, end: 10, rate: 6.035, type: "Off-Peak" },
      { start: 10, end: 19, rate: 7.10, type: "Normal" },
      { start: 19, end: 24, rate: 8.165, type: "Peak" }
    ];

    console.log('Starting period-based cost calculation (per energy meter)...');

    for (const period of periods) {
      currentPeriodStart.setHours(period.start, 0, 0, 0);
      currentPeriodEnd.setHours(period.end, 0, 0, 0);

      if (currentPeriodStart > currentTime) break;
      if (currentPeriodEnd > currentTime) currentPeriodEnd = new Date(currentTime);

      console.log(`Processing ${period.type} period (${period.start}-${period.end}h)...`);

      const periodReadings = readings.filter(r => {
        const readingTime = new Date(r.timestamp);
        return readingTime >= currentPeriodStart && readingTime < currentPeriodEnd;
      });

      if (periodReadings.length === 0) {
        console.log(`  No readings found for this period`);
        continue;
      }

      let periodTotal = 0;

      for (let meterId = 1; meterId <= 11; meterId++) {
        const meterReadings = periodReadings.filter(r => r.energy_meter_id === meterId);

        if (meterReadings.length > 0) {
          const meterKVAh = meterReadings.map(r => r.kVAh);
          const max = Math.max(...meterKVAh);
          const min = Math.min(...meterKVAh);
          const consumption = max - min;
          periodTotal += consumption;

          console.log(`    Meter ${meterId} | Min: ${min}, Max: ${max}, Consumed: ${consumption.toFixed(2)} kVAh`);
        }
      }

      const periodCost = periodTotal * period.rate;

      console.log(`  Period Total Consumption: ${periodTotal.toFixed(2)} kVAh`);
      console.log(`  Period Cost: ₹${periodCost.toFixed(2)}`);

      totalConsumption += periodTotal;
      totalCost += periodCost;
    }

    const currentRateInfo = getRateInfo(currentTime);
    console.log(`Current rate information:
      Period: ${currentRateInfo.period}
      Rate: ₹${currentRateInfo.rate}/kVAh`);

    console.log(`Calculation complete:
      Total Consumption: ${totalConsumption.toFixed(2)} kVAh
      Total Cost: ₹${totalCost.toFixed(2)}
      Current Rate: ₹${currentRateInfo.rate}/kVAh`);

    res.json({
      totalConsumption: totalConsumption.toFixed(2),
      totalCost: totalCost.toFixed(2),
      currentRate: currentRateInfo.rate,
      currentPeriod: currentRateInfo.period,
      currency: "₹"
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error calculating consumption cost:`, error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message
    });
  }
});

// Fetch readings from modbus_data grouped by energy_meter_id, filtered by kVAh > 0
async function getKVAhReadingsFromDB(startTime, endTime) {
  console.log(`Querying database for readings between ${startTime} and ${endTime}`);

  try {
    const connection = await pool.getConnection();

    const [rows] = await connection.execute(
      `SELECT timestamp, kVAh, energy_meter_id FROM modbus_data 
       WHERE timestamp BETWEEN ? AND ?
       AND kVAh > 0
       AND energy_meter_id BETWEEN 1 AND 11
       ORDER BY energy_meter_id ASC, timestamp ASC`,
      [
        startTime.toISOString().slice(0, 19).replace('T', ' '),
        endTime.toISOString().slice(0, 19).replace('T', ' ')
      ]
    );

    connection.release();

    console.log(`Fetched ${rows.length} readings from the database`);
    return rows;

  } catch (error) {
    console.error('Error fetching readings from database:', error);
    throw error;
  }
}

module.exports = router;
