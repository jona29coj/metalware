import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const PeakAnalysisChart = () => {
  const options = {
    chart: {
      type: 'line',
      backgroundColor: 'transparent',
    },
    title: {
      text: 'Energy Consumption Over Time',
      style: { color: '#333' }
    },
    xAxis: {
      categories: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00'],
      title: { text: 'Hour' }
    },
    yAxis: {
      title: { text: 'Energy (kWh)' }
    },
    series: [
      {
        name: 'Energy Consumption',
        data: [120, 180, 250, 300, 250, 220, 180, 200, 230, 300], // Sample data
        color: '#f45b5b',
      }
    ],
    credits: {
        enabled: false, // Hide Highcharts credits
      },

  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export default PeakAnalysisChart;
