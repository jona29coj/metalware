const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('./scheduler'); 
const fs = require('fs');

const reportsDir = path.join(__dirname, 'monthly_reports');
const energyRoutes = require('./hconsumption');
const meterRoutes = require('./econsumption');
const ehConsumptionRoutes = require('./ehconsumption');
const zConsumptionRoutes = require('./zconsumption');
const oPeakDemandRoutes = require('./opeakdemand');
const mbConsumptionRoutes = require('./mbconsumption');
const mcconspeakRoutes = require('./mcconspeak');
const ConsumptionRoutes = require('./consumption');
const mcconsRoutes = require('./mccons');
const mcapconsRoutes = require('./mcapcons');
const hlconsRoutes = require('./hlcons');
const mcpeakRoutes = require('./mcpeak');
const pfRoutes = require('./pf');
const hkVAhRoutes = require('./hkVAhconsumption');
const zkVAhConsumptionRoutes = require('./zkVAhconsumption');
const ccRoutes = require('./cc');
const apdRoutes = require('./apd');
const DashboardRoutes = require('./dashboardpt1');
const hcostconsumptionRoutes = require('./hcostconsumption');
const authRoute = require('./auth');
const heartBeatRoute = require('./heartbeat');
const filesRoute = require('./fileF');
const mrRoute = require('./meterreading');
const zkVARoute = require('./zkVA');
const zkVAazRoute = require('./zkVAaz');
const dgdcRoute = require('./dgdc');
const dgdRoute = require('./dgd');
const dgdcvRoute = require('./dgdcv');
const dgdrtRoute = require('./dgdrt');
const dgdkWhdiffRoute = require('./dgdkWhdiff');
const zkVAhAZconsumption = require('./zkVAhAZconsumption');
const zkWhAZconsumption = require('./zkWhAZconsumption');
const dashboardpt1Route = require('./dashboardpt1');
const dashboardpt2Route = require('./dashboardpt2');
const opeakdemandmbRoute = require('./opeakdemandmb');
const zkVAazmbRoute = require('./zkVAazmb');
const app = express();
const port = 3001;

const baseFolderPath = '/Users/jonathanprince/Documents/Work/filesTest';

app.use('/reports', express.static(path.join(__dirname, 'monthly_reports')));
app.use('/uploads', express.static(baseFolderPath));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api', energyRoutes);
app.use('/api', meterRoutes);
app.use('/api', ehConsumptionRoutes);
app.use('/api', zConsumptionRoutes);
app.use('/api', oPeakDemandRoutes);
app.use('/api', mbConsumptionRoutes);
app.use('/api', mcconspeakRoutes);
app.use('/api', ConsumptionRoutes);
app.use('/api', mcconsRoutes);
app.use('/api', hlconsRoutes);
app.use('/api', mcpeakRoutes);
app.use('/api', pfRoutes);
app.use('/api', hkVAhRoutes);
app.use('/api', zkVAhConsumptionRoutes);
app.use('/api', ccRoutes);
app.use('/api', apdRoutes);
app.use('/api', DashboardRoutes);
app.use('/api', hcostconsumptionRoutes);
app.use('/api', mcapconsRoutes);
app.use('/api', authRoute);
app.use('/api', heartBeatRoute);
app.use('/api', filesRoute);
app.use('/api', mrRoute);
app.use('/api', zkVARoute);
app.use('/api',zkVAazRoute);
app.use('/api', dgdcRoute);
app.use('/api', dgdRoute);
app.use('/api', dgdcvRoute);
app.use('/api', dgdrtRoute);
app.use('/api', dgdkWhdiffRoute);
app.use('/api', zkVAhAZconsumption);
app.use('/api', zkWhAZconsumption);
app.use('/api', dashboardpt1Route);
app.use('/api', dashboardpt2Route);
app.use('/api', opeakdemandmbRoute);
app.use('/api', zkVAazmbRoute);

app.get('/api/list-reports', (req, res) => {
  fs.readdir(reportsDir, (err, files) => {
    if (err) {
      console.error('Error reading monthly_reports:', err);
      return res.status(500).json({ error: 'Unable to fetch reports.' });
    }

    const excelFiles = files.filter(file => file.endsWith('.xlsx'));
    res.json(excelFiles);
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});











