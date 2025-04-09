import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import moment from 'moment-timezone';
import 'tailwindcss/tailwind.css';
import { DateContext } from "../contexts/DateContext";

const zoneDetails = {
  1: { name: "SPRAY+ EPL", category: "C-49" },
  2: { name: "PLATING", category: "C-49" },
  3: { name: "COMPRESSOR", category: "C-49" },
  4: { name: "BUFFING + VIBRATOR + ETP", category: "C-49" },
  5: { name: "Terrace", category: "C-49" },
  6: { name: "SPRAY+ EPL", category: "C-50" },
  7: { name: "CHINA BUFFING", category: "C-50" },
  8: { name: "BUFFING+CASTING M/C -7", category: "C-50" },
  9: { name: "DIE CASTING", category: "C-50" },
  10: { name: "RUMBLE", category: "C-50" },
  11: { name: "TOOL ROOM", category: "C-50" },
};

const getZoneNameAndCategory = (id) => {
  return zoneDetails[id] || { name: "Unknown Zone", category: "N/A" };
};

const EnergyMeter = ({ name, consumption, id }) => {
  const navigate = useNavigate();
  const zoneInfo = getZoneNameAndCategory(id);

  return (
    <div className="group relative bg-white rounded-lg w-full h-50 flex flex-col justify-between items-center text-center p-4 border border-gray-500">
      {/* Tooltip container */}
      <div className="absolute hidden group-hover:block -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs font-medium py-1 px-2 rounded whitespace-nowrap z-10">
        <div className="font-bold">{zoneInfo.name}</div>
        <div className="text-gray-300">Category: {zoneInfo.category}</div>
      </div>

      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs font-medium py-1 px-2 rounded-full">
        {name}
      </div>

      <div className="pt-4 flex flex-col items-center">
        <div className="text-2xl font-bold text-gray-800 whitespace-nowrap">{consumption.toFixed(1)} kWh</div>
        <div className="text-xs text-gray-400">Consumption</div>
      </div>

      <button
        onClick={() => navigate(`/monitor/zones?zone=${id}`)}
        className="mt-2 text-blue-600 font-semibold text-xs hover:text-blue-800"
      >
        View Details
      </button>
    </div>
  );
};

const MeterInfo = () => {
  const { selectedDate: globalSelectedDate } = useContext(DateContext); // Get date from context
  const [energyMeters, setEnergyMeters] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentDateTime = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
        const response = await axios.get(`https://mw.elementsenergies.com/api/econsumption`, {
          params: { date: globalSelectedDate, currentDateTime }
        });

        const formattedData = response.data.consumptionData.map((entry) => ({
          id: entry.energy_meter_id,
          name: `Zone ${entry.energy_meter_id}`,
          consumption: parseFloat(entry.consumption)
        }));

        setEnergyMeters(formattedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [globalSelectedDate]); // Fetch data when the global date changes

  return (
    <div className="p-6 bg-white rounded-lg shadow-md flex flex-col">
      <h2 className="text-xl font-semibold pb-7">Energy Meters</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-16 gap-y-6 mx-auto">
        {energyMeters.map((meter) => (
          <EnergyMeter key={meter.id} name={meter.name} consumption={meter.consumption} id={meter.id} />
        ))}
      </div>
    </div>
  );
};

export default MeterInfo;