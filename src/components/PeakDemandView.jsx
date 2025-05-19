import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { DateContext } from '../contexts/DateContext';
import * as XLSX from 'xlsx'; 

const PeakDemandView = () => {
  const [peakDemandData, setPeakDemandData] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { startDateTime, endDateTime } = useContext(DateContext); 

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 13;

  useEffect(() => {
    const fetchPeakDemandData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://mw.elementsenergies.com/api/apd', {
          params: {
            startDateTime,
            endDateTime,
          },
        });
        setPeakDemandData(response.data.peakDemandAboveThreshold);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (startDateTime && endDateTime) {
      fetchPeakDemandData();
      setCurrentPage(1);
    }
  }, [startDateTime, endDateTime]); 

  const formatTime = (timestamp) => {
    if (!timestamp) return ''; 
    return timestamp.split(' ')[1].substring(0, 5); 
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${parseInt(day)}/${parseInt(month)}/${year}`;
  };

  const handleDownloadExcel = () => {
    if (!peakDemandData || peakDemandData.length === 0) {
      alert("No data available to download.");
      return;
    }
  
    const headerRow = [`Start: ${startDateTime}`, `End: ${endDateTime}`, "", "", ""]; 
  
    const columnHeaders = ["ID", "Date", "Time", "Alert", "Limit", "Value (kVA)"];
  
    const dataRows = peakDemandData.map((item) => [
      item.id,
      formatDisplayDate(item.minute.split(' ')[0]),
      formatTime(item.minute),
      "Peak Demand",
      "558.75 kVA",
      item.total_kVA,
    ]);
  
    const dataForExcel = [headerRow, columnHeaders, ...dataRows];
  
    const worksheet = XLSX.utils.aoa_to_sheet(dataForExcel);
  
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Peak Demand Data');
  
    XLSX.writeFile(workbook, 'Alerts.xlsx');
  };

  const totalPages = peakDemandData ? Math.ceil(peakDemandData.length / itemsPerPage) : 0;
  const currentItems = peakDemandData ? peakDemandData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  ) : [];

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  if (!peakDemandData) return <div className="p-6">No data available for the selected date.</div>;

  return (
    <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen">
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Alert Logs</h1>
          <button
            onClick={handleDownloadExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
          >
            Download Excel
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-2 px-4 text-left">ID</th>
                <th className="py-2 px-4 text-left">Date</th>
                <th className="py-2 px-4 text-left">Time</th>
                <th className="py-2 px-4 text-left">Alert</th>
                <th className="py-2 px-4 text-left">Limit</th>
                <th className="py-2 px-4 text-left">Value</th>
              </tr>
            </thead>

            <tbody>
              {currentItems.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{item.id}</td>
                  <td className="py-2 px-4">{formatDisplayDate(item.minute.split(' ')[0])}</td>
                  <td className="py-2 px-4">{formatTime(item.minute)}</td>
                  <td className="py-2 px-4">Peak Demand</td>
                  <td className="py-2 px-4">558.75 kVA</td>
                  <td className="py-2 px-4">{item.total_kVA}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-4">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`mx-1 px-3 py-1 rounded-md ${
                  currentPage === index + 1
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PeakDemandView;