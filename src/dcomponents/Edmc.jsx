import React from 'react';

const Edmc = () => {
  return (
    <div className="bg-white shadow-md p-3 rounded-md w-full flex-grow">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 h-full">
        {/* Consumption */}
        <div className="flex flex-col justify-center items-center border-b sm:border-b-0 sm:border-r border-gray-200 pb-3 sm:pb-0 sm:pr-3 h-full">
          <h3 className="text-xxs md:text-xs text-gray-500 font-medium pb-2">Consumption</h3>
          <p className="text-lg md:text-xl font-extrabold text-gray-900">11,438 <span className="text-xxxs md:text-xxs font-normal">kWh</span></p>
        </div>
        {/* Peak Demand */}
        <div className="flex flex-col justify-center items-center border-b sm:border-b-0 sm:border-r border-gray-200 pb-3 sm:pb-0 sm:pr-3 h-full">
          <h3 className="text-xxs md:text-xs text-gray-500 font-medium pb-2">Peak Demand</h3>
          <p className="text-lg md:text-xl font-extrabold text-gray-900">2,843 <span className="text-xxxs md:text-xxs font-normal">kVA</span></p>
        </div>
        {/* AQI */}
        <div className="flex flex-col justify-center items-center h-full">
          <h3 className="text-xxs md:text-xs text-gray-500 font-medium pb-2">AQI</h3>
          <p className="text-lg md:text-xl font-extrabold text-gray-900">85</p>
        </div>
      </div>
    </div>
  );
};

export default Edmc;