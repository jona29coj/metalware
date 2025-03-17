import React, { useState } from 'react'

const Files = () => {
  const [file, setFile] = useState(null)

  const handleFileChange = (event) => {
    setFile(event.target.files[0])
  }

  return (
    <div className="flex justify-center items-center h-[92vh] bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-center text-2xl font-bold mb-4">Upload File</h2>
        
        <div className="flex justify-center items-center border-2 border-dashed border-gray-300 p-6 rounded-lg mb-4">
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="text-center text-gray-600 cursor-pointer"
          >
            {file ? file.name : 'Click or drag to upload'}
          </label>
        </div>

        {file && (
          <div className="text-center text-gray-600">
            <p className="text-sm">File selected: {file.name}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Files
