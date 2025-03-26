import React from 'react';

const getCurrentRate = () => {
  const now = new Date();
  const hours = now.getHours();
  let period, rate;

  if (hours >= 17 && hours < 23) {
    period = "Peak Hour";
    rate = "₹8.40 per kWh";
  } else if (hours >= 23 || hours < 6) {
    period = "Off-Peak Hour";
    rate = "₹6.50 per kWh";
  } else {
    period = "Normal Hour";
    rate = "₹7.50 per kWh";
  }
  return { period, rate };
};

const Edmc = () => {
  const { period, rate } = getCurrentRate();

  return (
    <div className="bg-white shadow-md p-3 rounded-lg w-full flex-grow lg:h-[100%]">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 h-full">
        {/* Column 1 - Facility Information */}
        <div className="flex flex-col justify-center lg:items-center md:items-start sm:items-start border-b sm:border-b-0 sm:border-r border-gray-300 pb-3 sm:pb-0 sm:pr-4 h-full space-y-2">
          <h3 className="text-md font-extrabold text-gray-900">Facility Information</h3>
          <p className="text-sm text-gray-700 font-semibold">Metalware Corporation</p>
          <p className="text-sm text-gray-500"><span className="font-medium">BUA: </span><span className="text-gray-700 font-semibold">50,000 sq.ft.</span></p>
          <p className="text-sm text-gray-500"><span className="font-medium">Location: </span><span className="text-gray-700 font-semibold">Noida, India</span></p>
        </div>
        {/* Column 2 - Consumption and Peak Demand */}
        <div className="flex flex-col justify-center items-center border-b sm:border-b-0 sm:border-r border-gray-300 pb-3 sm:pb-0 sm:pr-4 h-full">
          <h3 className="text-sm font-semibold text-gray-600 pb-1">Consumption</h3>
          <p className="text-md font-extrabold text-gray-900">11,438 kWh</p>
          <h3 className="text-sm font-semibold text-gray-600 pb-1 mt-2">Peak Demand</h3>
          <p className="text-md font-extrabold text-gray-900">2,843 kVA</p>
        </div>
        {/* Column 3 - Cost of Electricity */}
        <div className="flex flex-col justify-center items-center border-b sm:border-b-0 sm:border-r border-gray-300 pb-3 sm:pb-0 sm:pr-4 h-full">
          <h3 className="text-base font-semibold text-gray-600 pb-1">Cost of Electricity</h3>
          <p className="text-lg font-extrabold text-gray-900">{rate}</p>
          <p className="text-base font-medium text-gray-700">{period}</p>
        </div>
        {/* Column 4 - Carbon Footprint */}
        <div className="flex flex-col justify-center items-center h-full">
          <h3 className="text-base font-semibold text-gray-600 pb-1">Carbon Footprint</h3>
          <p className="text-lg font-extrabold text-gray-900">42,570 kg</p>
          <p className="text-sm text-gray-500 text-center">Equivalent to driving <span className="text-gray-700 font-semibold">170,280 km</span></p>
        </div>
      </div>
    </div>
  );
};

export default Edmc;
