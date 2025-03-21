import React from "react";
import SolarPanel from "../dcomponents/SolarPanel.png";

const WheeledInSolar = () => {
  return (
    <div className="bg-white shadow-lg rounded-lg px-6 pt-6 w-full flex flex-col">
      {/* Header Section */}
      <div className="flex justify-between items-center pb-4">
        <h3 className="text-lg font-bold text-gray-700">Wheeled-in Solar</h3>
        <div className="flex items-center text-gray-500">
          <span role="img" aria-label="sun">
            ☀️
          </span>
          <span className="text-sm font-bold pl-1">32°C</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col lg:flex-row pt-4 flex-grow">
        {/* Left Section */}
        <div className="flex flex-col flex-1">
          {/* Total Charging */}
          <div className="flex flex-col pb-6 border-b border-gray-200 pl-2">
            <h4 className="text-sm text-gray-500">Total Charging</h4>
            <p className="text-3xl font-bold text-gray-800">
              80.88 <span className="text-sm font-normal">kWh</span>
            </p>
            <p className="text-xs text-gray-500 pt-2">
              Min <span className="text-red-500">3.0</span> - Max{" "}
              <span className="text-green-500">10.0</span>
            </p>
          </div>

          {/* Power Usage */}
          <div className="flex flex-col py-6 pl-2">
            <h4 className="text-sm text-gray-500">Power Usage</h4>
            <p className="text-3xl font-bold text-gray-800">
              17.05 <span className="text-sm font-normal">kWh</span>
            </p>
            <p className="text-xs text-gray-500 pt-2">
              1 hour usage <span className="text-gray-800">6.8 kWh</span>
            </p>
          </div>

          {/* Energy Yield vs Time Section */}
          <div className="flex flex-col pt-6 border-t border-gray-200 pl-2">
            <h4 className="text-sm text-gray-500">Energy Yield vs. Time (Last 24 Hours)</h4>
            <div className="flex flex-col">
              <p className="text-3xl font-bold text-gray-800">
                120.5 <span className="text-sm font-normal">kWh</span>
              </p>
              <p className="text-xs text-gray-500 pt-2">
                Average Yield over the past 24 hours: <span className="text-green-500">5.0 kWh</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex flex-col flex-1 items-center justify-center pt-2 lg:pt-0 lg:pl-6 -translate-y-14">
          <img
            src={SolarPanel} // Replace with your solar panel image
            alt="Solar Panel"
            className="w-50 h-50 object-contain"
          />

          {/* Mini Cards for Capacity and Total Yield */}
          <div className="flex w-full pt-4 justify-between text-sm text-gray-500 gap-4">
            {/* Capacity Card */}
            <div className="flex flex-col items-center flex-1 bg-gray-100 rounded-lg p-3">
              <p className="font-semibold text-gray-800">220.0</p>
              <p className="text-xs text-gray-500">Capacity (kWh)</p>
            </div>

            {/* Total Yield Card */}
            <div className="flex flex-col items-center flex-1 bg-gray-100 rounded-lg p-3">
              <p className="font-semibold text-gray-800">175.0</p>
              <p className="text-xs text-gray-500">Total Yield (kWh)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WheeledInSolar;
