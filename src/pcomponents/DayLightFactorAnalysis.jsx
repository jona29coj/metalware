import React from "react";
import vid1 from "../videos/vid1.mp4";

const DaylightFactorAnalysis = () => {
  return (
    <div className="border-gray-300 shadow-lg rounded-lg p-4 bg-white">
      <h1 className="text-2xl font-bold text-center pb-2">Daylight Factor Analysis</h1>
      <video className="w-full rounded-md" autoPlay muted loop>
        <source src={vid1} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default DaylightFactorAnalysis;
