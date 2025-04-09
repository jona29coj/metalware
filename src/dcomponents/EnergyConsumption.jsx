import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import moment from "moment-timezone";

// Function to format date to Asia/Kolkata timezone before sending to backend
const formatDateForBackend = (date) => {
  return moment(date).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
};

const EnergyConsumptionChart = ({ consumptionData, dateRange }) => {
  if (!consumptionData?.length) return <div className="text-center py-10">No data available</div>;

  // Generate heatmap data
  const daysDiff = Math.ceil((dateRange.endDate - dateRange.startDate) / (86400000)) + 1;
  const heatmapData = Array(24).fill().map(() => Array(daysDiff).fill(null));
  
  const dateArray = Array.from({ length: daysDiff }, (_, i) => {
    const d = new Date(dateRange.startDate);
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  consumptionData.forEach(({ day, hour, total_consumption }) => {
    const dayIndex = dateArray.indexOf(day);
    if (dayIndex !== -1 && hour >= 0 && hour < 24) {
      heatmapData[hour][dayIndex] = parseFloat(total_consumption);
    }
  });

  // Generate labels and month separators
  const { labels, monthSeparators } = dateArray.reduce((acc, _, i) => {
    const date = new Date(dateRange.startDate);
    date.setDate(date.getDate() + i);
    const formattedDate = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    
    acc.labels.push(formattedDate);
    
    const month = date.getMonth();
    if (month !== acc.currentMonth && acc.currentMonth !== null) {
      acc.monthSeparators.push({ dayIndex: i, monthName: date.toLocaleDateString('en-US', { month: 'long' }) });
    }
    acc.currentMonth = month;
    
    return acc;
  }, { labels: [], monthSeparators: [], currentMonth: null });

  return (
    <Plot
      data={[{
        z: heatmapData,
        x: labels,
        y: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        type: "heatmap",
        colorscale: [[0, "#006400"], [0.3, "#90EE90"], [0.6, "yellow"], [1, "red"]],
        zmin: 0,
        zmax: Math.max(...heatmapData.flat().filter(Boolean)) || 1,
        colorbar: { title: "Energy (kWh)", thickness: 15, len: 0.8 },
        hovertemplate: "<b>Date:</b> %{x}<br><b>Hour:</b> %{y}<br><b>Consumption:</b> %{z:.2f} kWh<extra></extra>"
      }]}
      layout={{
        xaxis: {
          title: "Date",
          tickvals: labels,
          ticktext: labels.map((_, i) => {
            const d = new Date(dateRange.startDate);
            d.setDate(d.getDate() + i);
            return (i === 0 || d.getDate() === 15 || i === labels.length - 1) ? labels[i] : d.getDate();
          }),
          tickangle: -45,
          showgrid: true,
          ...(monthSeparators.length && {
            shapes: monthSeparators.map(({ dayIndex }) => ({
              type: 'line', x0: dayIndex - 0.5, x1: dayIndex - 0.5, y0: -0.5, y1: 23.5,
              line: { color: 'rgba(0,0,0,0.2)', width: 1.5, dash: 'dot' }
            })),
            annotations: monthSeparators.map(({ dayIndex, monthName }) => ({
              x: dayIndex - 0.5, y: 1.05, yref: 'paper', text: monthName,
              showarrow: false, font: { size: 11 }, xanchor: 'right'
            }))
          })
        },
        yaxis: {
          title: "Hour of Day",
          tickvals: Array.from({ length: 24 }, (_, i) => `${i}:00`),
          ticktext: Array.from({ length: 24 }, (_, i) => i % 4 === 0 ? `${i}:00` : '')
        },
        margin: { t: 30, l: 60, r: 60, b: 100 },
        hovermode: 'closest'
      }}
      style={{ width: "100%", minHeight: "500px" }}
      config={{
        displayModeBar: false,         
        displaylogo: false,            
        modeBarButtonsToRemove: [      
          "zoom2d",
          "pan2d",
          "select2d",
          "lasso2d",
          "zoomIn2d",
          "zoomOut2d",
          "autoScale2d",
          "resetScale2d"
        ]
      }}
    />
  );
};

const EnergyConsumption = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date()
  });
  const [consumptionData, setConsumptionData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const currentDateTime = moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
        const { data } = await axios.get('https://mw.elementsenergies.com/api/ehconsumption', {
          params: {
            startDate: formatDateForBackend(dateRange.startDate),
            endDate: formatDateForBackend(dateRange.endDate),
            currentDateTime: currentDateTime
          }
        });
        setConsumptionData(data.consumptionData);
      } catch (err) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dateRange]);

  return (
    <div className="bg-white shadow rounded-lg p-7">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
        <h2 className="text-lg font-bold">Consumption</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="flex gap-2">
            <DatePicker
              selected={dateRange.startDate}
              onChange={date => setDateRange(prev => ({ ...prev, startDate: date }))}
              selectsStart
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              maxDate={dateRange.endDate}
              dateFormat="MMM d, yyyy"
              className="border rounded px-2 py-1 text-sm w-36"
            />
            <DatePicker
              selected={dateRange.endDate}
              onChange={date => setDateRange(prev => ({ ...prev, endDate: date }))}
              selectsEnd
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              minDate={dateRange.startDate}
              maxDate={new Date()}
              dateFormat="MMM d, yyyy"
              className="border rounded px-2 py-1 text-sm w-36"
            />
          </div>
        </div>
      </div>
      
      {loading ? <div className="text-center py-10">Loading...</div> :
       error ? <div className="text-center py-10 text-red-500">{error}</div> :
       <EnergyConsumptionChart consumptionData={consumptionData} dateRange={dateRange} />}
    </div>
  );
};

export default EnergyConsumption;