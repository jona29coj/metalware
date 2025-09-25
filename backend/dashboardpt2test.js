const express = require('express');
const router = express.Router();
const pool = require('./dbpg.js'); // your pg pool

// ------------------ Peak Demand ------------------
async function getPeakDemandForDate(startDateTime, endDateTime) {
    console.log('📊 getPeakDemandForDate called with:', { startDateTime, endDateTime });
  
    const cutoff = new Date('2025-05-15T00:00:00');
    const start = new Date(startDateTime);
  
    let query = '';
    let params = [startDateTime, endDateTime];
  
    if (start > cutoff) {
      console.log('➡️ Date after cutoff → using meter 12 only');
      query = `
        SELECT
          TO_CHAR(timestamp, 'YYYY-MM-DD HH24:MI:00') AS minute,
          total_kva
        FROM modbus_data
        WHERE energy_meter_id = 12
          AND timestamp BETWEEN $1 AND $2
        ORDER BY minute
      `;
    } else {
      console.log('➡️ Date before cutoff → summing meters 1–11');
      query = `
        SELECT
          TO_CHAR(timestamp, 'YYYY-MM-DD HH24:MI:00') AS minute,
          SUM(total_kva) AS total_kVA
        FROM modbus_data
        WHERE energy_meter_id BETWEEN 1 AND 11
          AND timestamp BETWEEN $1 AND $2
        GROUP BY minute
        ORDER BY minute
      `;
    }
  
    const result = await pool.query(query, params);
    console.log(`✅ Peak demand query returned ${result.rows.length} rows`);
    console.log('🔎 Peak demand DB rows:', result.rows);
  
    return result.rows.map(entry => ({
      minute: entry.minute,
      total_kVA: parseFloat(entry.total_kva || entry.total_kVA).toFixed(1) // support both aliases
    }));
  }

// ------------------ DGDC ------------------
async function fetchDGDC(startDateTime, endDateTime) {
    console.log('📊 fetchDGDC called with:', { startDateTime, endDateTime });
  
    const query = `
      SELECT
        TO_CHAR(t1.timestamp, 'YYYY-MM-DD HH24:MI:SS') AS timestamp,
        t1.total_kw,
        t1.energy_meter_id
      FROM modbus_data t1
      JOIN (
        SELECT
          energy_meter_id,
          MAX(timestamp) AS max_timestamp
        FROM modbus_data
        WHERE energy_meter_id IN (13,14)
          AND timestamp BETWEEN $1 AND $2
        GROUP BY energy_meter_id
      ) t2
      ON t1.energy_meter_id = t2.energy_meter_id 
      AND t1.timestamp = t2.max_timestamp
      ORDER BY t1.energy_meter_id, t1.timestamp DESC
    `;
  
    try {
      const result = await pool.query(query, [startDateTime, endDateTime]);
      console.log(`✅ DGDC query returned ${result.rows.length} rows`);
      console.log('🔎 DGDC DB rows:', result.rows);
  
      const formattedResult = result.rows.reduce((acc, row) => {
        acc[row.energy_meter_id] = {
          total_kW: row.total_kw, // <-- lowercase since Postgres returns it like that
          timestamp: row.timestamp
        };
        return acc;
      }, {});
  
      console.log('📝 DGDC formatted result:', formattedResult);
      return formattedResult;
    } catch (error) {
      console.error('❌ DGDC query failed:', error);
      throw error;
    }
  }

// ------------------ Route ------------------
router.get('/dashboardpt2test', async (req, res) => {
  console.log('📥 Incoming request to /dashboardpt2test with query:', req.query);

  try {
    const { startDateTime, endDateTime } = req.query;
    if (!startDateTime || !endDateTime) {
      console.warn('⚠️ Missing query parameters');
      return res.status(400).json({ error: 'startDateTime and endDateTime required' });
    }

    const [peakDemandTimeline, dgdcData] = await Promise.all([
      getPeakDemandForDate(startDateTime, endDateTime),
      fetchDGDC(startDateTime, endDateTime)
    ]);

    console.log('📤 Sending response with:', {
      peakDemandTimelineCount: peakDemandTimeline.length,
      dgdcData
    });

    res.status(200).json({
      peakDemandTimeline,
      dgdcData
    });

  } catch (err) {
    console.error('❌ Dashboard fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard data', details: err.message });
  }
});

module.exports = router;
