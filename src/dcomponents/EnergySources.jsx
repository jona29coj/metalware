import React, { useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const EnergySources = () => {
  const data = {
    daily: [
      { name: 'SPRAY+ EPL', consumption: 150 },
      { name: 'PLATING', consumption: 80 },
      { name: 'COMPRESSOR', consumption: 100 },
      { name: 'BUFFING + VIBRATOR + ETP', consumption: 120 },
      { name: 'Terrace', consumption: 180 },
      { name: 'SPRAY+ EPL', consumption: 90 },
      { name: 'CHINA BUFFING', consumption: 60 },
      { name: 'BUFFING+CASTING M/C -7', consumption: 130 },
      { name: 'DIE CASTING', consumption: 170 },
      { name: 'RUMBLE', consumption: 180 }
    ],
    monthly: [],
    yearly: []
  };

  data.monthly = data.daily.map(zone => ({ name: zone.name, consumption: zone.consumption * 30 }));
  data.yearly = data.daily.map(zone => ({ name: zone.name, consumption: zone.consumption * 365 }));

  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [zones, setZones] = useState(data.daily);

  const totalConsumption = zones.reduce((sum, zone) => sum + zone.consumption, 0);
  const highZone = zones.reduce((prev, current) => (prev.consumption > current.consumption ? prev : current));
  const lowZone = zones.reduce((prev, current) => (prev.consumption < current.consumption ? prev : current));

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    setZones([...data[period]]);
  };

  const otherZonesConsumption = totalConsumption - (highZone.consumption + lowZone.consumption);

  const chartOptions = {
    chart: {
      type: 'column',
      backgroundColor: 'transparent',
      height: '300px',
    },
    title: { text: '' },
    xAxis: {
      categories: ['Total Consumption'],
    },
    yAxis: {
      title: { text: 'Consumption (kWh)' },
    },
    plotOptions: {
      series: {
        stacking: 'normal',
        borderWidth: 0,
        dataLabels: {
          enabled: false,
        },
      },
    },
    tooltip: {
      formatter: function () {
        if (this.series.name === 'Other Zones') {
          return `<b>Other Zones:</b> ${otherZonesConsumption} kWh`;
        }
        return `<b>${this.series.name}:</b> ${this.y} kWh`;
      },
    },
    series: [
      {
        name: highZone.name,
        data: [highZone.consumption],
        color: 'rgb(185, 28, 28)',
      },
      {
        name: lowZone.name,
        data: [lowZone.consumption],
        color: 'rgb(21, 128, 61)',
      },
      {
        name: 'Other Zones',
        data: [otherZonesConsumption],
        color: 'rgba(96, 165, 250, 0.2)',
        showInLegend: true,
      },
    ],
    legend: {
      enabled: true,
    },
    credits: { enabled: false },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Consumption</h2>
        <div className="flex space-x-3">
          <button className={`px-4 py-2 rounded ${selectedPeriod === 'daily' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} onClick={() => handlePeriodChange('daily')}>Daily</button>
          <button className={`px-4 py-2 rounded ${selectedPeriod === 'monthly' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} onClick={() => handlePeriodChange('monthly')}>Monthly</button>
          <button className={`px-4 py-2 rounded ${selectedPeriod === 'yearly' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} onClick={() => handlePeriodChange('yearly')}>Yearly</button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-md text-gray-700 mb-6">
            Total Consumption: <span className="font-bold text-lg">{totalConsumption} kWh</span>
          </p>
          <div className="space-y-6">
            <div className="bg-red-200 p-3 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-red-700">High Zone</h3>
              <p className="text-gray-900 font-medium mt-2">{highZone.name}</p>
              <p className="text-gray-900 mt-1">{highZone.consumption} kWh</p>
              <p className="text-sm text-gray-600 mt-1">{((highZone.consumption / totalConsumption) * 100).toFixed(2)}% of Total Consumption</p>
            </div>
            <div className="bg-green-200 p-3 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-green-700">Low Zone</h3>
              <p className="text-gray-900 font-medium mt-2">{lowZone.name}</p>
              <p className="text-gray-900 mt-1">{lowZone.consumption} kWh</p>
              <p className="text-sm text-gray-600 mt-1">{((lowZone.consumption / totalConsumption) * 100).toFixed(2)}% of Total Consumption</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center mt-6 pt-10">
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default EnergySources;