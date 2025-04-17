import React, { useState, useEffect,useContext } from 'react';
import axios from 'axios';
import { DateContext } from '../contexts/DateContext';
import moment from 'moment-timezone';

const getCurrentRate = (selectedDateTime) => {
  console.log("🕒 Using selectedDate for rate check:", selectedDateTime.format("YYYY-MM-DD HH:mm:ss"));
  const hours = selectedDateTime.hour();

  let period, rate;
  if (hours >= 5 && hours < 10) {
    period = "Off-Peak Tariff (05:00 - 10:00)";
    rate = "₹6.035 per kVAh";
  } else if (hours >= 10 && hours < 19) {
    period = "Normal Tariff (10:00 - 19:00)";
    rate = "₹7.10 per kVAh";
  } else if ((hours >= 19 && hours <= 23) || (hours >= 0 && hours < 3)) {
    period = "Peak Tariff (19:00 - 03:00)";
    rate = "₹8.165 per kVAh";
  } else if (hours >= 3 && hours < 5) {
    period = "Normal Tariff (03:00 - 05:00)";
    rate = "₹7.10 per kVAh";
  }

  return { period, rate };
};



const Edmc = () => {
  const { selectedDate } = useContext(DateContext); // Get the selectedDate from context
  const nowTimeIST = moment.tz('Asia/Kolkata').format('HH:mm:ss');
  const fullSelectedDateTime = moment.tz(`${selectedDate.split('T')[0]} ${nowTimeIST}`, 'Asia/Kolkata');
  const { period, rate } = getCurrentRate(fullSelectedDateTime);
    const [consumption, setConsumption] = useState(null);
  const [peakDemand, setPeakDemand] = useState(null);
  const [isSameDay, setIsSameDay] = useState(false);
  const [carbonFootprint, setCarbonFootprint] = useState(null);
  const [totalCost, setTotalCost] = useState(null);
  const [loading, setLoading] = useState({
    consumption: true,
    peakDemand: true,
    cost: true
  });
  const [error, setError] = useState({
    consumption: null,
    peakDemand: null,
    cost: null
  });

  useEffect(() => {
    const currentDate = new Date();
    const selectedDateObj = new Date(selectedDate);
    setIsSameDay(currentDate.toDateString() === selectedDateObj.toDateString());
  
    const fetchData = async () => {
      const pad = (n) => n.toString().padStart(2, '0');
      const formattedDate = moment.tz(selectedDate, 'Asia/Kolkata').format('YYYY-MM-DD') + ' ' + moment.tz('Asia/Kolkata').format('HH:mm:ss');
  
      console.log("📅 Date sent to backend (timestamp):", formattedDate); // ✅ Console log date
  
      try {
        const consumptionResponse = await axios.get('https://mw.elementsenergies.com/api/mccons', {
          params: { timestamp: formattedDate },
          headers: { 'Content-Type': 'application/json' }
        });
  
        const consumptionValue = parseFloat(consumptionResponse.data.consumption.toString().replace(/,/g, '')) || 0;
        setConsumption(consumptionValue.toLocaleString());
  
        // Calculate carbon footprint
        const emissions = (consumptionValue * 0.82).toFixed(2);
        const equivalentDistance = (emissions * 0.356).toFixed(0);
  
        setCarbonFootprint({
          emissions: parseFloat(emissions).toLocaleString(),
          distance: equivalentDistance
        });
  
        setLoading(prev => ({ ...prev, consumption: false }));
      } catch (err) {
        setError(prev => ({ ...prev, consumption: 'Failed to fetch consumption' }));
        setLoading(prev => ({ ...prev, consumption: false }));
        console.error('Consumption API error:', err);
      }
  
      try {
        const peakDemandResponse = await axios.get('https://mw.elementsenergies.com/api/mcpeak', {
          params: { timestamp: formattedDate },
          headers: { 'Content-Type': 'application/json' }
        });
  
        setPeakDemand(peakDemandResponse.data.peakDemand.toLocaleString());
        setLoading(prev => ({ ...prev, peakDemand: false }));
      } catch (err) {
        setError(prev => ({ ...prev, peakDemand: 'Failed to fetch peak demand' }));
        setLoading(prev => ({ ...prev, peakDemand: false }));
        console.error('Peak demand API error:', err);
        setPeakDemand('2,843');
      }
  
      try {
        const costResponse = await axios.get('https://mw.elementsenergies.com/api/cc', {
          params: { timestamp: formattedDate }
        });
        console.log("Cost Date:",formattedDate);
  
        setTotalCost(costResponse.data.totalCost);
        setLoading(prev => ({ ...prev, cost: false }));
      } catch (err) {
        setError(prev => ({ ...prev, cost: 'Failed to fetch cost data' }));
        setLoading(prev => ({ ...prev, cost: false }));
        console.error('Cost API error:', err);
      }
    };
  
    fetchData();
    const intervalId = setInterval(fetchData, 300000);
  
    return () => clearInterval(intervalId);
  }, [selectedDate]);
  

  const renderData = (data, loadingState, errorState, unit) => {
    if (loadingState) {
      return (
        <div className="animate-pulse flex space-x-4">
          <div className="h-6 w-20 bg-gray-200 rounded"></div>
        </div>
      );
    }
    if (errorState) {
      return <p className="text-sm text-red-500">{errorState}</p>;
    }
    return <p className="text-md font-extrabold text-gray-900">{data} {unit}</p>;
  };

  return (
    <div className="bg-white shadow-md p-3 rounded-lg w-full">
<div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
  {/* Facility Info */}
  <div className="flex flex-col justify-start items-center md:items-start sm:items-start lg:items-center xl:items-center border-b sm:border-b-0 sm:border-r border-gray-300 sm:pr-4 h-full pt-1 space-y-2">
    <h4 className="text-md text-gray-900">Facility Information</h4>
    <p className="text-md font-bold text-gray-900">Metalware Corporation</p>
    <p className="text-sm">
      <span className="text-gray-900">BUA: </span>
      <span className="font-bold text-gray-900">50,000 sq.ft.</span>
    </p>
    <p className="text-sm">
      <span className="text-gray-900">Location: </span>
      <span className="font-bold text-gray-900">Noida, India</span>
    </p>
  </div>

 {/* Consumption + Peak Demand */}
<div className="flex flex-col justify-start items-center border-b sm:border-b-0 sm:border-r border-gray-300 sm:pr-4 h-full pt-1 space-y-1 text-center">
  <h4 className="text-md text-gray-900">Consumption</h4>
  <p className='text-lg font-bold'>{renderData(consumption, loading.consumption, error.consumption, 'kWh')}</p>
  
  <h4 className="text-md text-gray-900">Peak Demand</h4>
  <p className='text-lg font-bold'>{renderData(peakDemand, loading.peakDemand, error.peakDemand, 'kVA')}</p>
</div>


  {/* Electricity Cost */}
  <div className="flex flex-col justify-start items-center border-b sm:border-b-0 sm:border-r border-gray-300 sm:pr-4 h-full pt-1 space-y-1 text-center">
    <h4 className="text-md text-gray-900">Cost of Electricity</h4>
    {totalCost ? (
      <>
        <p className="text-lg font-bold text-gray-900">₹{totalCost}</p>
        {isSameDay && (<>
        <p className="text-sm text-gray-900 flex items-center gap-1">
  <span className="text-red-500 text-xs">🔴</span>
  {period}
</p>
        <p className="text-sm font-bold text-gray-900">{rate}</p>
        </>)}
      </>
    ) : (
      <div className="animate-pulse flex space-x-4">
        <div className="h-6 w-20 bg-gray-200 rounded"></div>
      </div>
    )}
  </div>

  {/* Carbon Footprint */}
  <div className="flex flex-col justify-start items-center h-full pt-1 space-y-1 text-center">
    <h4 className="text-md text-gray-900">Carbon Footprint</h4>
    <p className="text-lg font-bold text-gray-900">
      {carbonFootprint ? `${carbonFootprint.emissions} kg CO₂` : "Loading..."}
    </p>
    <p className="text-sm text-gray-900">
      Equivalent to driving <span className="font-bold text-gray-900">
        {carbonFootprint ? `${carbonFootprint.distance} km` : "Loading..."}
      </span>
    </p>
  </div>
</div>
    </div>
  );
};
export default Edmc;

