import React, { useState, useEffect, useContext } from 'react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import axios from 'axios';
import moment from 'moment-timezone';
import { useLocation, useNavigate } from 'react-router-dom';
import { DateContext } from '../../contexts/DateContext';
import Exporting from 'highcharts/modules/exporting';
import ExportData from 'highcharts/modules/export-data';

if (Exporting && typeof Exporting === 'function') {
  Exporting(Highcharts);
}

if (ExportData && typeof ExportData === 'function') {
  ExportData(Highcharts);
}


const zoneMetadata = [
  { id: 1, name: "SPRAY+ EPL", category: "C-49" },
  { id: 2, name: "PLATING", category: "C-49" },
  { id: 3, name: "COMPRESSOR", category: "C-49" },
  { id: 4, name: "BUFFING + VIBRATOR + ETP", category: "C-49" },
  { id: 5, name: "TERRACE", category: "C-49" },
  { id: 6, name: "SPRAY+ EPL", category: "C-50" },
  { id: 7, name: "CHINA BUFFING", category: "C-50" },
  { id: 8, name: "BUFFING+CASTING M/C -7", category: "C-50" },
  { id: 9, name: "DIE CASTING", category: "C-50" },
  { id: 10, name: "RUMBLE", category: "C-50" },
  { id: 11, name: "TOOL ROOM", category: "C-50" },
];

const Zones = () => {
  const { selectedDate: globalSelectedDate } = useContext(DateContext); 
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
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const currentDateTime = moment(globalSelectedDate).tz('Asia/Kolkata').format('YYYY-MM-DD 23:59:59');
        const date = globalSelectedDate;
        const zones = selectedView === 'single' 
        ? [selectedZone] 
        : zoneMetadata.map(zone => zone.id);
        const endpoint = consumptionType === 'kWh' ? 'zconsumption' : 'zkVAhconsumption';

      
      const [consumptionResponses, pfResponses] = await Promise.all([
        Promise.all(zones.map(zone =>
          axios.get(`https://mw.elementsenergies.com/api/${endpoint}`, { params: { date, currentDateTime, zone } })
        )),
        Promise.all(zones.map(zone =>
          axios.get(`https://mw.elementsenergies.com/api/pf`, { params: { date, currentDateTime, zone } })
        ))
      ]);
      

        setZoneData(zones.map((zoneId, index) => {
          const metadata = zoneMetadata.find(z => z.id === zoneId);
          return {
            zoneId,
            zoneName: metadata.name,
            category: metadata.category,
            consumption: consumptionResponses[index].data.consumptionData.map(item => parseFloat(item.total_consumption)),
            pf: Math.abs(parseFloat(pfResponses[index].data.pfValue || 0)),
            color: ['#34D399', '#60A5FA', '#FBBF24', '#EF4444', '#A78BFA', '#10B981', '#3B82F6', '#D97706', '#9333EA', '#EC4899'][index] || '#000000'
          };
        }));
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [location.search, consumptionType, globalSelectedDate]); // Use globalSelectedDate directly

  const chartOptions = (zone) => ({
    title: { text: null },
    chart: {
      type: 'column',
      backgroundColor: 'white'
    },
    xAxis: {
      categories: Array.from({ length: 24 }, (_, i) => {
        // Format as 00:00, 01:00, 02:00, etc.
        return `${String(i).padStart(2, '0')}:00`;
      }),
      title: { text: null },
      gridLineWidth: 0,
      lineColor: 'transparent'
    },
    yAxis: {
      min: 0,
      title: { text: `Energy Consumption (${consumptionType})` },
      gridLineWidth: 0,
      lineColor: 'transparent'
    },
    plotOptions: {
      column: {
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          format: '{y} '
        }
      }
    },
    series: [{
      name: zone.zoneName,
      data: zone.consumption, // Make sure this data is aggregated by hour
      color: zone.color
    }],
    tooltip: {
      valueSuffix: ` ${consumptionType}`
    },
    credits: { enabled: false },
    exporting: {
      enabled: true,
      buttons: {
        contextButton: {
          menuItems: ['downloadXLS']  // Only show Excel option
        }
      }
    }
  });
  const handleViewChange = (view) => {
    setSelectedView(view);
    const params = new URLSearchParams();
    if (view === 'single') params.set('zone', selectedZone);
    navigate(`?${params.toString()}`, { replace: true });
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Enhanced Toggle Panel */}
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => handleViewChange('all')}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
                  selectedView === 'all'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                All Zones
              </button>
              <button
                type="button"
                onClick={() => handleViewChange('single')}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${
                  selectedView === 'single'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Select Zone
              </button>
            </div>

            {selectedView === 'single' && (
              <div className="relative">
                <select
                  value={selectedZone}
                  onChange={(e) => {
                    setSelectedZone(parseInt(e.target.value));
                    navigate(`?zone=${e.target.value}`, { replace: true });
                  }}
                  className="block w-full pl-3 pr-8 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm appearance-none"
                >
                  {zoneMetadata.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.category} - {zone.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Local Date Picker Removed Here */}
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white p-4 rounded-md shadow-sm flex justify-center items-center h-64">
          <div className="text-gray-500">Loading data...</div>
        </div>
      ) : (
        <div className="space-y-4">
          {(selectedView === 'all' ? zoneData : zoneData.filter(zone => zone.zoneId === selectedZone)).map((zone) => (
            <div key={zone.zoneId} className="bg-white p-5 rounded-md shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{zone.zoneName}</h3>
                  <p className="text-sm text-gray-500">{zone.category}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    PF: {zone.pf.toFixed(2)}
                  </div>
                  <div className="flex items-center space-x-1 bg-gray-100 rounded-full p-1">
                    <button
                      onClick={() => setConsumptionType('kWh')}
                      className={`px-2 py-1 text-xs rounded-full ${
                        consumptionType === 'kWh' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      kWh
                    </button>
                    <button
                      onClick={() => setConsumptionType('kVAh')}
                      className={`px-2 py-1 text-xs rounded-full ${
                        consumptionType === 'kVAh' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      kVAh
                    </button>
                  </div>
                </div>
              </div>
              <HighchartsReact highcharts={Highcharts} options={chartOptions(zone)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Zones;