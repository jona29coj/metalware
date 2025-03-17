import React from "react";
import Plot from "react-plotly.js";

const EnergyConsumptionChart = () => {
  // Days of the month (1–31)
  const dayNumbers = Array.from({ length: 31 }, (_, i) => i + 1);

  // Hours of the day (0:00–23:00)
  const hoursOfDay = Array.from({ length: 24 }, (_, i) => `${i}:00`);

  // Generate random whole numbers for energy consumption (kWh) between 10 and 50 for each of the 10 zones
  const generateRandomZoneData = (zones, rows, cols) =>
    Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () =>
        Array.from({ length: zones }, () => Math.floor(Math.random() * (50 - 10 + 1) + 10))
      )
    );

  const zones = 10;
  const zoneData = generateRandomZoneData(zones, 24, 31); // 10 zones per cell

  // Compute total consumption by summing up the 10 zones per cell
  const totalConsumptionData = zoneData.map((row) =>
    row.map((cell) => cell.reduce((sum, zoneValue) => sum + zoneValue, 0))
  );

  return (
    <div className="w-full h-full">
      <Plot
        data={[
          {
            z: totalConsumptionData, // Heatmap based on total consumption
            x: dayNumbers, // Day numbers as labels
            y: hoursOfDay,
            type: "heatmap",
            colorscale: [
              [0, "rgba(0, 100, 0, 0.7)"], // Dark Green with opacity
              [0.5, "rgba(255, 255, 0, 0.7)"], // Yellow with opacity
              [1, "rgba(139, 0, 0, 0.7)"], // Dark Red with opacity
            ],
            colorbar: { title: "Total Energy (kWh)", titleside: "right" },
            hovertemplate:
              "Day: %{x}<br>Hour: %{y}<br>" +
              "<b>Total Consumption:</b> %{z} kWh<br>" +
              "<b>Zone Breakdown:</b><br>" +
              Array.from({ length: 10 }, (_, i) => `Zone ${i + 1}: %{customdata[${i}]} kWh`).join("<br>") +
              "<extra></extra>", // Custom tooltip
            customdata: zoneData.map((row) =>
              row.map((cell) => cell) // Each cell now has exactly 10 zones
            ),
          },
        ]}
        layout={{
          title: null,
          xaxis: {
            title: "Day",
            titlefont: { size: 14 },
            tickangle: 0,
            automargin: true,
            tickmode: "array",
            tickvals: dayNumbers,
            ticktext: dayNumbers.map(String),
          },
          yaxis: {
            title: "Hour",
            titlefont: { size: 14 },
            automargin: true,
          },
          autosize: true,
          margin: { t: 50, l: 80, r: 50, b: 50 },
        }}
        config={{
          responsive: true,
          displaylogo: false,
          displayModeBar: false,
          staticPlot: false,
          scrollZoom: false,
          showAxisDragHandles: false,
          showSpikes: false,
          editable: false,
        }}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

const EnergyConsumption = () => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 w-full h-full">
      <h2 className="text-lg font-bold text-gray-700">Energy Consumption</h2>
      <div className="flex-grow w-full h-[500px]">
        <EnergyConsumptionChart />
      </div>
    </div>
  );
};

export default EnergyConsumption;