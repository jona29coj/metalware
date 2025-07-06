const fs = require('fs-extra');
const XLSX = require('xlsx');
const moment = require('moment-timezone');
const mysql = require('mysql2/promise');

const meterMap = {
  1: { name: "PLATING", category: "C-49" },
  2: { name: "DC+CB+CNC", category: "C-50" },
  3: { name: "SCOTCH BUFFING", category: "C-50" },
  4: { name: "BUFFING", category: "C-49" },
  5: { name: "SPRAY+EPL-I", category: "C-50" },
  6: { name: "SPRAY+ EPL-II", category: "C-49" },
  7: { name: "RUMBLE", category: "C-50" },
  8: { name: "AIR COMPRESSOR", category: "C-49" },
  9: { name: "TERRACE", category: "C-49" },
  10: { name: "TOOL ROOM", category: "C-50" },
  11: { name: "ADMIN BLOCK", category: "C-50" },
  12: { name: "TRANSFORMER", category: "" }
};

const pool = mysql.createPool({
  host: '18.188.231.51',
  user: 'admin',
  password: '2166',
  database: 'metalware',
});

async function fetchMinMaxReadingsBatch(startTime, endTime) {
  const readings = {};

  const [minRows] = await pool.query(`
    SELECT energy_meter_id, timestamp, kVAh, kWh
    FROM modbus_data
    WHERE timestamp BETWEEN ? AND ?
    AND energy_meter_id BETWEEN 1 AND 12
    ORDER BY energy_meter_id ASC, timestamp ASC
  `, [startTime, endTime]);

  const [maxRows] = await pool.query(`
    SELECT energy_meter_id, timestamp, kVAh, kWh
    FROM modbus_data
    WHERE timestamp BETWEEN ? AND ?
    AND energy_meter_id BETWEEN 1 AND 12
    ORDER BY energy_meter_id ASC, timestamp DESC
  `, [startTime, endTime]);

  for (let meterId = 1; meterId <= 12; meterId++) {
    const min = minRows.find(row => row.energy_meter_id === meterId);
    const max = maxRows.find(row => row.energy_meter_id === meterId);
    readings[meterId] = { min: min || {}, max: max || {} };
  }

  return readings;
}

async function writeToExcelFile(allReadings, filePath) {
  const workbook = XLSX.utils.book_new();
  const data = [];

  for (const { dayLabel, readings } of allReadings) {
    data.push([`Day: ${dayLabel}`, "", "", "", "", ""]);
    data.push(["Zone", "Timestamp", "kVAh", "Consumption (kVAh)", "kWh", "Consumption (kWh)"]);

    Object.entries(readings).forEach(([meterId, { min, max }]) => {
      const zone = meterMap[meterId];
      const name = zone ? `${zone.name} (${zone.category})` : `Meter ${meterId}`;
      const cons_kvah = (parseFloat(max.kVAh) - parseFloat(min.kVAh)).toFixed(2);
      const cons_kwh = (parseFloat(max.kWh) - parseFloat(min.kWh)).toFixed(2);

      data.push([
        name,
        `Start D&T: ${min.timestamp ? moment(min.timestamp).format("YYYY-MM-DD HH:mm:ss") : "N/A"}`,
        min.kVAh || "N/A",
        "",
        min.kWh || "N/A",
        ""
      ]);

      data.push([
        "",
        `End D&T: ${max.timestamp ? moment(max.timestamp).format("YYYY-MM-DD HH:mm:ss") : "N/A"}`,
        max.kVAh || "N/A",
        isNaN(cons_kvah) ? "N/A" : cons_kvah,
        max.kWh || "N/A",
        isNaN(cons_kwh) ? "N/A" : cons_kwh,
      ]);
    });

    data.push([]); 
  }

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, "June Readings");
  console.log("📄 Writing Excel file to:", filePath);
  XLSX.writeFile(workbook, filePath);
  console.log("✅ Excel file written successfully.");
}

(async () => {
  const timezone = "Asia/Kolkata";
  const startOfJune = moment.tz("2025-06-01 08:00:00", timezone);
  const now = moment.tz("2025-07-01 08:00:00",timezone);

  const lastEnd = now.clone().hour(8).minute(0).second(0).millisecond(0);
  if (now.isBefore(lastEnd)) {
    lastEnd.subtract(1, 'day'); 
  }
  

  const allReadings = [];
  let currentStart = startOfJune.clone();

  console.log("🕒 Starting report generation...");

  while (currentStart.isBefore(lastEnd)) {
    const currentEnd = currentStart.clone().add(1, "day");
    const label = currentStart.format("YYYY-MM-DD");

    console.log(`📅 Fetching: ${label} (${currentStart.format()} → ${currentEnd.format()})`);
    const readings = await fetchMinMaxReadingsBatch(currentStart.format(), currentEnd.format());

    allReadings.push({
      dayLabel: label,
      readings
    });

    currentStart = currentEnd;
  }

  const baseFolderPath = '/home/ubuntu/reports/';
  await fs.ensureDir(baseFolderPath);
  const filePath = `${baseFolderPath}/Metalware_Report_June_2025.xlsx`;
  await writeToExcelFile(allReadings, filePath);
  

  console.log(`✅ Full June report saved to: ${filePath}`);
  process.exit();
})();
