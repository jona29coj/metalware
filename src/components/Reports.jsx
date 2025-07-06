import React, { useEffect, useState } from 'react';

const Reports = () => {
  const [fileInfo, setFileInfo] = useState(null);
  const [error, setError] = useState(null);
  const fileUrl = "http://localhost:3001/reports/Meter_Report_June_2025.xlsx";

  useEffect(() => {
    const fetchFileMetadata = async () => {
      try {
        const res = await fetch(fileUrl, { method: 'HEAD' });
        if (!res.ok) throw new Error('File not found');

        const contentLength = res.headers.get("Content-Length");
        const lastModified = res.headers.get("Last-Modified");

        setFileInfo({
          size: contentLength,
          lastModified,
          name: "Metalware_Report_June_2025.xlsx",
        });
      } catch (err) {
        console.error("Error fetching file info:", err);
        setError("Report file not found or server unavailable.");
      }
    };

    fetchFileMetadata();
  }, [fileUrl]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4 text-center">Monthly Energy Report</h2>

      {error && <p className="text-red-600">{error}</p>}

      {fileInfo && (
        <div className="bg-white p-4 rounded shadow w-fit">
          <p><strong>File:</strong> {fileInfo.name}</p>
          <a 
            href={fileUrl} 
            download 
            className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            ⬇️ Download Report
          </a>
        </div>
      )}
    </div>
  );
};

export default Reports;
