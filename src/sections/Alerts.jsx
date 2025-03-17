import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

const AlertsOverview = () => {
  // Sample data for alerts
  const alertsData = [
    {
      id: 1,
      type: 'Warning',
      message: 'High temperature detected in Chiller Unit A!',
      status: 'Active',
      timestamp: '2024-10-17 10:45 AM',
      icon: faExclamationTriangle,
    },
    {
      id: 2,
      type: 'Critical',
      message: 'Chiller Unit B has shut down unexpectedly.',
      status: 'Acknowledged',
      timestamp: '2024-10-17 09:30 AM',
      icon: faTimesCircle,
    },
    {
      id: 3,
      type: 'Info',
      message: 'Maintenance scheduled for all units next week.',
      status: 'Resolved',
      timestamp: '2024-10-16 02:00 PM',
      icon: faCheckCircle,
    },
  ];

  // Sample data for alert history
  const alertHistoryData = [
    {
      id: 1,
      type: 'Critical',
      message: 'Generator failure detected.',
      status: 'Resolved',
      timestamp: '2024-10-14 03:00 PM',
    },
    {
      id: 2,
      type: 'Warning',
      message: 'Pressure fluctuation in Tank 2.',
      status: 'Resolved',
      timestamp: '2024-10-12 01:15 PM',
    },
    {
      id: 3,
      type: 'Info',
      message: 'System maintenance completed.',
      status: 'Resolved',
      timestamp: '2024-10-10 05:00 PM',
    },
    {
      id: 4,
      type: 'Warning',
      message: 'Routine check completed successfully.',
      status: 'Resolved',
      timestamp: '2024-10-09 10:00 AM',
    },
    {
      id: 5,
      type: 'Critical',
      message: 'Network connectivity issue detected.',
      status: 'Resolved',
      timestamp: '2024-10-08 08:00 AM',
    },
    {
      id: 6,
      type: 'Info',
      message: 'Daily performance metrics generated.',
      status: 'Resolved',
      timestamp: '2024-10-07 04:00 PM',
    },
    {
      id: 7,
      type: 'Warning',
      message: 'Sensor calibration required for Unit D.',
      status: 'Resolved',
      timestamp: '2024-10-06 02:00 PM',
    },
  ];

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Calculate the total number of pages
  const totalPages = Math.ceil(alertHistoryData.length / itemsPerPage);

  // Get current alerts for the page
  const indexOfLastAlert = currentPage * itemsPerPage;
  const indexOfFirstAlert = indexOfLastAlert - itemsPerPage;
  const currentAlerts = alertHistoryData.slice(indexOfFirstAlert, indexOfLastAlert);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen">

      {/* Alerts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {alertsData.map((alert) => (
          <div
            key={alert.id}
            className={`alert-card bg-white rounded-lg p-6 flex flex-col mb-4 ${
              alert.status === 'Active' ? 'border-l-4 border-yellow-500' : alert.status === 'Critical' ? 'border-l-4 border-red-500' : 'border-l-4 border-green-500'
            }`}
          >
            <div className="flex items-center mb-2">
              <FontAwesomeIcon icon={alert.icon} className={`text-3xl ${alert.status === 'Active' ? 'text-yellow-600' : alert.status === 'Critical' ? 'text-red-600' : 'text-green-600'}`} />
              <h2 className="text-xl font-semibold ml-2">{alert.type}</h2>
            </div>
            <p className="text-lg">{alert.message}</p>
            <p className="text-sm text-gray-600 mt-2">Status: {alert.status}</p>
            <p className="text-sm text-gray-500">{alert.timestamp}</p>
          </div>
        ))}
      </div>

      {/* Alerts History Table */}
      <div className="bg-white shadow-lg rounded-lg mt-8 p-4">
        <h2 className="text-xl font-semibold mb-4">Alerts History</h2>
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4 text-left">Type</th>
              <th className="py-2 px-4 text-left">Message</th>
              <th className="py-2 px-4 text-left">Status</th>
              <th className="py-2 px-4 text-left">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {currentAlerts.map((alert) => (
              <tr key={alert.id} className="border-b hover:bg-gray-100">
                <td className="py-2 px-4">{alert.type}</td>
                <td className="py-2 px-4">{alert.message}</td>
                <td className="py-2 px-4">{alert.status}</td>
                <td className="py-2 px-4">{alert.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-center mt-4">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => paginate(index + 1)}
              className={`mx-1 px-3 py-1 rounded-md ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlertsOverview;
