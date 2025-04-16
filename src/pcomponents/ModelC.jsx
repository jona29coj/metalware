import React, { useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import modelImage from '../sections/pictures/compressed.jpg';

const CombinedComponent = () => {
  const [showInfo, setShowInfo] = useState(false);

  const handleInfoClick = () => {
    setShowInfo(!showInfo);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-8 ">
      <h1 className="text-2xl font-bold text-center text-black pb-7">Facility Information</h1>
      <div className="grid lg:grid-cols-1 xl:grid-cols-2 gap-4 items-center w-full ">
        <div className="p-6 bg-white rounded-lg flex flex-col gap-[10px] items-center h-[100%]"> 
          <div className='flex aling-center justify-center pt-5'>
            <img src={modelImage} alt="Metalware Model" className="md:w-[auto] md:h-[30vmin] lg:w-[auto] lg:h-[30vmin] xl:h-[60vmin]"/>
          </div>
        </div>

        <div className="text-start grid grid-cols-2 gap-4">
          <div className="lg:text-sm xl:text-md font-bold text-gray-500 border-r-2 border-gray space-y-3 ">
            <p>Company Name:</p>
            <p>Building Type:</p>
            <p>Nature of Operations:</p>
            <p>Address:</p>
            <p>Carpet Area:</p>
            <p>Number of Blocks:</p>
            <p>Number of floors per block:</p>
            <p>‎</p>
            <p>Operating Hours:</p>
            <p>‎</p>
            <p>Non-operating Hours:</p>
            <p>Number of Occupants:</p>
            <p>‎</p>
            <p>Number of Zones:</p>
          </div>
          <div className="lg:text-sm xl:text-md text-gray-600 space-y-3 pl-2 ">
            <p>METALWARE CORPORATION</p>
            <p>Industrial</p>
            <p>Metal Processing Industry</p>
            <p>C-49-50, Sector-63, Noida-201307</p>
            <p>45,000 sq.ft</p>
            <p>2 nos. (C49 & C50)</p>
            <p>C49 - B+6</p>
            <p>C50 - B+4</p>
            <p>Weekdays (Mon - Sat) - 20 hours</p>
            <p>Weekend (Sun) - 7 hours</p>
            <p>3.5 hours (for maintenance)</p>
            <p>Day Shift - 275</p>
            <p>Night Shift - 175</p>
            <p>10 Zones</p>
          </div>
        </div>

        {/* Flex container for Visual and Buttons */}
        <div className="flex items-center justify-center md:w-[100%] md:h-[40%] lg:w-[auto] lg:h-[80%] space-x-8">
          {/* Right Section (Button and Info Icon side by side) */}
          {/* <div className="flex items-center space-x-1">
            <button className="bg-gray-800 text-white px-6 py-3 rounded-md hover:bg-gray-700 text-sm w-32">
              CONNECT
            </button>

            <div className="relative">
              <button
                onClick={handleInfoClick}
                className="text-gray-600 hover:text-gray-800"
              >
                <FaInfoCircle size={24} />
              </button>

              {showInfo && (
                <div className="absolute bottom-12 left-1/12 transform -translate-x-1/2 bg-gray-700 text-white text-sm rounded-md p-1 w-64 text-center">
                  <p>
                    You can reach out to us for any help or improvements regarding the building's performance and efficiency.
                  </p>
                </div>
              )}
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default CombinedComponent;