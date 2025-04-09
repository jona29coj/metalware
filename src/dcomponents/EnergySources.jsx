import React, { useEffect, useState, useContext } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import axios from "axios";
import moment from "moment-timezone";
import { DateContext } from "../contexts/DateContext";
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

  // Fetch data when the local date changes
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
            value={localSelectedDate} // Use local state
            onChange={handleLocalDateChange} // Update local state
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

export default EnergySources;