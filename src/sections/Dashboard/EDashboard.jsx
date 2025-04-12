import React from "react";
import 'react-datepicker/dist/react-datepicker.css';
import Batteries from '../../dcomponents/Batteries';
import WaterStorage from '../WaterStorage';
import EVChargerOverview from '../evchargers';
import WheeledInSolar from "../../dcomponents/WheeledInSolar";
import PeakDemand from "../../dcomponents/PeakDemand";
import EnergyConsumption from "../../dcomponents/EnergyConsumption";
import MeterInfo from "../EnergyMeter";
import DieselGeneration from "../../dcomponents/DieselGeneration";
import HConsumption from "../../dcomponents/HConsumption";
import axios from 'axios';
import { useState, useEffect, useRef, useContext } from 'react';
import moment from 'moment-timezone';
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DateContext } from "../../contexts/DateContext";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

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
const kolkataTime = moment()
.tz('Asia/Kolkata')
.format('YYYY-MM-DD HH:mm:ss');

const Edmc = () => {
  const { period, rate } = getCurrentRate();
  const [carbonFootprint, setCarbonFootprint] = useState(null);
  const [totalCost, setTotalCost] = useState(null);
  const [consumption, setConsumption] = useState(0);  
  const [peakDemand, setPeakDemand] = useState(0);
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
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/dashboard', {
          params: { timestamp: kolkataTime },
          headers: { 'Content-Type': 'application/json' }
        });
  
        const data = response.data.data;
  
        setConsumption(data.totalConsumption?.value || 0);
        seteakDemand(data.peakDemand?.value || 0);
        
        setLoading(false);
      } catch (err) {
        console.error('Dashboard API error:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };
  
    fetchDashboardData();
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

const categoryColors = {
  "C-49": "#008B8B",
  "C-50": "#FFA500",
};

const highlightColors = {
  "C-49": "#99FF99",
  "C-50": "#FFFF99",
};

const ZoneUsage = () => {
  const { selectedDate: globalSelectedDate } = useContext(DateContext); // Get date from context
  const mountRef = useRef(null);
  const tooltipRef = useRef(null);
  const [hoveredZone, setHoveredZone] = useState(null);
  const [zoneData, setZoneData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const meterToZoneMap = {
    1: { name: "SPRAY+ EPL", category: "C-49" },
    2: { name: "PLATING", category: "C-49" },
    3: { name: "COMPRESSOR", category: "C-49" },
    4: { name: "BUFFING + VIBRATOR + ETP", category: "C-49" },
    5: { name: "TERRACE", category: "C-49" },
    6: { name: "SPRAY+ EPL", category: "C-50" },
    7: { name: "CHINA BUFFING", category: "C-50" },
    8: { name: "BUFFING+CASTING M/C", category: "C-50" },
    9: { name: "DIE CASTING", category: "C-50" },
    10: { name: "RUMBLE", category: "C-50" },
    11: { name: "TOOL ROOM", category: "C-50" },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const currentDateTime = moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");

        const response = await fetch(
          `https://mw.elementsenergies.com/api/econsumption?date=${globalSelectedDate}&currentDateTime=${currentDateTime}`,
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          throw new Error(`Invalid response: ${text.substring(0, 100)}`);
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const transformedData = data.consumptionData
          .filter((item) => meterToZoneMap[item.energy_meter_id])
          .map((item) => {
            const zoneInfo = meterToZoneMap[item.energy_meter_id];
            return {
              name: zoneInfo.name,
              kWh: parseFloat(item.consumption) || 0,
              category: zoneInfo.category,
            };
          });

        setZoneData(transformedData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [globalSelectedDate]); // Fetch data when the global date changes

  useEffect(() => {
    if (loading || error || !mountRef.current || zoneData.length === 0) return;

    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    const camera = new THREE.PerspectiveCamera(30, width / height, 2.5, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enabled = false;
    controls.enableZoom = false;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let currentIntersected = null;

    const cubes = zoneData.map((zone, index) => {
      const height = zone.category === "C-50" ? 0.7 : 1;
      const width = zone.category === "C-49" ? 2 : 2;
      const depth = zone.category === "C-50" ? 2.4 : 2.4;

      const geometry = new THREE.BoxGeometry(width, height, depth);
      const material = new THREE.MeshBasicMaterial({
        color: categoryColors[zone.category],
      });

      const edgesGeometry = new THREE.EdgesGeometry(geometry);
      const edgesMaterial = new THREE.LineBasicMaterial({
        color: highlightColors[zone.category],
      });
      const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);

      const cube = new THREE.Mesh(geometry, material);

      let xPos, yPos;
      if (zone.category === "C-49") {
        xPos = -3;
        yPos = (index % 5) * height - 2 + height / 2;
      } else {
        xPos = 2;
        yPos = ((index - 5) % 6) * height - 2 + height / 2;
      }

      cube.position.set(xPos, yPos, 0);
      edges.position.set(xPos, yPos, 0);

      cube.userData = { ...zone, originalColor: categoryColors[zone.category] };

      scene.add(cube);
      scene.add(edges);
      return cube;
    });

    camera.position.set(8, 0, 9);
    camera.lookAt(0, 0, 0);

    const checkIntersection = (x, y) => {
      const rect = mount.getBoundingClientRect();
      mouse.x = ((x - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((y - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(cubes);

      if (intersects.length > 0) {
        const intersected = intersects[0].object;
        if (intersected !== currentIntersected) {
          // Reset previous intersection
          if (currentIntersected) {
            currentIntersected.material.color.set(currentIntersected.userData.originalColor);
          }

          // Set new intersection
          currentIntersected = intersected;
          intersected.material.color.set(highlightColors[intersected.userData.category]);
          setHoveredZone(intersected.userData);

          tooltipRef.current.style.display = "block";
          tooltipRef.current.style.left = `${x + 10}px`;
          tooltipRef.current.style.top = `${y + 10}px`;
          tooltipRef.current.innerHTML = `${intersected.userData.name}: ${intersected.userData.kWh} kWh`;

          mount.style.cursor = "pointer";
        }
        return true;
      } else {
        if (currentIntersected) {
          currentIntersected.material.color.set(currentIntersected.userData.originalColor);
          currentIntersected = null;
        }
        setHoveredZone(null);
        tooltipRef.current.style.display = "none";
        mount.style.cursor = "default";
        return false;
      }
    };

    const handleMouseMove = (event) => {
      checkIntersection(event.clientX, event.clientY);
    };

    const handleMouseOver = (event) => {
      // This ensures the tooltip stays visible when mouse stops moving but stays over a cube
      if (!checkIntersection(event.clientX, event.clientY)) {
        tooltipRef.current.style.display = "none";
      }
    };

    mount.addEventListener("mousemove", handleMouseMove);
    mount.addEventListener("mouseover", handleMouseOver);

    const handleResize = () => {
      const newWidth = mount.clientWidth;
      const newHeight = mount.clientHeight;
      renderer.setSize(newWidth, newHeight);
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      mount.removeChild(renderer.domElement);
      window.removeEventListener("resize", handleResize);
      mount.removeEventListener("mousemove", handleMouseMove);
      mount.removeEventListener("mouseover", handleMouseOver);
    };
  }, [zoneData, loading, error]); // Removed globalSelectedDate from dependency array to avoid re-initialization

  if (loading) return <div className="text-center py-8">Loading zone data...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  if (zoneData.length === 0) return <div className="text-center py-8">No zone data available</div>;

  return (
    <>
      <div className="relative bg-white p-5 rounded-lg shadow-md w-full flex flex-col space-y-8">
        <h2 className="text-xl font-semibold p-2">Zonal Usage</h2>
        <div ref={mountRef} className="w-full h-[60%] xl-w-full overflow-hidden relative" />
        <div className="flex space-x-12 pb-2 justify-center items-start">
          <div className="bg-[#008B8B] text-white px-4 py-3 rounded-lg shadow-lg border-2 border-[#99FF99] text-lg font-bold">
            C-49
          </div>
          <div className="bg-[#FFA500] text-white px-4 py-3 rounded-lg shadow-lg border-2 border-[#FFFF99] text-lg font-bold">
            C-50
          </div>
        </div>
      </div>
      <div
        ref={tooltipRef}
        className="fixed bg-white p-2 border border-black rounded shadow-lg text-sm hidden pointer-events-none z-50"
        style={{ transform: 'translate(10px, 10px)' }}
      />
    </>
  );
};

const meterNames = [
  { id: 1, name: "SPRAY+ EPL", category: "C-49" },
  { id: 2, name: "PLATING", category: "C-49" },
  { id: 3, name: "COMPRESSOR", category: "C-49" },
  { id: 4, name: "BUFFING + VIBRATOR + ETP", category: "C-49" },
  { id: 5, name: "Terrace", category: "C-49" },
  { id: 6, name: "SPRAY+ EPL", category: "C-50" },
  { id: 7, name: "CHINA BUFFING", category: "C-50" },
  { id: 8, name: "BUFFING+CASTING M/C -7", category: "C-50" },
  { id: 9, name: "DIE CASTING", category: "C-50" },
  { id: 10, name: "RUMBLE", category: "C-50" },
  { id: 11, name: "TOOL ROOM", category: "C-50" },
];

const getMeterName = (id) => {
  const meter = meterNames.find((meter) => meter.id === id);
  return meter ? meter.name : "Unknown";
};

const EnergySources = () => {
  const { selectedDate: globalSelectedDate } = useContext(DateContext); // Get date from context
  const [zones, setZones] = useState([]);
  const [localSelectedDate, setLocalSelectedDate] = useState(globalSelectedDate); // Local date state
  const [highZone, setHighZone] = useState({ meter_id: "N/A", consumption: 0 });
  const [lowZone, setLowZone] = useState({ meter_id: "N/A", consumption: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLocalSelectedDate(globalSelectedDate);
  }, [globalSelectedDate]);

  // Fetch data from the backend
  const fetchConsumptionData = async (date) => {
    setLoading(true);
    setError(null);
    try {
      const currentDateTime = moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");

      const response = await axios.get("https://mw.elementsenergies.com/api/hlcons", {
        params: { date, currentDateTime },
      });

      if (response.data) {
        setZones(response.data.consumptionData);
        setHighZone(response.data.highZone);
        setLowZone(response.data.lowZone);
      }
    } catch (err) {
      setError("Failed to fetch data");
      console.error("Error fetching data:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchConsumptionData(localSelectedDate);
  }, [localSelectedDate]);

  const handleLocalDateChange = (e) => {
    setLocalSelectedDate(e.target.value);
  };

  const totalConsumption = zones.reduce((sum, zone) => sum + parseFloat(zone.consumption), 0);

  const otherZonesConsumption = (totalConsumption - (highZone.consumption + lowZone.consumption)).toFixed(1);

  const chartOptions = {
    chart: {
      type: "column",
      backgroundColor: "transparent",
      height: "300px",
    },
    title: { text: "" },
    xAxis: { categories: ["Total Consumption"] },
    yAxis: { title: { text: "Consumption (kWh)" } },
    plotOptions: {
      series: {
        stacking: "normal",
        borderWidth: 0,
        dataLabels: { enabled: false },
      },
    },
    tooltip: {
      formatter: function () {
        if (this.series.name === "Other Zones") {
          return `<b>Other Zones:</b> ${otherZonesConsumption} kWh`;
        }
        return `<b>${this.series.name}:</b> ${this.y} kWh`;
      },
    },
    series: [
      { name: `High Zone (${getMeterName(highZone.meter_id)})`, data: [highZone.consumption], color: "rgb(185, 28, 28)" },
      { name: "Other Zones", data: [parseFloat(otherZonesConsumption)], color: "rgba(96, 165, 250, 0.2)", showInLegend: true },
      { name: `Low Zone (${getMeterName(lowZone.meter_id)})`, data: [lowZone.consumption], color: "rgb(21, 128, 61)" },
    ],
    legend: { enabled: true },
    credits: { enabled: false },
  };

  return (
    <div className="bg-white xl:h-[68vh] p-5 rounded-lg shadow-md flex flex-col space-y-7">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Consumption</h2>
        <div className="relative">
          <input
            type="date"
            value={localSelectedDate} 
            onChange={handleLocalDateChange} 
            className="border rounded p-1 text-sm"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-2 gap-6 xl justify-start items-start">
          <div>
            <div className="lg:space-y-5 md:space-y-4">
              <div className="border border-red-500 p-3 rounded-lg shadow">
                <h3 className="md:text-md lg:text-md font-semibold text-red-700">High Zone</h3>
                <p className="text-gray-900 text-sm mt-2">Zone: {getMeterName(highZone.meter_id)}</p>
                <p className="text-gray-900 text-sm mt-1">{highZone.consumption} kWh</p>
                <p className="text-sm text-gray-600 mt-1">{((highZone.consumption / totalConsumption) * 100).toFixed(1)}% of Total Consumption</p>
              </div>
              <div className="border border-green-500 p-3 rounded-lg shadow">
                <h3 className="md:text-md lg:text-md font-semibold text-green-700">Low Zone</h3>
                <p className="text-gray-900 text-sm mt-2">Zone: {getMeterName(lowZone.meter_id)}</p>
                <p className="text-gray-900 text-sm mt-1">{lowZone.consumption} kWh</p>
                <p className="text-sm text-gray-600 mt-1">{((lowZone.consumption / totalConsumption) * 100).toFixed(1)}% of Total Consumption</p>
              </div>
              <div className="border border-blue-500 p-3 rounded-lg shadow">
                <h3 className="md:text-md lg:text-md font-semibold text-blue-700">Other Zones</h3>
                <p className="text-gray-900 text-sm mt-1">{otherZonesConsumption} kWh</p>
                <p className="text-sm text-gray-600 mt-1">{((parseFloat(otherZonesConsumption) / totalConsumption) * 100).toFixed(1)}% of Total Consumption</p>
              </div>
            </div>
          </div>
          <div className="flex justify-center items-center mt-6 pt-10">
            <HighchartsReact highcharts={Highcharts} options={chartOptions} />
          </div>
        </div>
      )}
    </div>
  );
};


const EDashboard = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 p-3 gap-4">
      <div className="lg:h-[20vh]" id="Facility Information Consumption Peak Demand Cost of Electricity Today's Total Cost Carbon Footprint">
      <Edmc />
      </div>
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 relative" id="Zone Usage Consumption">
        <ZoneUsage />
        <EnergySources />
      </div>
      <div id="Hourly Consumption"><HConsumption/></div>
      <div id="Energy Meters"><MeterInfo /></div>
      <div id="Peak Demand"><PeakDemand /></div>
      <div id="Daily Consumption"><EnergyConsumption /></div>
      <div><DieselGeneration /></div>
      <WheeledInSolar />
      <Batteries />
      <EVChargerOverview />
    </div>
  );
};

export default EDashboard;
