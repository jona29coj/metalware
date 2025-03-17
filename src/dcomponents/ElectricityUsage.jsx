import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import 'tailwindcss/tailwind.css';

const LiveConsumption = () => {
  const energyData = {
    "1": 5, "2": 6, "3": 7, "4": 8, "5": 9, "6": 10,
    "7": 11, "8": 12, "9": 13, "10": 14, "11": 15, "12": 16,
    "13": 17, "14": 18, "15": 19, "16": 20, "17": 21, "18": 22,
    "19": 23, "20": 24, "21": 25, "22": 26, "23": 27, "24": 28,
  };

  const chartOptions = {
    chart: {
      type: "column",
      backgroundColor: "transparent", // Ensure background doesn't interfere
    },
    title: { text: null },
    xAxis: {
      categories: Object.keys(energyData),
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
        data: Object.values(energyData).map((value, index) => ({
          y: value,
          color: index < 6 || index >= 18 ? "rgba(76, 175, 80, 0.7)" : "rgba(255, 152, 0, 0.7)",
        })),
      },
    ],
    tooltip: {
      shared: true,
      valueSuffix: " kWh",
      style: { zIndex: 1 }, // Ensure tooltips appear above all
    },
    legend: { enabled: false },
    credits: { enabled: false },
  };

  return (
    <div className="w-full flex flex-col p-6 bg-white shadow-lg rounded-lg">
      <div className="flex justify-between items-center pb-6">
        <h2 className="text-xl font-semibold">Live Consumption</h2>
      </div>

      {/* Wrapped Highcharts in a relative container to prevent z-index issues */}
      <div className="w-full h-[400px]">
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      </div>
    </div>
  );
};

export default LiveConsumption;
