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
  period,
  SUM(consumption) AS totalConsumption,
  ROUND(SUM(consumption * rate), 2) AS totalCost
FROM (
  SELECT 
    energy_meter_id,
    CASE
      WHEN HOUR(timestamp) BETWEEN 5 AND 9 THEN "Off-Peak"
      WHEN HOUR(timestamp) BETWEEN 10 AND 18 THEN "Normal"
      WHEN HOUR(timestamp) BETWEEN 19 AND 23 OR HOUR(timestamp) BETWEEN 0 AND 2 THEN "Peak"
      ELSE "Normal"
    END AS period,
    MAX(kVAh) - MIN(kVAh) AS consumption,
    CASE
      WHEN HOUR(timestamp) BETWEEN 5 AND 9 THEN 6.035
      WHEN HOUR(timestamp) BETWEEN 10 AND 18 THEN 7.10
      WHEN HOUR(timestamp) BETWEEN 19 AND 23 OR HOUR(timestamp) BETWEEN 0 AND 2 THEN 8.165
      ELSE 7.10
    END AS rate
  FROM modbus_data
  WHERE timestamp BETWEEN ? AND ?
    AND energy_meter_id BETWEEN 1 AND 11
  GROUP BY energy_meter_id, period
) AS period_data
GROUP BY period;
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