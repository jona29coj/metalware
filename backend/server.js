const express = require('express');
const cors = require('cors');
const energyRoutes = require('./hconsumption');
const meterRoutes = require('./econsumption');
const ehConsumptionRoutes = require('./ehconsumption');
const zConsumptionRoutes = require('./zconsumption');
const oPeakDemandRoutes = require('./opeakdemand');
const mbConsumptionRoutes = require('./mbconsumption');
const mcconspeakRoutes = require('./mcconspeak');
const ConsumptionRoutes = require('./consumption');
const mcconsRoutes = require('./mccons');
const hlconsRoutes = require('./hlcons');
const mcpeakRoutes = require('./mcpeak');
const pfRoutes = require('./pf');
const hkVAhRoutes = require('./hkVAhconsumption');
const zkVAhConsumptionRoutes = require('./zkVAhconsumption');
const ccRoutes = require('./cc');
const apdRoutes = require('./apd');
const DashboardRoutes = require('./dashboard');

const app = express();
const port = 3001;
const path = require('path');


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});









