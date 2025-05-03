import React, { useEffect, useState, useContext } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import 'tailwindcss/tailwind.css';
import axios from 'axios';
import moment from 'moment-timezone';
import { DateContext } from "../contexts/DateContext";
import Exporting from 'highcharts/modules/exporting';
import ExportData from 'highcharts/modules/export-data';

if (Exporting && typeof Exporting === 'function') {
  Exporting(Highcharts);
}

if (ExportData && typeof ExportData === 'function') {
  ExportData(Highcharts);
}

const HConsumption = () => {
  const { startDateTime, endDateTime } = useContext(DateContext); 
  const [energyData, setEnergyData] = useState({});
  const [consumptionType, setConsumptionType] = useState('kWh'); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        let endpoint;
        if (consumptionType === 'kWh') {
          endpoint = 'hconsumption';
        } else if (consumptionType === 'kVAh') {
          endpoint = 'hkVAhconsumption';
        } else if (consumptionType === '₹') {
          endpoint = 'hcostconsumption'; 
        }

        const response = await axios.get(`https://mw.elementsenergies.com/api/${endpoint}`, {
          params: {
            startDateTime,
            endDateTime
          } 
        });

        console.log('Data received by HConsumption:', response.data.consumptionData, 'for range:', startDateTime, 'to', endDateTime);
        setEnergyData(response.data.consumptionData);
      } catch (error) {
        console.error('Error fetching data in HConsumption:', error);
      }
    };
  
    if (startDateTime && endDateTime) {
      fetchData();
    }
    console.log("Final energy data entries for chart:", Object.entries(energyData));

  }, [startDateTime, endDateTime, consumptionType]);


const chartOptions = {
  chart: {
    type: "column",
    backgroundColor: "transparent",
  },
  title: { text: null },
  xAxis: {
    categories: Object.keys(energyData).map(ts => moment(ts, 'YYYY-MM-DD HH:mm:ss').format('HH:mm')),
    labels: {
      formatter: function () {
        return this.value; 
      }
    }
  },
  yAxis: {
    min: 0,
    title: { text: null },
    gridLineWidth: 0,
  },
  plotOptions: {
    column: {
      dataLabels: {
        enabled: true,
        style: { fontWeight: "bold", color: "black" },
      },
    },
  },
  series: [
    {
      name: consumptionType === '₹' ? "Cost" : "Energy Consumption",
      data: Object.entries(energyData).map(([timestamp, value]) => {
        const hour = moment(timestamp, 'YYYY-MM-DD HH:mm:ss').hour();
        let color;
      
        if (hour >= 5 && hour < 10) {
          color = "rgba(76, 175, 80, 0.7)";
        } else if ((hour >= 10 && hour < 19) || (hour >= 3 && hour < 5)) {
          color = "rgba(255, 152, 0, 0.7)";
        } else {
          color = "rgba(244, 67, 54, 0.7)";
        }
      
        return {
          y: parseFloat(value),
          color,
        };
      }),
      
    },
  ],
  tooltip: {
    shared: true,
    valueSuffix: ` ${consumptionType}`,
    style: { zIndex: 1 },
  },
  legend: { enabled: false },
  credits: { enabled: false },
  exporting: {
    enabled: true,
    filename: `Hourly Consumption ${startDateTime} - ${endDateTime}`,
    buttons: {
      contextButton: {
        menuItems: ['downloadXLS']
      }
    }
  },
};


  return (
    <div className="w-full flex flex-col p-6 bg-white shadow-lg rounded-lg">
      <div className="flex justify-between items-center pb-6">
        <h2 className="text-xl font-semibold">Hourly Energy Consumption</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">kWh</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="radio"
                name="consumptionType"
                className="sr-only peer"
                checked={consumptionType === 'kWh'}
                onChange={() => setConsumptionType('kWh')}
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <span className="text-sm font-medium">kVAh</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="radio"
                name="consumptionType"
                className="sr-only peer"
                checked={consumptionType === 'kVAh'}
                onChange={() => setConsumptionType('kVAh')}
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <span className="text-sm font-medium">₹</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="radio"
                name="consumptionType"
                className="sr-only peer"
                checked={consumptionType === '₹'}
                onChange={() => setConsumptionType('₹')}
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
      <div className="w-full h-[400px]">
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      </div>
      <div className="flex justify-center">
        <div className="flex space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-[rgba(244,67,54,0.7)] rounded"></div>
            <span className="text-sm text-gray-700 font-medium">Peak</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-[rgba(255,152,0,0.7)] rounded"></div>
            <span className="text-sm text-gray-700 font-medium">Normal</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-[rgba(76,175,80,0.7)] rounded"></div>
            <span className="text-sm text-gray-700 font-medium">Off-Peak</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HConsumption;