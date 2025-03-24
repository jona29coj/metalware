import React from "react";
import mware1 from "../sections/pictures/mware1.jpeg";
import mware2 from "../sections/pictures/mware2.png";

const SolarAnalysisCard = () => {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-md">
      {/* Title Section */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Analysis Overview Study Type</h1>
        <h2 className="text-lg text-red-600 font-medium mt-2">Annual PV Solar Energy Analysis</h2>
      </div>

      {/* Images Section */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col items-center">
          <img src={mware2} alt="Solar Energy Visualization 2" className="w-auto h-[80%]" />
          <p className="text-sm text-gray-500 mt-2">Building Solar Energy Visualization 1</p>
        </div>
        <div className="flex flex-col items-center">
          <img src={mware1} alt="Solar Energy Visualization 1" className="w-auto h-[80%]" />
          <p className="text-sm text-gray-500 mt-2">Building Solar Energy Visualization 2</p>
        </div>
      </div>
    </div>
  );
};

export default SolarAnalysisCard;
