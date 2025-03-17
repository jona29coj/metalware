import React from "react";
import { useNavigate } from "react-router-dom";

const EnergyMeter = ({ name, consumption, id }) => {
  const navigate = useNavigate();

  return (
    <div className="relative bg-white rounded-lg w-full h-50 flex flex-col justify-between items-center text-center p-4 border border-gray-500">
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs font-medium py-1 px-2 rounded-full">
        {name}
      </div>

      <div className="pt-4 flex flex-col items-center">
        <div className="text-2xl font-bold text-gray-800">{Math.round(consumption)} kWh</div>
        <div className="text-xs text-gray-400">Consumption</div>
      </div>

      <button
        onClick={() => navigate(`/meter/${id}`)}
        className="mt-2 text-blue-600 font-semibold text-xs hover:text-blue-800"
      >
        View Details
      </button>
    </div>
  );
};

const MeterInfo = () => {
  const energyMeters = Array.from({ length: 10 }, (_, index) => ({
    id: index + 1,
    name: `Zone ${index + 1}`,
    consumption: Math.random() * 1000,
  }));

  return (
    <div className="p-6 bg-white rounded-lg shadow-md flex flex-col">
      <h2 className="text-xl font-semibold pb-7">Energy Meters</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-20 gap-y-6 mx-auto">
        {energyMeters.map((meter) => (
          <EnergyMeter key={meter.id} {...meter} />
        ))}
      </div>
    </div>
  );
};

export default MeterInfo;