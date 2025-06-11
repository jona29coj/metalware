const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

const pool = mysql.createPool({
    host:'18.188.231.51',
    user:'admin',
    password:'2166',
    database:'metalware',
    waitForConnections:true,
    connectionLimit:10
});

async function fetchDGD(startDateTime, endDateTime, DGNo) {
    const query = `SELECT MIN(kWh) as min_kWh, MAX(kWh) as max_kWh 
    FROM modbus_data WHERE energy_meter_id = ? 
    AND timestamp BETWEEN ? and ?;`
    try {
        const [rows] = await pool.promise().query(query, [DGNo, startDateTime,endDateTime]);
        let energyProduced = 0;
        energyProduced = Math.round((rows[0].max_kWh - rows[0].min_kWh) * 10) / 10;
        return {
            [DGNo]: {
                energyProduced: energyProduced
            }
        }
    }
    catch (error) {
        throw error;
    }
};

router.get('/dgd', async (req,res) => {
    const {startDateTime, endDateTime, DGNo} = req.query;
    try{
        const dgdData = await fetchDGD(startDateTime, endDateTime, DGNo);
        res.json(dgdData);
    }
    catch(error) {
        throw error;
    }
});

module.exports= router;