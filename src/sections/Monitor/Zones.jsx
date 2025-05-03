import React, { useState, useEffect, useContext } from 'react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { DateContext } from '../../contexts/DateContext';
import Exporting from 'highcharts/modules/exporting';
import ExportData from 'highcharts/modules/export-data';

if (Exporting && typeof Exporting === 'function') Exporting(Highcharts);
if (ExportData && typeof ExportData === 'function') ExportData(Highcharts);

const zoneMetadata = [
  { id: 1, name: "PLATING", category: "C-49" },
  { id: 2, name: "DIE CASTING + CHINA BUFFING + CNC", category: "C-50" },
  { id: 3, name: "SCOTCH BUFFING", category: "C-50" },
  { id: 4, name: "BUFFING", category: "C-49" },
  { id: 5, name: "SPRAY+EPL-I", category: "C-50" },
  { id: 6, name: "SPRAY+EPL-II", category: "C-49" },
  { id: 7, name: "RUMBLE", category: "C-50" },
  { id: 8, name: "AIR COMPRESSOR", category: "C-49" },
  { id: 9, name: "TERRACE", category: "C-49" },
  { id: 10, name: "TOOL ROOM", category: "C-50" },
  { id: 11, name: "ADMIN BLOCK", category: "C-50" },
];

const Zones = () => {
  const { startDateTime, endDateTime } = useContext(DateContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [zoneData, setZoneData] = useState([]);
  const [selectedView, setSelectedView] = useState(
    new URLSearchParams(location.search).has('zone') ? 'single' : 'all'
  );
  const [selectedZone, setSelectedZone] = useState(
    parseInt(new URLSearchParams(location.search).get('zone')) || 1
  );
  const [isLoading, setIsLoading] = useState(true);
  const [consumptionType, setConsumptionType] = useState('kWh');

  useEffect(() => {
    const fetchZoneData = async () => {
      try {
        setIsLoading(true);

        const endpoint = consumptionType === 'kWh' ? 'zconsumption' : 'zkVAhconsumption';
        const zones = selectedView === 'single' ? [selectedZone] : zoneMetadata.map((zone) => zone.id);

        const consumptionResponses = await Promise.all(
          zones.map((zone) =>
            axios.get(`https://mw.elementsenergies.com/api/${endpoint}`, {
              params: { startDateTime, endDateTime, zone },
            })
          )
        );

        const formattedData = zones.map((zoneId, index) => {
          const metadata = zoneMetadata.find((z) => z.id === zoneId);
          const consumptionData = consumptionResponses[index].data.consumptionData || [];
          const parsedData = consumptionData.map((item) => ({
            hour: item.hour,
            value: parseFloat(
              consumptionType === 'kWh' ? item.kWh_difference || 0 : item.kVAh_difference || 0
            ),
          }));

          return {
            zoneId,
            zoneName: metadata?.name || `Zone ${zoneId}`,
            category: metadata?.category || '',
            data: parsedData,
          };
        });

        setZoneData(formattedData);
      } catch (error) {
        console.error('Error fetching zone data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchZoneData();
  }, [startDateTime, endDateTime, consumptionType, selectedView, selectedZone]);

  const chartOptionsAllZones = {
    chart: {
      type: 'column',
      backgroundColor: 'white',
      spacingTop: 40,
    },
    title: {
      text: null,
    },
    xAxis: {
      categories: [
        ...new Set(zoneData.flatMap((zone) => zone.data.map((item) => item.hour))),
      ].map((hour) => hour.substring(11, 16)),
      title: { text: 'Time' },
      gridLineWidth: 0, 
    },
    yAxis: {
      min: 0,
      title: { text: `Energy Consumption (${consumptionType})` },
      gridLineWidth: 0, 
      stackLabels: {
        enabled: true, 
        style: {
          fontWeight: 'bold',
          color: Highcharts.defaultOptions.title.style?.color || 'gray',
        },
      },
    },
    tooltip: {
      pointFormat:
        '{series.name}: {point.y} ' +
        consumptionType +
        '<br/>Total: {point.stackTotal} ' +
        consumptionType,
    },
    plotOptions: {
      column: {
        stacking: 'normal', 
        dataLabels: {
          enabled: false, 
        },
      },
    },
    series: zoneData.map((zone) => ({
      name: zone.zoneName,
      data: [
        ...new Set(zoneData.flatMap((zone) => zone.data.map((item) => item.hour))),
      ].map((hour) => zone.data.find((item) => item.hour === hour)?.value || 0),
    })),
    credits: {
      enabled: false,
    },
    exporting: {
      enabled: true,
      filename: `All_Zones_${startDateTime} - ${endDateTime}`,
      buttons: {
        contextButton: {
          menuItems: ['downloadXLS'],
        },
      },
    },
    
  };

  const chartOptionsSingleZone = (zone) => ({
    chart: { type: 'column', backgroundColor: 'white' },
    title: {
      text: `${zone.zoneName} <span style="font-size: 12px; font-weight: normal; color: gray;">(${zone.category})</span>`,
      useHTML: true, 
    },    xAxis: {
      categories: zone.data.map((item) => item.hour.substring(11, 16)),
      gridLineWidth: 0,
    },
    yAxis: {
      min: 0,
      title: { text: `Energy Consumption (${consumptionType})` },
      gridLineWidth: 0,
    },
    series: [
      {
        name: zone.zoneName,
        data: zone.data.map((item) => item.value),
        dataLabels: {
          enabled: true, 
          formatter: function () {
            return `${this.y}`; 
          },
          style: {
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#000',
          },
        },
      },
    ],
    plotOptions: {
      column: {
        dataLabels: {
          enabled: true, 
          formatter: function () {
            return `${this.y}`; 
          },
          style: {
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#000',
          },
        },
      },
    },
    credits: { enabled: false },
    exporting: {
      enabled: true,
      filename: `${zone.zoneName}_${startDateTime} - ${endDateTime}`,
      buttons: {
        contextButton: {
          menuItems: ['downloadXLS'],
        },
      },
    },
  });

  const handleViewChange = (view) => {
    setSelectedView(view);
    const params = new URLSearchParams();
    if (view === 'single') params.set('zone', selectedZone);
    navigate(`?${params.toString()}`, { replace: true });
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <div className='flex gap-2'>
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            onClick={() => handleViewChange('all')}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
              selectedView === 'all' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            All Zones
          </button>
          <button
            onClick={() => handleViewChange('single')}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${
              selectedView === 'single' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Select Zone
          </button>
        </div>
        {selectedView === 'single' && (
         <select
         value={selectedZone}
         onChange={(e) => {
           const zoneId = parseInt(e.target.value);
           setSelectedZone(zoneId);
           navigate(`?zone=${zoneId}`, { replace: true });
         }}
         className="px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
       >
         {zoneMetadata.map((zone) => (
           <option key={zone.id} value={zone.id}>
             {zone.name} ({zone.category})
           </option>
         ))}
       </select>
        )}
        </div>
        <div className="flex bg-white rounded-full p-1 space-x-1">
          <button
            onClick={() => setConsumptionType('kWh')}
            className={`px-6 py-2 text-sm font-medium rounded-full transition ${
              consumptionType === 'kWh' ? 'bg-blue-600 text-white' : 'bg-transparent text-gray-700 hover:bg-blue-50'
            }`}
          >
            kWh
          </button>
          <button
            onClick={() => setConsumptionType('kVAh')}
            className={`px-6 py-2 text-sm font-medium rounded-full transition ${
              consumptionType === 'kVAh' ? 'bg-blue-600 text-white' : 'bg-transparent text-gray-700 hover:bg-blue-50'
            }`}
          >
            kVAh
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white p-4 rounded-md shadow-sm flex justify-center items-center h-64">
          <span className="text-gray-500">Loading data...</span>
        </div>
      ) : selectedView === 'all' ? (
        <HighchartsReact highcharts={Highcharts} options={chartOptionsAllZones} />
      ) : (
        zoneData
          .filter((zone) => zone.zoneId === selectedZone)
          .map((zone) => (
            <div key={zone.zoneId} className="bg-white p-5 rounded-md shadow-sm">
              <HighchartsReact highcharts={Highcharts} options={chartOptionsSingleZone(zone)} />
            </div>
          ))
      )}
    </div>
  );
};

export default Zones;