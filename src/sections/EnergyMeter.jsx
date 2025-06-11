import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import 'tailwindcss/tailwind.css';
import { DateContext } from "../contexts/DateContext";

const zoneDetails = {
    1: { name: "PLATING", category: "C-49" },
    2: { name: "DIE CASTING+CB+CNC", category: "C-50" },
    3: { name: "SCOTCH BUFFING", category: "C-50" },
    4: { name: "BUFFING", category: "C-49" },
    5: { name: "SPRAY+EPL-I", category: "C-50" },
    6: { name: "SPRAY+ EPL-II", category: "C-49" },
    7: { name: "RUMBLE", category: "C-50" },
    8: { name: "AIR COMPRESSOR", category: "C-49" },
    9: { name: "TERRACE", category: "C-49" },
    10: { name: "TOOL ROOM", category: "C-50" },
    11: { name: "ADMIN BLOCK", category: "C-50" },
    12: { name: "TRANSFORMER"}
};
 
const getZoneNameAndCategory = (id) => {
  return zoneDetails[id] || { name: "Unknown Zone", category: "N/A" };
};

const EnergyMeter = ({ name, consumption, id }) => {
  const navigate = useNavigate();
  const zoneInfo = getZoneNameAndCategory(id);

  return (
    <div className="bg-white rounded-lg w-full h-50 flex flex-col justify-between items-center text-center p-4 border border-gray-500">
      <div className={`text-white text-xs font-medium w-40 rounded whitespace-nowrap max-w-[150px] ${
    zoneInfo.category ? 'py-1 bg-green-500' : 'bg-orange-500 py-3'
  }`}>
        <div className="font-bold">{zoneInfo.name}</div>
        {zoneInfo.category && (
    <div className="text-white">Block: {zoneInfo.category}</div>
  )}      </div>

      <div className="pt-4 flex flex-col items-center">
        <div className="text-2xl font-bold text-gray-800 whitespace-nowrap">{consumption.toFixed(1)} kVAh</div>
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
  const { selectedDate: globalSelectedDate, startDateTime: globalStartDateTime, endDateTime: globalEndDateTime } = useContext(DateContext);
  const [energyMeters, setEnergyMeters] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`https://mw.elementsenergies.com/api/econsumption`, {
          params: {
            startDateTime: globalStartDateTime,
            endDateTime: globalEndDateTime
          }
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
  }, [globalStartDateTime, globalEndDateTime]);
  

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