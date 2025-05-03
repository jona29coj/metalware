import React, { useEffect, useState, useContext } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import axios from "axios";
import moment from "moment-timezone";
import { DateContext } from "../contexts/DateContext";

const PeakDemand = () => {
  const { startDateTime, endDateTime } = useContext(DateContext); 
  const [peakDemandData, setPeakDemandData] = useState([]);

  const fetchPeakDemandData = async (startDateTime, endDateTime) => {
    try {
      const response = await axios.get("https://mw.elementsenergies.com/api/opeakdemand", {
        params: {
          startDateTime,
          endDateTime,
        },
      });
      setPeakDemandData(response.data.peakDemandData);
    } catch (error) {
      console.error("Error fetching peak demand data:", error);
    }
  };

  useEffect(() => {
    if (startDateTime && endDateTime) {
      fetchPeakDemandData(startDateTime, endDateTime);
    }
  }, [startDateTime, endDateTime]);

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
      categories: peakDemandData.map((data) => moment(data.minute).format("HH:mm")),
      title: {
        text: "Hour",
        style: {
          fontWeight: "bold",
        },
      },
      gridLineWidth: 0,
    },
    yAxis: {
      min: 0,
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
          color: "red",
          dashStyle: "Dash",
          width: 2,
          label: {
            text: "Upper Ceiling (745 kVA)",
            align: "right",
            x: -30,
            style: {
              color: "red",
              fontWeight: "bold",
            },
          },
        },
        {
          value: 558.75,
          color: "red",
          dashStyle: "Dash",
          width: 2,
          label: {
            text: "Lower Ceiling (558.75 kVA)",
            align: "right",
            x: -10,
            style: {
              color: "red",
              fontWeight: "bold",
            },
          },
        },
      ],
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
        const time = point.point.time.split(" ")[1];
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
          time: data.minute,
        })),
        color: "#1f77b4",
      },
    ],
    legend: {
      align: "center",
      verticalAlign: "bottom",
      layout: "horizontal",
    },
    credits: {
      enabled: false,
    },
    exporting: {
      enabled: true,
      filename: `Peak Demand ${startDateTime} - ${endDateTime}`,
      buttons: {
        contextButton: {
          menuItems: ["downloadXLS"],
        },
      },
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

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 w-full h-full">
      <div className="flex justify-between items-center pb-6">
        <h2 className="text-xl font-semibold">Peak Demand</h2>
      </div>
      <div className="w-full h-[400px] -translate-x-4">
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    </div>
  );
};

export default PeakDemand;