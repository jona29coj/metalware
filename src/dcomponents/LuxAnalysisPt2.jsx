import React from 'react';
import lux_img_pt2 from "../sections/pictures/mware11.png";

const LuxAnalysisPt2 = () => {
  return (
    <div className="flex flex-col bg-white shadow-lg rounded-lg overflow-hidden p-6">
        <h1 className="text-2xl font-bold text-center">Cut Section</h1>

        <img
          src={lux_img_pt2}
          alt="LUX Analysis"
          className="w-auto h-auto pt-4"
        />
    </div>
  );
};

export default LuxAnalysisPt2;
