import React from 'react';
import { useNavigate } from 'react-router-dom';
import dg from "../sections/pictures/DieselUpd.png";

const DieselGeneration = () => {
  const navigate = useNavigate(); // Navigation Hook

  return (
    <div className="relative bg-white dark:bg-secondary-dark-bg rounded-xl shadow-md p-8 group opacity-50">
      {/* Hover Tooltip for Entire Section */}
      <div className="absolute inset-0 flex justify-center items-center group-hover:opacity-100 opacity-0 transition-opacity z-10">
        <p className="text-sm bg-gray-900 text-white py-2 px-4 rounded-lg shadow-lg">
          Section Not Available
        </p>
      </div>

      <h2 className="text-lg font-bold pb-6">Diesel Generators</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* DG1 Section */}
        <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-lg shadow-md">
          <img className="w-50 h-40 object-contain rounded-lg mb-4" src={dg} alt="DG1" />
          <h2 className="font-bold text-2xl text-gray-800 mb-2">DG1</h2>
          <div className="text-gray-700 text-sm space-y-2">
            <p><strong>Status:</strong> <span className="text-green-600">Running</span></p>
            <p><strong>Power Output:</strong> 500 kW</p>
            <p><strong>Last Maintenance:</strong> 12 Jan 2024</p>
          </div>
          <button 
            onClick={() => navigate('/generator/1')}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all"
          >
            View Details
          </button>
        </div>

        {/* DG2 Section */}
        <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-lg shadow-md">
          <img className="w-50 h-40 object-contain rounded-lg mb-4" src={dg} alt="DG2" />
          <h2 className="font-bold text-2xl text-gray-800 mb-2">DG2</h2>
          <div className="text-gray-700 text-sm space-y-2">
            <p><strong>Status:</strong> <span className="text-yellow-600">Idle</span></p>
            <p><strong>Power Output:</strong> 300 kW</p>
            <p><strong>Last Maintenance:</strong> 05 Feb 2024</p>
          </div>
          <button 
            onClick={() => navigate('/generator/2')}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default DieselGeneration;