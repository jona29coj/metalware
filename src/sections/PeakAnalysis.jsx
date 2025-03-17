import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import PeakAnalysisChart from '../components/PeakAnalysisChart';
import MiniCard from '../components/MiniCard';
import MVPPowerChart from '../components/MVPPowerChart';

const PeakAnalysis = () => {
  const [startDate, setStartDate] = useState(new Date());

  return (
    <div className="bg-gray-100 dark:bg-secondary-dark-bg p-8 rounded-lg shadow-lg space-y-8">
      {/* Peak Analysis Heading */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-200">Peak Analysis</h1>
        <p className="text-gray-600 dark:text-gray-400">Analyze peak demand, optimize consumption patterns, and reduce energy costs</p>
      </div>

      {/* Date Picker with Label */}
      <div className="flex justify-center items-center mb-6">
        <label className="mr-4 text-lg font-semibold text-gray-700 dark:text-gray-300">Select Date:</label>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          className="bg-white dark:bg-gray-700 p-2 rounded shadow focus:outline-none"
        />
      </div>

       {/* Mini Cards with Peak Analysis Info */}
       <div className="grid grid-cols-3 gap-4">
        <MiniCard title="Peak Demand" value="300 kW" iconClass="fas fa-chart-line" />
        <MiniCard title="Average Demand" value="250 kW" iconClass="fas fa-chart-area" />
        <MiniCard title="Load Factor" value="83%" iconClass="fas fa-bolt" />
        <MiniCard title="Off-Peak Consumption" value="150 kWh" iconClass="fas fa-lightbulb" />
        <MiniCard title="Cost Impact" value="$400" iconClass="fas fa-dollar-sign" />
      </div>

      {/* Peak Analysis Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Energy Peak Consumption</h2>
        <PeakAnalysisChart /> {/* Render the Peak Analysis chart here */}
      </div>

{/* MVP Wise (KW) vs Apparent Power (kVA) Big Card */}
      <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-xl mt-10">
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-6 text-center">
          MVP Wise (KW) vs Apparent Power (kVA)
        </h2>
        <div className="h-110"> {/* Large height to make the card prominent */}
          <MVPPowerChart /> {/* Render the MVP Power chart here */}
        </div>
      </div>
    </div>
  );
};

export default PeakAnalysis;
