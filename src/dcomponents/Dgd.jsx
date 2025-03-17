import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import dg from "../sections/pictures/dg.png"; // Generator Image

const Dgd = () => {
  const { id } = useParams(); // Get generator ID from URL
  const navigate = useNavigate();

  // Dummy DG Details
  const generatorDetails = {
    name: `DG${id}`,
    status: id === "1" ? "Running" : "Idle",
    lastMaintenance: id === "1" ? "12 Jan 2024" : "05 Feb 2024",
    runtime: id === "1" ? "1200 hours" : "800 hours",
    location: id === "1" ? "Zone A" : "Zone B",
  };

  // Dummy Fuel Consumption Data (timestamp, liters per hour)
  const consumptionData = [
    [1706580000000, 50], [1706583600000, 48], [1706587200000, 55],
    [1706590800000, 52], [1706594400000, 49], [1706598000000, 51],
    [1706601600000, 50]
  ];

  // Highcharts options for Fuel Consumption
  const chartOptions = {
    chart: {
      type: "line",
      backgroundColor: "transparent", // Removes the background color of the chart
      height: "400px", // Set a fixed height for the chart container
    },
    title: {
      text: null,
    },
    xAxis: {
      type: "datetime",
      title: {
        text: "Time",
      },
      labels: {
        formatter: function () {
          return Highcharts.dateFormat("%H:%M", this.value); // Format the timestamp to hours:minutes
        },
      },
      gridLineWidth: 0, // Remove the x-axis grid lines
    },
    yAxis: {
      title: {
        text: "Fuel Consumption (L/h)",
      },
      gridLineWidth: 0, // Remove the y-axis grid lines
    },
    series: [
      {
        name: "Fuel Consumption",
        data: consumptionData,
        color: "#FF9800",
      },
    ],
    credits: {
      enabled: false, // Disable the chart credits
    },
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md w-full mx-auto mt-10">
      {/* Flex container for two-column layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Side - Generator Details */}
        <div className="lg:w-1/3 p-6 border-r border-gray-300"> {/* Add border-right for partition */}
          <h2 className="text-2xl font-bold text-center mb-4">{generatorDetails.name}</h2>
          
          <img className="w-40 h-40 object-contain rounded-lg mx-auto mb-4" src={dg} alt={generatorDetails.name} />
          
          <div className="text-lg text-gray-700 space-y-2">
            <p>
              <strong>Status:</strong>{" "}
              <span className={generatorDetails.status === "Running" ? "text-green-600" : "text-yellow-600"}>
                {generatorDetails.status}
              </span>
            </p>
            <p><strong>Last Maintenance:</strong> {generatorDetails.lastMaintenance}</p>
            <p><strong>Total Runtime:</strong> {generatorDetails.runtime}</p>
            <p><strong>Location:</strong> {generatorDetails.location}</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-800"
            >
              ← Back to Generators
            </button>
          </div>
        </div>

        {/* Right Side - Fuel Consumption Chart */}
        <div className="lg:w-2/3">
            <h2 className="text-2xl font-bold text-center pb-4 pt-5 mb-4">Fuel Consumption</h2>
            <HighchartsReact highcharts={Highcharts} options={chartOptions} className="flex justify-center" />
        </div>
      </div>
    </div>
  );
};

export default Dgd;
