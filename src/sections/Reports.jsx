import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Reports = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [reportType, setReportType] = useState('Energy Consumption');

  // Sample data for reports
  const reportData = [
    {
      id: 1,
      date: '2024-10-01',
      type: 'Energy Consumption',
      value: '1500 kWh',
    },
    {
      id: 2,
      date: '2024-10-02',
      type: 'Energy Consumption',
      value: '1600 kWh',
    },
    {
      id: 3,
      date: '2024-10-03',
      type: 'Peak Demand',
      value: '320 kW',
    },
    {
      id: 4,
      date: '2024-10-04',
      type: 'Energy Consumption',
      value: '1400 kWh',
    },
    {
      id: 5,
      date: '2024-10-05',
      type: 'Peak Demand',
      value: '330 kW',
    },
  ];

  const filteredReports = reportData.filter(report => {
    const reportDate = new Date(report.date);
    return reportDate >= startDate && reportDate <= endDate && report.type === reportType;
  });

  return (
    <div className="min-h-screen bg-gray-100 p-5">
      {/* Parent Card Container */}
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-semibold text-gray-800 mb-10 text-center">Reports</h1>

        {/* Report Type Selector */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex items-center">
            <label className="text-lg font-medium text-gray-700 mr-2">Select Report Type:</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="border border-gray-300 p-3 rounded-lg shadow-sm text-gray-700 focus:outline-none"
            >
              <option value="Energy Consumption">Energy Consumption</option>
              <option value="Peak Demand">Peak Demand</option>
              <option value="Cost Analysis">Cost Analysis</option>
            </select>
          </div>
        </div>

        {/* Date Range Picker */}
        <div className="flex gap-6 mb-6">
          <div className="flex flex-col">
            <label className="text-lg font-medium text-gray-700 mb-2">Start Date:</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              className="border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-lg font-medium text-gray-700 mb-2">End Date:</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              className="border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none"
            />
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white shadow-sm rounded-lg p-6 mt-6 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Filtered Reports</h2>
          <table className="min-w-full table-auto text-gray-800">
            <thead>
              <tr className="border-b">
                <th className="py-3 px-6 text-left text-gray-600">Date</th>
                <th className="py-3 px-6 text-left text-gray-600">Report Type</th>
                <th className="py-3 px-6 text-left text-gray-600">Value</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <tr key={report.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-6">{report.date}</td>
                    <td className="py-3 px-6">{report.type}</td>
                    <td className="py-3 px-6">{report.value}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-3 px-6 text-center text-gray-500" colSpan="3">
                    No reports found for selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Download Reports Button */}
        <div className="flex justify-center mt-6">
          <button className="border border-gray-300 text-gray-700 font-medium px-6 py-3 rounded-lg shadow-sm hover:bg-gray-100 focus:outline-none transition duration-200">
            Download Reports
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
