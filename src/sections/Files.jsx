import React, { useState } from 'react'
import { FaFilePdf, FaTrash, FaDownload } from 'react-icons/fa'

const Files = () => {
  const [selectedCategory, setSelectedCategory] = useState("Energy Bills")
  const [energyBills, setEnergyBills] = useState([])
  const [manuals, setManuals] = useState([])
  const [miscellaneous, setMiscellaneous] = useState([])

  const handleFileChange = (event, setType) => {
    const file = event.target.files[0]
    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed.")
      return
    }
    setType(prevFiles => [...prevFiles, { name: file.name, date: new Date().toLocaleDateString(), url: URL.createObjectURL(file) }])
  }

  const handleRemoveFile = (index, setType) => {
    setType(prevFiles => prevFiles.filter((_, i) => i !== index))
  }

  const renderTable = (files, setType) => (
    <div className="w-full">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full mb-4">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2 w-1/12">S No.</th>
              <th className="border p-2 w-7/12">File Name</th>
              <th className="border p-2 w-2/12">Date Uploaded</th>
              <th className="border p-2 w-2/12">Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.length === 0 ? (
              <tr>
                <td className="border p-2 text-center" colSpan="4">No files uploaded</td>
              </tr>
            ) : (
              files.map((file, index) => (
                <tr key={index}>
                  <td className="border p-2 text-center">{index + 1}</td>
                  <td className="border p-2 flex items-center">
                    <FaFilePdf className="mr-2 text-red-600" />
                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                      {file.name.replace(/\.[^/.]+$/, "")}
                    </a>
                  </td>
                  <td className="border p-2 text-center">{file.date}</td>
                  <td className="border p-2 text-center">
                    <div className="flex justify-center space-x-9">
                      <a href={file.url} download className="text-blue-600">
                        <FaDownload />
                      </a>
                      <button onClick={() => handleRemoveFile(index, setType)} className="text-red-500">
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center items-center mt-4">
        <div className="bg-white p-10 rounded-lg shadow-lg">
          <input
            type="file"
            accept="application/pdf"
            onChange={(event) => handleFileChange(event, setType)}
            className="hidden"
            id={selectedCategory.toLowerCase().replace(' ', '-') + '-upload'}
          />
          <label
            htmlFor={selectedCategory.toLowerCase().replace(' ', '-') + '-upload'}
            className="text-center text-gray-600 cursor-pointer border-2 border-dashed border-gray-300 p-6 rounded-lg"
          >
            Click or drag to upload
          </label>
        </div>
      </div>
    </div>
  )

  const getCurrentFiles = () => {
    if (selectedCategory === "Energy Bills") return energyBills
    if (selectedCategory === "Manuals") return manuals
    if (selectedCategory === "Miscellaneous") return miscellaneous
  }

  const getCurrentSetType = () => {
    if (selectedCategory === "Energy Bills") return setEnergyBills
    if (selectedCategory === "Manuals") return setManuals
    if (selectedCategory === "Miscellaneous") return setMiscellaneous
  }

  return (
    <div className="flex flex-col items-center h-[92vh] bg-gray-100 p-6">
      <div className="flex items-center mb-6 w-full max-w-6xl">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="p-2 border rounded-lg pr-5"
        >
          <option>Energy Bills</option>
          <option>Manuals</option>
          <option>Miscellaneous</option>
        </select>
        <div className="ml-4">
          <span className="text-gray-600">Files Uploaded: {getCurrentFiles().length}</span>
        </div>
      </div>
      {renderTable(getCurrentFiles(), getCurrentSetType())}
    </div>
  )
}

export default Files