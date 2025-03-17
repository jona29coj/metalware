import React from 'react';

const MiniCard = ({ title, value, iconClass }) => {
  return (
    <div className="p-4 rounded-lg shadow bg-white dark:bg-gray-700 flex items-center">
      <div className="mr-4">
        <i className={`${iconClass} text-xl text-gray-600 dark:text-gray-300`}></i>
      </div>
      <div>
        <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200">{title}</h4>
        <p className="font-bold text-gray-700 dark:text-gray-100">{value}</p>
      </div>
    </div>
  );
};

export default MiniCard;
