import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const PeakDemandChart = () => {
  const options = {
    chart: {
      type: "column",
      backgroundColor: "white", // Set chart background to white
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
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      title: {
        text: "Months",
        style: {
          fontWeight: "bold",
        },
      },
      gridLineWidth: 0, // Remove grid lines
    },
    yAxis: {
      title: {
        text: "Peak Demand (kW)",
        style: {
          fontWeight: "bold",
        },
      },
      gridLineWidth: 0, // Remove grid lines
    },
    tooltip: {
      shared: true,
      backgroundColor: "white",
      style: {
        color: "#000", // Ensure tooltip text is visible on white background
      },
      borderRadius: 10,
    },
    plotOptions: {
      column: {
        borderRadius: 5,
      },
    },
    series: [
      {
        name: "2024",
        data: [560.88, 555.0, 556.8, 555.0, 577.68, 613.44, 615.12, 604.08, 628.56, 641.52, 602.4, 555.0],
        color: "#1f77b4",
      },
      {
        name: "2023",
        type: "line",
        data: [578.56, 560.16, 555.0, 555.0, 608.16, 617.04, 615.12, 612.24, 638.56, 665.28, 612.0, 555.0],
        color: "#ff7f0e",
        lineWidth: 3,
        marker: {
          enabled: true,
          radius: 5,
        },
      },
    ],
    legend: {
      align: "center",
      verticalAlign: "bottom", // Move legend to the bottom
      layout: "horizontal", // Keep legend layout horizontal
    },
    credits: {
      enabled: false, // Disable the credits
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

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export default PeakDemandChart;
