const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// Database configuration
const pool = mysql.createPool({
  host: '18.188.231.51',
  user: 'admin',
  password: '2166',
  database: 'metalware',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * @api {get} /mcpeak Calculate Peak Demand
 * @apiName GetPeakDemand
 * @apiGroup Energy
 * 
 * @apiParam {String} timestamp Timestamp in format 'YYYY-MM-DD HH:mm:ss'
 * 
 * @apiSuccess {Boolean} success True if calculation succeeded
 * @apiSuccess {Number} peakDemand Peak demand value in kVA
 * @apiSuccess {String} unit Measurement unit (kVA)
 * @apiSuccess {String} timestamp The input timestamp
 * @apiSuccess {Number} minutesEvaluated Number of minutes processed
 * @apiSuccess {String} calculationWindow Time window evaluated
 * @apiSuccess {String} processingTime Time taken for calculation
 */
router.get('/mcpeak', async (req, res) => {
  const startTime = Date.now();
  const { timestamp } = req.query;
  
  try {
    console.log(`Starting peak demand calculation for timestamp: ${timestamp}`);

    // Validate input
    if (!timestamp) {
      const msg = 'Timestamp parameter is missing';
      console.error(msg);
      return res.status(400).json({ 
        error: msg,
        format: 'YYYY-MM-DD HH:mm:ss'
      });
    }

    if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(timestamp)) {
      const msg = `Invalid timestamp format. Received: ${timestamp}`;
      console.error(msg);
      return res.status(400).json({ 
        error: 'Invalid timestamp format',
        expected: 'YYYY-MM-DD HH:mm:ss',
        received: timestamp
      });
    }

    console.log('Calculating peak demand in optimized single query...');
    
    // Optimized single query to find the peak demand
    const [result] = await pool.query(`
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
    `, [timestamp, timestamp]);

    const peakDemand = result[0].peakDemand || 0;
    const minutesEvaluated = result[0].minutesEvaluated || 0;
    const timeWindow = result[0].firstMinute && result[0].lastMinute 
      ? `${result[0].firstMinute.split(' ')[1]} - ${result[0].lastMinute.split(' ')[1]}`
      : 'No data available';

    const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`Peak demand calculation completed in ${processingTime} seconds`);
    console.log(`Final peak demand: ${peakDemand.toFixed(2)} kVA`);

    res.json({
      success: true,
      peakDemand: parseFloat(peakDemand.toFixed(2)),
      unit: 'kVA',
      timestamp,
      minutesEvaluated,
      calculationWindow: timeWindow,
      processingTime: `${processingTime} seconds`,
      dataAvailable: minutesEvaluated > 0
    });

  } catch (err) {
    const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.error('Critical error in peak demand calculation', err);
    console.error(`Processing failed after ${processingTime} seconds`);
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to calculate peak demand',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      processingTime: `${processingTime} seconds`
    });
  }
});

module.exports = router;