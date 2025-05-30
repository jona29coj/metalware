import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { DateContext } from '../contexts/DateContext';

const getCurrentRate = (hours) => {
  if (hours >= 5 && hours < 10) return { period: "Off-Peak Tariff (05:00 - 10:00)", rate: "₹6.035 per kVAh" };
  if (hours >= 10 && hours < 19) return { period: "Normal Tariff (10:00 - 19:00)", rate: "₹7.10 per kVAh" };
  if ((hours >= 19 && hours <= 23) || (hours >= 0 && hours < 3)) return { period: "Peak Tariff (19:00 - 03:00)", rate: "₹8.165 per kVAh" };
  return { period: "Normal Tariff (03:00 - 05:00)", rate: "₹7.10 per kVAh" };
};

const Edmc = () => {
  const { startDateTime, endDateTime } = useContext(DateContext);
  const { period, rate } = getCurrentRate(new Date().getHours());
  const [data, setData] = useState({ consumption: null, apconsumption: null, peakDemand: null, totalCost: null, carbonFootprint: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [consRes, consapRes, peakRes, costRes] = await Promise.all([
          axios.get('https://mw.elementsenergies.com/api/mccons', { params: { startDateTime, endDateTime } }),
          axios.get('https://mw.elementsenergies.com/api/mcapcons', { params: { startDateTime, endDateTime } }),
          axios.get('https://mw.elementsenergies.com/api/mcpeak', { params: { startDateTime, endDateTime } }),
          axios.get('https://mw.elementsenergies.com/api/cc', { params: { startDateTime, endDateTime } }),
        ]);

        const consumption = consRes.data.consumption || 0;
        const apconsumption = consapRes.data.consumption || 0;
        const peakDemand = peakRes.data.peakDemand || 0;
        const totalCost = costRes.data.totalCost || 0;
        const emissions = (consumption * 0.82).toFixed(1);
        const distance = (emissions * 0.356).toFixed(1);

        setData({
          consumption,
          apconsumption,
          peakDemand,
          totalCost,
          carbonFootprint: { emissions, distance },
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data");
        setLoading(false);
      }
    };

    fetchData();
  }, [startDateTime, endDateTime]);

  const renderValue = (value, unit) =>
    loading ? <div className="animate-pulse h-6 w-20 bg-gray-200 rounded"></div> :
    error ? <p className="text-sm text-red-500">{error}</p> :
    <p className="text-md font-extrabold text-gray-900">{value} {unit}</p>;

  return (
    <div className="bg-white shadow-md p-4 rounded-lg w-full">
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
  
      <div className="flex flex-col items-center text-center border-b sm:border-b-0 sm:border-r border-gray-300 sm:pr-4 h-full space-y-1">
        <h4 className="text-md text-gray-900">Facility Information</h4>
        <p className="text-md font-bold text-gray-900">Metalware Corporation</p>
        <p className="text-md text-gray-900">
          BUA: <span className="font-bold">50,000 sq.ft.</span>
        </p>
        <p className="text-md text-gray-900">
          Location: <span className="font-bold">Noida, India</span>
        </p>
      </div>
  
      <div className="flex flex-col items-center text-center border-b sm:border-b-0 sm:border-r border-gray-300 sm:pr-4 h-full space-y-1">
        <h4 className="text-md text-gray-900">Consumption</h4>
        {loading ? (
          <div className="animate-pulse h-6 w-20 bg-gray-200 rounded" />
        ) : error ? (
          <p className="text-md text-red-500">{error}</p>
        ) : (
          <p className="text-md font-bold text-gray-900">
            {`${data.apconsumption} kVAh / ${data.consumption} kWh`}
          </p>
        )}
        <h4 className="text-md text-gray-900">Peak Demand</h4>
        <p className="text-md font-bold text-gray-900">{renderValue(data.peakDemand, "kVA")}</p>
      </div>
  
      <div className="flex flex-col items-center text-center border-b sm:border-b-0 sm:border-r border-gray-300 sm:pr-4 h-full space-y-1">
        <h4 className="text-md text-gray-900">Cost of Electricity</h4>
        {loading ? (
          <div className="animate-pulse h-6 w-20 bg-gray-200 rounded" />
        ) : (
          <>
            <p className="text-md font-bold text-gray-900">₹{data.totalCost}</p>
            <p className="text-md text-gray-900">{period}</p>
            <p className="text-md font-bold text-gray-900">{rate}</p>
          </>
        )}
      </div>
  
      <div className="flex flex-col items-center text-center h-full space-y-1">
        <h4 className="text-md text-gray-900">Carbon Footprint</h4>
        <p className="text-md font-bold text-gray-900">
          {data.carbonFootprint ? `${data.carbonFootprint.emissions} kg CO₂` : "Loading..."}
        </p>
        <p className="text-md text-gray-900">
          Equivalent to driving 
        </p>
        <p className="font-bold">
            {data.carbonFootprint?.distance || "Loading..."} km
          </p>
      </div>
  
    </div>
  </div>
  
  );
};

export default Edmc;