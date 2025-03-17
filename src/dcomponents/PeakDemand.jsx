import React from "react";
import PeakDemandChart from "../components/PeakDemandChart";

const PeakDemand = () => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 w-full h-full">
      <h2 className="text-lg font-bold text-gray-700 pb-6">Peak Demand</h2>
      {/* Chart Container */}
      <div className="w-full h-[400px] -translate-x-4"> {/* Add margin-left here */}
        <PeakDemandChart />
      </div>
    </div>
  );
};

export default PeakDemand;
