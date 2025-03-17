import React from "react";
import lux_img from "../sections/pictures/mware10.png";

const LuxAnalysis = () => {
  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-lg justify-space-around">
        <h1 className="text-2xl font-bold text-black">LUX Analysis</h1>

        <img
          src={lux_img}
          alt="LUX Analysis"
          className="w-auto h-auto pt-3"
        />

    
    </div>
  );
};

export default LuxAnalysis;
