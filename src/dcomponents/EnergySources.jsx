import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const EnergySources = () => {
  const totalConsumption = 4450; // Adjusted to match 10 zones

  const chartOptions = {
    chart: {
      type: 'pie',
      backgroundColor: 'transparent',
      height: 'min(300px, 40vmin)', // Keeps it responsive
    },
    title: {
      text: ''
    },
    plotOptions: {
      pie: {
        innerSize: '55%', // Adjusted for better visualization
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          formatter: function () {
            if (this.y === 780 || this.y === 280) {
              return `<b>${this.point.name}</b>: ${this.y} kWh`;
            }
            return null;
          },
          style: {
            fontSize: '1.2vmin'
          }
        }
      }
    },
    series: [
      {
        name: 'Consumption',
        data: [
          { name: 'Zone-1', y: 780, color: 'rgb(239,68,68)' },  // Highest consumption
          { name: 'Zone-2', y: 680, color: 'rgba(96, 165, 250, 0.2)' },
          { name: 'Zone-3', y: 600, color: 'rgba(251,191,36,0.2)' },
          { name: 'Zone-4', y: 550, color: 'rgba(167, 139, 250, 0.2)' },
          { name: 'Zone-5', y: 500, color: 'rgba(255, 0, 123, 0.2)' },
          { name: 'Zone-6', y: 400, color: 'rgba(59,130,246,0.2)' },
          { name: 'Zone-7', y: 360, color: 'rgba(217,119,6,0.2)' },
          { name: 'Zone-8', y: 350, color: 'rgba(147,51,234,0.2)' },
          { name: 'Zone-9', y: 300, color: 'rgba(0, 255, 162, 0.2)' },
          { name: 'Zone-10', y: 280, color: 'rgb(52,211,153)' }   // Lowest consumption
        ]
      }
    ]
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold">Consumption</h2>
      <p className="text-lg text-gray-700 mt-2">
        Total-Consumption: <span className="font-bold">{totalConsumption} kWh</span>
      </p>

      <div className="mt-6 flex justify-center">
        <div style={{ width: '90%', maxWidth: '500px' }}> {/* Width control for consistency */}
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default EnergySources;
