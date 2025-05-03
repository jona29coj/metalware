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

router.get('/cc', async (req, res) => {
  try {
    const { startDateTime, endDateTime } = req.query;
    const query = `
      SELECT 
        SUM(consumption) AS totalConsumption,
        ROUND(SUM(cost),1) AS totalCost,
        MAX(CASE 
          WHEN HOUR(NOW()) BETWEEN 5 AND 9 THEN 6.035
          WHEN HOUR(NOW()) BETWEEN 10 AND 18 THEN 7.10
          WHEN HOUR(NOW()) BETWEEN 19 AND 23 OR HOUR(NOW()) BETWEEN 0 AND 2 THEN 8.165
          ELSE 7.10
        END) AS currentRate,
        CASE
          WHEN HOUR(NOW()) BETWEEN 5 AND 9 THEN "Off-Peak Hour (05:00:00 - 10:00:00)"
          WHEN HOUR(NOW()) BETWEEN 10 AND 18 THEN "Normal Hour (10:00:00 - 19:00:00)"
          WHEN HOUR(NOW()) BETWEEN 19 AND 23 OR HOUR(NOW()) BETWEEN 0 AND 2 THEN "Peak Hour (19:00:00 - 03:00:00)"
          ELSE "Normal Hour (03:00:00 - 05:00:00)"
        END AS currentPeriod
      FROM (
        SELECT 
          energy_meter_id,
          ROUND(MAX(kVAh) - MIN(kVAh), 2) AS consumption,
          CASE
            WHEN HOUR(timestamp) BETWEEN 5 AND 9 THEN (MAX(kVAh) - MIN(kVAh)) * 6.035
            WHEN HOUR(timestamp) BETWEEN 10 AND 18 THEN (MAX(kVAh) - MIN(kVAh)) * 7.10
            WHEN HOUR(timestamp) BETWEEN 19 AND 23 OR HOUR(timestamp) BETWEEN 0 AND 2 THEN (MAX(kVAh) - MIN(kVAh)) * 8.165
            ELSE (MAX(kVAh) - MIN(kVAh)) * 7.10
          END AS cost
        FROM modbus_data
        WHERE timestamp BETWEEN ? AND ?
          AND energy_meter_id BETWEEN 1 AND 11
        GROUP BY energy_meter_id, HOUR(timestamp)
      ) AS period_data;
    `;

    const [rows] = await pool.query(query, [startDateTime, endDateTime]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "No consumption data available" });
    }

    const result = rows[0];

    res.status(200).json({
      totalCost: result.totalCost || 0,
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error calculating consumption cost:`, error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message
    });
  }
});

module.exports = router;