import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const MVPPowerChart = () => {
  const options = {
    chart: {
      backgroundColor: 'transparent',
      height: '500px', // Increased height
      marginTop: 80, // Add margin to avoid title and legend overlap
      marginBottom: 100, // Add margin at the bottom to prevent overlap
    },
    title: {
      text: 'MVP Wise (KW) vs Apparent Power (kVA)',
      style: {
        fontSize: '20px',
        fontWeight: 'bold',
      },
      align: 'center', // Align the title properly
      verticalAlign: 'top',
      y: 20, // Move title down to avoid overlap with the top of the chart
    },
    xAxis: {
      categories: ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'],
      title: {
        text: 'Time Period',
      },
      crosshair: true,
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Power (KW/kVA)',
      },
    },
    tooltip: {
      shared: true,
      useHTML: true,
      headerFormat: '<strong>{point.key}</strong><br/>',
      pointFormat:
        '<span style="color:{series.color}">{series.name}: <b>{point.y:.1f} KW/kVA</b><br/></span>',
    },
    series: [
      {
        name: 'MVP (KW)',
        type: 'column',
        data: [200, 250, 300, 275, 350, 400],
        color: '#007bff',
        pointPadding: 0.2,
        borderWidth: 0,
      },
      {
        name: 'Apparent Power (kVA)',
        type: 'line',
        data: [220, 260, 310, 290, 370, 420],
        color: '#ff5733',
        marker: {
          symbol: 'circle',
          radius: 5,
        },
        lineWidth: 2,
      },
    ],
    legend: {
      align: 'center',
      verticalAlign: 'bottom', // Moved the legend to the bottom
      layout: 'horizontal',
      y: 20, // Added vertical padding to prevent overlapping
    },
    credits: {
      enabled: false, // Hide Highcharts credits
    },
    plotOptions: {
      column: {
        dataLabels: {
          enabled: true,
          format: '{point.y}', // Display values on top of columns
          style: {
            color: 'black',
          },
        },
      },
    },
  };

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={options}
      containerProps={{ className: 'h-full' }} // Adjust height
    />
  );
};

export default MVPPowerChart;
