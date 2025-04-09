import React from 'react';
import MonthlyConsumption from './MonthlyConsumption';

const BuildingOverview = () => {
  return (
    <div className="bg-gray-100 p-5 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full">
        <MonthlyConsumption />
      </div>
    </div>
  );
};

export default BuildingOverview;