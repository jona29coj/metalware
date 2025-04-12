const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: '18.188.231.51',
  user: 'admin',
  password: '2166',
  database: 'metalware',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});



const TIMESTAMP_REGEX = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

router.get('/dashboard', async (req, res) => {
  try {
    const { timestamp } = req.query;

    if (!timestamp) {
      return res.status(400).json({
        error: 'Timestamp parameter is required',
        format: 'YYYY-MM-DD HH:mm:ss',
      });
    }

    if (!TIMESTAMP_REGEX.test(timestamp)) {
      return res.status(400).json({
        error: 'Invalid timestamp format',
        expected: 'YYYY-MM-DD HH:mm:ss',
        received: timestamp,
      });
    }

    // ----------------------------------
    // 1. Total Meter Consumption Query
    // ----------------------------------
    const [meterRows] = await pool.query(`
      SELECT SUM(end_kWh - start_kWh) AS totalConsumption FROM (
        SELECT 
          energy_meter_id,
          (SELECT kWh FROM modbus_data 
           WHERE energy_meter_id = m.energy_meter_id 
             AND DATE(timestamp) = DATE(?) 
             AND kWh > 0
           ORDER BY timestamp ASC LIMIT 1) AS start_kWh,

          (SELECT kWh FROM modbus_data 
           WHERE energy_meter_id = m.energy_meter_id 
             AND timestamp <= ? 
             AND kWh > 0
           ORDER BY timestamp DESC LIMIT 1) AS end_kWh

        FROM (
          SELECT DISTINCT energy_meter_id FROM modbus_data 
          WHERE DATE(timestamp) = DATE(?) AND energy_meter_id BETWEEN 1 AND 11
        ) AS m
      ) AS consumption_data
      WHERE start_kWh IS NOT NULL AND end_kWh IS NOT NULL;
    `, [timestamp, timestamp, timestamp]);

    const totalConsumption = parseFloat(meterRows[0]?.totalConsumption?.toFixed(2) || "0");

    // ----------------------------------
    // 2. Add more queries here as needed
    // 2. Peak demand stats
const [peakDemandResult] = await pool.query(
  `
  WITH minute_totals AS (
    SELECT 
      DATE_FORMAT(timestamp, '%Y-%m-%d %H:%i:00') as minute,
      SUM(total_kVA) as total_kVA
    FROM modbus_data
    WHERE DATE(timestamp) = DATE(?)
      AND timestamp <= ?
      AND energy_meter_id BETWEEN 1 AND 11
    GROUP BY DATE_FORMAT(timestamp, '%Y-%m-%d %H:%i:00')
  )
  SELECT 
    MAX(total_kVA) as peakDemand,
    COUNT(minute) as minutesEvaluated,
    MIN(minute) as firstMinute,
    MAX(minute) as lastMinute
  FROM minute_totals
  `,
  [timestamp, timestamp]
);

const peakDemand = peakDemandResult[0]?.peakDemand || 0;

const startOfDay = timestamp.split(' ')[0] + ' 00:00:00';
const endOfDay = timestamp.split(' ')[0] + ' 23:59:59';

// 3. Meter-wise daily consumption
const [rows] = await pool.query(
  `
  SELECT
    energy_meter_id,
    MAX(CASE WHEN kWh > 0 THEN kWh ELSE NULL END) - MIN(CASE WHEN kWh > 0 THEN kWh ELSE NULL END) AS kWh_difference
  FROM modbus_data
  WHERE timestamp BETWEEN ? AND ?
    AND energy_meter_id BETWEEN 1 AND 11
    AND kWh > 0
  GROUP BY energy_meter_id
  `,
  [startOfDay, endOfDay]
);

const meterWiseConsumption = rows.map((entry) => ({
  energy_meter_id: entry.energy_meter_id,
  consumption: entry.kWh_difference !== null 
    ? parseFloat(entry.kWh_difference).toFixed(1) 
    : 0 
}));


    // e.g., chiller efficiency, solar stats, ev charger sessions, etc.
    // ----------------------------------

    // Example dummy stats (you can replace with real ones later)
    const chillerEfficiency = 86.3;
    const solarOutput = 128.5;
    const evSessions = 6;
    const buildingConsumption = 204.7;

    // Final response
    res.json({
      success: true,
      timestamp,
      data: {
        totalConsumption: {
          value: totalConsumption,
          unit: "kWh",
        },
        peakDemand: {
          value: peakDemand,
          unit: "kVA",
        },
        meterWiseConsumption,
        solarOutput: {
          value: solarOutput,
          unit: "kWh",
        },
        evSessions: {
          value: evSessions,
          unit: "sessions",
        },
        buildingConsumption: {
          value: buildingConsumption,
          unit: "kWh",
        },
        // Add more data here if needed
      },
    });

  } catch (err) {
    console.error('Dashboard fetch error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard summary',
      details: err.message,
    });
  }
});

module.exports = router;
