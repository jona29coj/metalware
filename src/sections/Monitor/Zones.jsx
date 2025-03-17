import React from 'react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';

const zoneData = [
  { zone: 'Zone 1', consumption: [300, 320, 310, 400, 450, 500, 520, 530, 540, 550], color: '#34D399' },
  { zone: 'Zone 2', consumption: [400, 380, 370, 450, 500, 520, 550, 560, 580, 590], color: '#60A5FA' },
  { zone: 'Zone 3', consumption: [500, 490, 480, 550, 600, 650, 680, 700, 720, 750], color: '#FBBF24' },
  { zone: 'Zone 4', consumption: [350, 340, 330, 420, 470, 520, 540, 550, 560, 570], color: '#EF4444' },
  { zone: 'Zone 5', consumption: [420, 410, 400, 480, 520, 560, 590, 600, 620, 630], color: '#A78BFA' },
  { zone: 'Zone 6', consumption: [450, 440, 430, 500, 550, 580, 600, 620, 640, 660], color: '#10B981' },
  { zone: 'Zone 7', consumption: [380, 370, 360, 460, 490, 510, 520, 530, 540, 550], color: '#3B82F6' },
  { zone: 'Zone 8', consumption: [460, 450, 440, 520, 570, 600, 620, 640, 660, 680], color: '#D97706' },
  { zone: 'Zone 9', consumption: [390, 380, 370, 470, 500, 520, 540, 550, 560, 570], color: '#9333EA' },
  { zone: 'Zone 10', consumption: [470, 460, 450, 530, 580, 610, 630, 650, 670, 690], color: '#EC4899' },
];

const Zones = () => {
  const getChartOptions = ({ zone, consumption, color }) => ({
    title: { text: `${zone}` },
    chart: { type: 'column' },
    xAxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
      title: { text: 'Months' },
      gridLineWidth: 0, // Remove vertical grid lines
    },
    yAxis: {
      min: 0,
      title: { text: 'Energy Consumption (kWh)' },
      gridLineWidth: 0, // Remove horizontal grid lines
    },
    series: [{ name: zone, data: consumption, color }],
    tooltip: {
      pointFormat: '{point.y} kWh', // Tooltip shows the value with units
    },
    credits: { enabled: false },
    plotOptions: {
      column: {
        dataLabels: { enabled: true },
      },
    },
  });

  return (
    <div className="bg-gray-100 min-h-screen p-5">
      {/* Render a chart for each zone */}
      {zoneData.map((zone, index) => (
        <div key={index} className="bg-white p-8 rounded-lg shadow-lg mb-12">
          <HighchartsReact highcharts={Highcharts} options={getChartOptions(zone)} />
        </div>
      ))}
    </div>
  );
};

export default Zones;
