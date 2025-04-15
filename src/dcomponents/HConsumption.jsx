import React, { useEffect, useState, useContext } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import 'tailwindcss/tailwind.css';
import axios from 'axios';
import moment from 'moment-timezone';
import { DateContext } from "../contexts/DateContext";

const HConsumption = () => {
  const { selectedDate: globalSelectedDate } = useContext(DateContext); // Get the date from context
  const [energyData, setEnergyData] = useState({});
  const [localSelectedDate, setLocalSelectedDate] = useState(globalSelectedDate); // Initialize with context date
  const [consumptionType, setConsumptionType] = useState('kWh'); // 'kWh' or 'kVAh'

  useEffect(() => {
    // Update local state when the global date changes (initial load and updates)
    setLocalSelectedDate(globalSelectedDate);
  }, [globalSelectedDate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentDateTime = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
        const endpoint = consumptionType === 'kWh' ? 'hconsumption' : 'hkVAhconsumption';
        const response = await axios.get(`https://mw.elementsenergies.com/api/${endpoint}`, {
          params: { date: localSelectedDate, currentDateTime } 
        });
        console.log('Data received by HConsumption:', response.data.consumptionData, 'for date:', localSelectedDate);
        const data = response.data.consumptionData.reduce((acc, item) => {
          acc[item.hour] = parseFloat(item.total_consumption);
          return acc;
        }, {});
        setEnergyData(data);
      } catch (error) {
        console.error('Error fetching data in HConsumption:', error);
      }
    };

    fetchData();
  }, [localSelectedDate, consumptionType]); // Fetch data when local date or consumption type changes

  const handleLocalDateChange = (e) => {
    setLocalSelectedDate(e.target.value); // Update the local date state
  };

  const chartOptions = {
    chart: {
      type: "column",
      backgroundColor: "transparent",
    },
    title: { text: null },
    xAxis: {
      categories: Object.keys(energyData),
      labels: {
        formatter: function() {
          return moment(this.value).format('HH:mm');
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
        name: "Energy Consumption",
        data: Object.values(energyData).map((value, index) => {
          const hour = index; // Assuming index represents the hour (0-23)
          let color;

          if (hour >= 5 && hour < 10) {
            color = "rgba(76, 175, 80, 0.7)"; // Green for Off-Peak (05:00-10:00)
          } else if ((hour >= 10 && hour < 19) || (hour >= 3 && hour < 5)) {
            color = "rgba(255, 152, 0, 0.7)"; // Orange for Normal
          } else {
            color = "rgba(244, 67, 54, 0.7)"; // Red for Peak (19:00-03:00)
          }

          return {
            y: value,
            color: color
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
            type="checkbox"
            className="sr-only peer"
            checked={consumptionType === 'kVAh'}
            onChange={() => setConsumptionType(prev => prev === 'kWh' ? 'kVAh' : 'kWh')}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
        <span className="text-sm font-medium">kVAh</span>
      </div>
      <input
        type="date"
        value={localSelectedDate}
        onChange={handleLocalDateChange}
        className="border rounded p-2"
      />
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