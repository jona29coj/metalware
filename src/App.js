import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Profile from './sections/Profile';
import Files from './sections/Files';
import BuildingOverview from './sections/Monitor/BuildingOverview';
import Diesel from './sections/Monitor/Diesel';
import Zones from './sections/Monitor/Zones';
import Emd from './dcomponents/Emd';
import Dgd from './dcomponents/Dgd';
import EDashboard from './sections/Dashboard/EDashboard';
import IOEBatteryControl from './sections/IOEBattery';
import LTOControl from './sections/LTOControl';
import UPSControl from './sections/UPSControl';
import Settings from './sections/Settings';
import { DateProvider } from './contexts/DateContext';
import PeakDemandView from './components/PeakDemandView';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 1024);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const authCookie = Cookies.get('auth');
    if (authCookie === 'true') {
      setIsAuthenticated(true);
    } else {
      window.location.href = 'https://elementsenergies.com/login';
    }
  }, []);  

  useEffect(() => {
    const handleResize = () => {
      setIsCollapsed(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
    setRefreshKey((prevKey) => prevKey + 1);
  };

  console.log(` Cookies Value : ${document.cookie}`);

  return (
    <DateProvider>
      <BrowserRouter>
        <ScrollToTop />
        {isAuthenticated &&( 
          <div className="bg-main-bg min-h-screen flex">
            {/* Sidebar */}
            <div
              className={`bg-white shadow-md transition-all duration-300 fixed top-0 left-0 h-full ${
                isCollapsed ? 'w-[9%]' : 'w-[15.5%]'
              }`}
              style={{ zIndex: 50 }}
            >
              <Sidebar isCollapsed={isCollapsed} setIsCollapsed={toggleSidebar} />
            </div>

            {/* Navbar */}
            <div
              className={`fixed top-0 transition-all duration-300 ${
                isCollapsed ? 'left-[9%] w-[91%]' : 'left-[15.5%] w-[84.5%]'
              }`}
              style={{ zIndex: 40 }}
            >
              <Navbar isCollapsed={isCollapsed} setIsCollapsed={toggleSidebar} />
            </div>

            {/* Main Content */}
            <div
              key={refreshKey}
              className={`flex-1 flex flex-col min-h-screen overflow-hidden max-w-full transition-all duration-300 ${
                isCollapsed ? 'ml-[9%]' : 'ml-[15.5%]'
              }`}
            >
              <div className="flex-1 overflow-auto max-w-full mt-[52px]">
                <Routes>
                  <Route path="/dashboard" element={<EDashboard />} />
                  <Route path="/" element={<EDashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/files" element={<Files />} />
                  <Route path="/monitor/overview" element={<BuildingOverview />} />
                  <Route path="/monitor/zones" element={<Zones />} />
                  <Route path="/monitor/diesel" element={<Diesel />} />
                  <Route path="/meter/:id" element={<Emd />} />
                  <Route path="/control/ltobattery" element={<LTOControl />} />
                  <Route path="/control/ioebattery" element={<IOEBatteryControl />} />
                  <Route path="/control/upsbattery" element={<UPSControl />} />
                  <Route path="/generator/:id" element={<Dgd />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/alerts" element={<PeakDemandView />} />
                </Routes>
              </div>
            </div>
          </div>
         )}
      </BrowserRouter>
    </DateProvider>
  );
};

export default App;
