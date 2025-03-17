import React from 'react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';

const chartOptions = [
  {
    title: 'Grid Consumption (kWh)',
    type: 'column',
    seriesData: [500, 450, 600, 550, 700, 680, 750, 800, 850, 780],
    color: '#34D399', // Updated color to green
  },
  {
    title: 'Grid Energy Maximum (kWh)',
    type: 'area',
    seriesData: [600, 580, 640, 610, 700, 720, 780, 800, 850, 820],
    color: '#1D4ED8',
  },
  {
    title: 'Maximum Demand (kVA)',
    type: 'line',
    seriesData: [250, 230, 260, 280, 290, 310, 320, 340, 360, 380],
    color: '#F59E0B',
  },
  {
    title: 'Daily Demand (kVA)',
    type: 'spline',
    seriesData: [210, 200, 240, 230, 250, 220, 260, 270, 290, 300],
    color: '#EF4444',
  },
];

const BuildingOverview = () => {
  const getChartOptions = ({ title, type, seriesData, color }) => ({
    title: { text: title },
    chart: { type },
    xAxis: { 
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'], 
      title: { text: 'Months' },
      gridLineWidth: 0, // Disable grid lines on x-axis
    },
    yAxis: { 
      min: 0, 
      title: { text: type === 'area' ? 'Energy (kWh)' : 'Demand (kVA)' },
      gridLineWidth: 0, // Disable grid lines on y-axis
    },
    series: [{ name: title, data: seriesData, color }],
    tooltip: {
      pointFormat: '{point.y}', // Simplified tooltip showing only the value
    },
    credits: { enabled: false },
    plotOptions: type === 'area' 
      ? { area: { fillOpacity: 0.5 } } 
      : { line: { dataLabels: { enabled: true }, enableMouseTracking: true } },
  });

  return (
    <div className="bg-gray-100 min-h-screen p-5">
      {/* Charts */}
      {chartOptions.map((chart, index) => (
        <div key={index} className="bg-white p-8 rounded-lg shadow-lg mb-12">
          <HighchartsReact highcharts={Highcharts} options={getChartOptions(chart)} />
        </div>
      ))}
    </div>
  );
};

export default BuildingOverview;
