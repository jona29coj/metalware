import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment-timezone';

const getCurrentRate = () => {
  const now = new Date();
  const hours = now.getHours();
  let period, rate;

  if (hours >= 5 && hours < 10) {
    period = "Off-Peak (05:00 - 10:00)";
    rate = "₹6.035 per kVAh";
  } else if (hours >= 10 && hours < 19) {
    period = "Normal (10:00 - 19:00)";
    rate = "₹7.10 per kVAh";
  } else if ((hours >= 19 && hours <= 23) || (hours >= 0 && hours < 3)) {
    period = "Peak (19:00 - 03:00)";
    rate = "₹8.165 per kVAh";
  } else if (hours >= 3 && hours < 5) {
    period = "Normal (03:00 - 05:00)";
    rate = "₹7.10 per kVAh";
  }
  
  return { period, rate };
};

const Edmc = () => {
  const { period, rate } = getCurrentRate();
  const [consumption, setConsumption] = useState(null);
  const [peakDemand, setPeakDemand] = useState(null);
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
    const fetchData = async () => {
      const kolkataTime = moment()
        .tz('Asia/Kolkata')
        .format('YYYY-MM-DD HH:mm:ss');
      
      try {
        const consumptionResponse = await axios.get('https://mw.elementsenergies.com/api/mccons', {
          params: { timestamp: kolkataTime },
          headers: { 'Content-Type': 'application/json' }
        });
        
        const consumptionValue = parseFloat(consumptionResponse.data.consumption.toString().replace(/,/g, '')) || 0;
        setConsumption(consumptionValue.toLocaleString());
        
        // Calculate carbon footprint
        const emissions = (consumptionValue * 0.82).toFixed(2); // 0.82 kg CO₂ per kWh
        const equivalentDistance = (emissions * 0.356).toFixed(0); // 1kg CO₂ ≈ 0.356 km driving
        
        setCarbonFootprint({
          emissions: parseFloat(emissions).toLocaleString(),
          distance: equivalentDistance
        });
        
        setLoading(prev => ({ ...prev, consumption: false }));
      } catch (err) {
        setError(prev => ({ ...prev, consumption: 'Failed to fetch consumption' }));
        setLoading(prev => ({ ...prev, consumption: false }));
        console.error('Consumption API error:', err);
        
        // Fallback values with correct calculations
        const fallbackConsumption = 11438;
        setConsumption(fallbackConsumption.toLocaleString());
        
        const fallbackEmissions = (fallbackConsumption * 0.82).toFixed(2);
        const fallbackDistance = (fallbackEmissions * 0.356).toFixed(0);
        setCarbonFootprint({
          emissions: parseFloat(fallbackEmissions).toLocaleString(),
          distance: fallbackDistance
        });
      }

      try {
        const peakDemandResponse = await axios.get('https://mw.elementsenergies.com/api/mcpeak', {
          params: { timestamp: kolkataTime },
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
        // Fetch total cost from the new endpoint
        const costResponse = await axios.get('https://mw.elementsenergies.com/api/cc', {
          params: { timestamp: kolkataTime }
        });
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
  }, []);

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
    <div className="bg-white shadow-md p-3 rounded-lg w-full flex-grow lg:h-[100%]">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 h-full">
        <div className="flex flex-col justify-center lg:items-center md:items-start sm:items-start border-b sm:border-b-0 sm:border-r border-gray-300 pb-3 sm:pb-0 sm:pr-4 h-full space-y-2">
          <h3 className="text-md text-gray-900">Facility Information</h3>
          <p className="text-md text-gray-700 font-bold">Metalware Corporation</p>
          <p className="text-sm text-gray-500"><span className="font-medium">BUA: </span><span className="text-gray-700 font-semibold">50,000 sq.ft.</span></p>
          <p className="text-sm text-gray-500"><span className="font-medium">Location: </span><span className="text-gray-700 font-semibold">Noida, India</span></p>
        </div>
        
        <div className="flex flex-col justify-center items-center border-b sm:border-b-0 sm:border-r border-gray-300 pb-3 sm:pb-0 sm:pr-4 h-full">
          <h4 className="text-md font-semibold text-gray-600 pb-1">Consumption</h4>
          {renderData(consumption, loading.consumption, error.consumption, 'kWh')}
          
          <h3 className="text-md font-semibold text-gray-600 pb-1 mt-2">Peak Demand</h3>
          {renderData(peakDemand, loading.peakDemand, error.peakDemand, 'kVA')}
        </div>
        
        <div className="flex flex-col justify-center items-center border-b sm:border-b-0 sm:border-r border-gray-300 pb-3 sm:pb-0 sm:pr-4 h-full">
  <h3 className="text-base font-semibold text-gray-600 pb-1">Cost of Electricity</h3>
  {totalCost ? (
    <>
      <p className="text-lg font-extrabold text-gray-900">₹{totalCost}</p>
      <p className="text-sm text-gray-500">Today's Total Cost</p>
    </>
  ) : (
    <div className="animate-pulse flex space-x-4">
      <div className="h-6 w-20 bg-gray-200 rounded"></div>
    </div>
  )}
  <p className="text-md font-extrabold text-gray-900">{rate}</p>
  <p className="text-base font-medium text-gray-700">{period}</p>
</div>
        
        <div className="flex flex-col justify-center items-center h-full">
          <h3 className="text-base font-semibold text-gray-600 pb-1">Carbon Footprint</h3>
          <p className="text-lg font-extrabold text-gray-900">
            {carbonFootprint ? `${carbonFootprint.emissions} kg CO₂` : "Loading..."}
          </p>
          <p className="text-sm text-gray-500 text-center">
            Equivalent to driving <span className="text-gray-700 font-semibold">
              {carbonFootprint ? `${carbonFootprint.distance} km` : "Loading..."}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Edmc;