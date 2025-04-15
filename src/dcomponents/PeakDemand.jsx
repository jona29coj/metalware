import React, { useEffect, useState, useContext } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import axios from "axios";
import moment, { max } from "moment-timezone";
import { DateContext } from "../contexts/DateContext";

const PeakDemand = () => {
  const { selectedDate: globalSelectedDate } = useContext(DateContext); // Get date from context
  const [peakDemandData, setPeakDemandData] = useState([]);
  const [localDate, setLocalDate] = useState(globalSelectedDate); // Local date state

  const fetchPeakDemandData = async (date) => {
    try {
      const currentDateTime = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
      const response = await axios.get("https://mw.elementsenergies.com/api/opeakdemand", {
        params: {
          date,
          currentDateTime, // Use current date and time in Asia/Kolkata timezone
        },
      });
      setPeakDemandData(response.data.peakDemandData);
    } catch (error) {
      console.error("Error fetching peak demand data:", error);
    }
  };

  useEffect(() => {
    setLocalDate(globalSelectedDate);
  }, [globalSelectedDate]);

  useEffect(() => {
    fetchPeakDemandData(localDate);
  }, [localDate]);

  const options = {
    chart: {
      type: "line",
      backgroundColor: "white",
    },
    title: {
      text: null,
      align: "center",
      style: {
        fontSize: "18px",
        fontWeight: "bold",
      },
    },
    xAxis: {
      categories: peakDemandData.map((data) => moment(data.minute).format('HH:mm')),
      title: {
        text: "Hour",
        style: {
          fontWeight: "bold",
        },
      },
      gridLineWidth: 0,
    },
    yAxis: {
      min:0,
      max: 800,
      title: {
        text: "Peak Demand (kVA)",
        style: {
          fontWeight: "bold",
        },
      },
      gridLineWidth: 0,
      plotLines: [
        {
          value: 745,
          color: 'red',
          dashStyle: 'Dash',
          width: 2,
          label: {
            text: 'Upper Ceiling (745 kVA)',
            align: 'right',
            style: {
              color: 'red',
              fontWeight: 'bold'
            }
          }
        },
        {
          value: 558.75,
          color: 'red',
          dashStyle: 'Dash',
          width: 2,
          label: {
            text: 'Lower Ceiling (558.75 kVA)',
            align: 'right',
            style: {
              color: 'red',
              fontWeight: 'bold'
            }
          }
        }
      ]
    },
    
    tooltip: {
      shared: true,
      backgroundColor: "white",
      style: {
        color: "#000",
      },
      borderRadius: 10,
      formatter: function () {
        const point = this.points[0];
        const time = point.point.time.split(' ')[1];
        return `<b>Time:</b> ${time}<br/><b>Value:</b> ${point.y} kVA`;
      },
    },
    plotOptions: {
      line: {
        dataLabels: {
          enabled: false,
        },
      },
    },
    series: [
      {
        name: "Apparent Power",
        data: peakDemandData.map((data) => ({
          y: parseFloat(data.total_kVA),
          time: data.minute
        })),
        color: "#1f77b4",
      }
    ],
    legend: {
      align: "center",
      verticalAlign: "bottom",
      layout: "horizontal",
    },
    credits: {
      enabled: false,
    },
    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 768,
          },
          chartOptions: {
            legend: {
              layout: "horizontal",
              align: "center",
              verticalAlign: "bottom",
            },
          },
        },
      ],
    },
  };

  const handleLocalDateChange = (event) => {
    setLocalDate(event.target.value);
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 w-full h-full">
      <div className="flex justify-between items-center pb-6">
        <h2 className="text-xl font-semibold">Peak Demand</h2>
        <div className="flex space-x-4">
          <div>
            <label htmlFor="date" className="block text-gray-700 font-bold mb-2"></label>
            <input
              type="date"
              id="date"
              value={localDate}
              onChange={handleLocalDateChange}
              className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        </div>
      </div>
      {/* Chart Container */}
      <div className="w-full h-[400px] -translate-x-4">
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    </div>
  );
};

export default PeakDemand;