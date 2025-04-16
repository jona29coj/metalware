import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { DateContext } from '../contexts/DateContext';

const PeakDemandView = () => {
  const [peakDemandData, setPeakDemandData] = useState(null); // Initialize as null
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { selectedDate } = useContext(DateContext);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 13;

  useEffect(() => {
    const fetchPeakDemandData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://mw.elementsenergies.com/api/apd', {
          params: {
            date: selectedDate,
            currentDateTime: new Date().toISOString() // Just send current time as-is
          }
        });
        setPeakDemandData(response.data.peakDemandAboveThreshold);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPeakDemandData();
    setCurrentPage(1);
  }, [selectedDate]);

  // Format timestamp from backend (assuming format is "YYYY-MM-DD HH:mm:ss")
  const formatTime = (timestamp) => {
    if (!timestamp) return ''; // Handle undefined timestamp
    return timestamp.split(' ')[1].substring(0, 5); // Extracts just "HH:mm"
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${parseInt(day)}/${parseInt(month)}/${year}`;
  };
  

  // Calculate pagination values
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
      <h1 className="text-2xl font-bold mb-4 text-center">
  Alert Logs
</h1>


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