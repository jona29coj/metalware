import React, { useContext, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import dg from "../sections/pictures/Diesel tank.png"; 
import { DateContext } from "../contexts/DateContext";
import moment from "moment-timezone";
import { grid } from "@mui/system";

const Dgd = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const {startDateTime, endDateTime} = useContext(DateContext);
  const [energyProduced, setEnergyProduced] = useState(null);
  const [consumptionData, setConsumptionData] = useState([]); 
  const [vlnValue, setVlnValue] = useState(null);
  const [currentValue, setCurrentValue] = useState(null);
  const [timestamp, setTimestamp] = useState(null);
  const [runtime, setRuntime] = useState(null);
  const [status, setStatus] = useState('Off');

  const chartOptions = {
    chart: {
      type: "column",
      backgroundColor: "transparent",
      height: "400px",
    },
    title: {
      text: null,
    },
    xAxis: {
      type: "datetime",
      title: {
        text: "Time",
      },
      labels: {
        formatter: function () {
          const localTime = moment.utc(this.value).tz("Asia/Kolkata"); 
          return localTime.format("HH:mm"); 
        },
      },
      gridLineWidth: 0  
    },
    yAxis: {
      title: {
        text: "Energy Generated (kWh)",
      },
      gridLineWidth: 0,
    
    },
    series: [
      {
        name: "Energy Generated",
        data: consumptionData,
      },
      
      
    ],
    
    tooltip: {
      formatter: function () {
        return `
          <b>Timestamp:</b> ${this.point.originalTimestamp}<br/>
          <b>Energy Generated:</b> ${this.point.y} kWh
        `;
      },
      backgroundColor: "#fff",
      borderColor: "#ccc",
      style: {
        color: "#000",
      },
    },
    credits: {
      enabled: false,
    },
    exporting: {
      enabled: false
    },
  };
  useEffect(() => {
    const backendDGNo = (() => {
      if (id === '1') return 13;
      if (id === '2') return 14;
      return null;
    })();
  
    const fetchEnergyData = async () => {
      try {
        const energyResponse = await fetch(`https://mw.elementsenergies.com/api/dgd?startDateTime=${startDateTime}&endDateTime=${endDateTime}&DGNo=${backendDGNo}`);
        const energyData = await energyResponse.json();
  
        if (energyData && energyData[backendDGNo] && typeof energyData[backendDGNo].energyProduced === 'number') {
          setEnergyProduced(energyData[backendDGNo].energyProduced);
        } else {
          console.warn("Missing or malformed energyProduced data", energyData);
          setEnergyProduced(0);
        }

        const dgdcvResponse = await fetch(`https://mw.elementsenergies.com/api/dgdcv?startDateTime=${startDateTime}&endDateTime=${endDateTime}&DGNo=${backendDGNo}`);
        const dgdcvData = await dgdcvResponse.json();

        if (dgdcvData && dgdcvData.dgdcv && dgdcvData.dgdcv[backendDGNo]) {
          const { avg_vln_value, avg_current_value, timestamp } = dgdcvData.dgdcv[backendDGNo];
          setVlnValue(avg_vln_value);
          setCurrentValue(avg_current_value);
          setTimestamp(timestamp);
        }
        else {
          setVlnValue(null);
          setCurrentValue(null);
        }

        if (timestamp) {
          const now = moment.tz("Asia/Kolkata");
          const diffSeconds = now.diff(timestamp, 'seconds');
          setStatus(diffSeconds <= 3 ? 'Running' : 'Off');
        }
        

        const runtimeResponse = await fetch(`https://mw.elementsenergies.com/api/dgdrt?startDateTime=${startDateTime}&endDateTime=${endDateTime}&DGNo=${backendDGNo}`);
        const runtimeData = await runtimeResponse.json(); 

        if(runtimeData?.dgdrt?.[backendDGNo]) {
          setRuntime(runtimeData.dgdrt[backendDGNo].runningTimeMinutes);
        }
        else {
          setRuntime(null);
        }
  
        const hkWhDiffResponse = await fetch(`https://mw.elementsenergies.com/api/dgdkWhdiff?startDateTime=${startDateTime}&endDateTime=${endDateTime}&DGNo=${backendDGNo}`);
        const hkWhDiffData = await hkWhDiffResponse.json();

        console.log("hkWhDiffData:", hkWhDiffData);
  
        const raw = hkWhDiffData.hrly_kwh_diff?.[backendDGNo];
        if (raw) {
          const parsed = Object.entries(raw).map(([ts, kWh]) => ({
            x: new Date(ts).getTime(),
            y: kWh,
            originalTimestamp: ts,
          }));
          setConsumptionData(parsed);
          
        } else {
          console.warn("Missing or malformed hourly generation chart data", hkWhDiffData);
          setConsumptionData([]);
        }
  
      } catch (err) {
        console.error("Error fetching DG data:", err);
        setEnergyProduced(0);
        setConsumptionData([]);
      }
    };
  
    if (backendDGNo) {
      fetchEnergyData();
    }
  }, [id, startDateTime, endDateTime]);
  

  return (
    <div className="p-6 bg-white mt-5 rounded-lg shadow-md mx-4">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/3 p-6 lg:border-r lg:border-gray-300"> 
          <h2 className="text-2xl font-bold text-center mb-4"></h2>  
          <div className="relative group w-fit mx-auto mb-4">
  <img
    className="w-50 h-40 object-contain rounded-lg"
    src={dg}
    alt="DG"
  />
  <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 bg-opacity-90 text-white text-sm py-2 px-4 rounded-lg shadow-lg z-10 pointer-events-none whitespace-nowrap">
    Section Not Available
  </p>
</div>


          <div className="text-lg text-gray-700 space-y-2">
            <p><strong>Status:</strong> <span className={status === 'Running' ? 'text-green-600' : 'text-red-600'}>{status}</span></p>
            <p><strong>Energy Generation:</strong> {energyProduced} kWh</p>
            <p><strong>Voltage:</strong> {vlnValue !== null ? `${vlnValue} V` : 'N/A'}</p>
            <p><strong>Current:</strong> {currentValue !== null ? `${currentValue} A` : 'N/A'}</p>
            <p><strong>Total Runtime:</strong> {runtime !== null ? `${runtime} minutes` : 'N/A'}</p>
            <p><strong>Last Updated:</strong> {timestamp ? `${timestamp}` : 'N/A'}</p>
          </div>
        </div>

        <div className="lg:w-2/3">
            <h2 className="text-2xl font-bold text-center pb-4 pt-5 mb-4">Energy Generation</h2>
            <HighchartsReact highcharts={Highcharts} options={chartOptions} className="flex justify-center" />
        </div>
      </div>
    </div>
  );
};

export default Dgd;
