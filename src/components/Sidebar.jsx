import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { FiMonitor, FiAlertCircle, FiFileText, FiHome, FiBook, FiUser, FiSettings } from "react-icons/fi";
import logo from "../logo2.png";

const links = {
  monitor: [
    { name: "Building Overview", path: "/monitor/overview" },
    { name: "Zones", path: "/monitor/zones" },
  ],
};

const navItems = [
  { name: "Alerts", path: "/alerts", icon: FiAlertCircle },
  { name: "Building Profile", path: "/profile", icon: FiUser },
  { name: "Settings", path: "/settings", icon: FiSettings }, // Add the Settings tab here
];

const Sidebar = ({ isCollapsed }) => {
  const [dropdown, setDropdown] = useState({ monitor: false });
  const location = useLocation();
  const sidebarRef = useRef(null);

  const linkClass = (isActive, isCollapsed) =>
    `flex items-center gap-5 p-2 rounded-lg text-md m-2 transition-all duration-300 ${
      isActive ? "bg-green-600 text-white shadow" : "text-gray-700 hover:bg-green-500 hover:text-white"
    } ${isCollapsed ? "justify-center" : ""}`;

  const toggleDropdown = (section) => {
    setDropdown((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const closeAllDropdowns = () => {
    setDropdown({ monitor: false });
  };

  useEffect(() => {
    closeAllDropdowns();
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isCollapsed && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        closeAllDropdowns();
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isCollapsed]);

  const handleNavLinkClick = () => {
    closeAllDropdowns();
  };

  return (
    <div ref={sidebarRef} className="h-full w-full overflow-visible bg-white shadow-lg transition-all duration-300 flex flex-col relative">
      {/* Logo */}
      <div className="flex justify-center items-center bg-white p-5">
        <Link to="/dashboard">
          <img src={logo} alt="logo" className="h-auto w-auto object-contain min-w-[49px]" />
        </Link>
      </div>

      {/* Sidebar Links */}
      <div className="mt-8 flex flex-col w-full">
        {/* Dashboard */}
        <NavLink to="/dashboard" className={({ isActive }) => linkClass(isActive, isCollapsed)}>
          <FiHome className="text-xl mx-auto lg:mx-0" />
          <span className={`${isCollapsed ? "hidden" : "block"}`}>Dashboard</span>
        </NavLink>

        {/* Monitor Section */}
        <div className="relative">
          <div
            className={`cursor-pointer ${linkClass(false, isCollapsed)} relative`}
            onClick={() => toggleDropdown("monitor")}
          >
            <div className="flex items-center gap-5">
              <FiMonitor className="text-xl mx-auto lg:mx-0" />
              {!isCollapsed && <span>Monitor</span>}
              {!isCollapsed && (dropdown.monitor ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />)}
            </div>
          </div>

          {/* Dropdown when expanded */}
          {!isCollapsed && dropdown.monitor && (
            <div className="ml-6 mt-2 flex flex-col">
              {links.monitor.map((item, index) => (
                <NavLink
                  key={index}
                  to={item.path}
                  className={({ isActive }) =>
                    `block py-2 px-4 rounded transition-all duration-300 ${
                      isActive ? "text-white bg-green-600" : "text-gray-600 hover:bg-green-500 hover:text-white"
                    }`
                  }
                  onClick={handleNavLinkClick}
                >
                  {item.name}
                </NavLink>
              ))}
            </div>
          )}

          {/* Tooltip when collapsed */}
          {isCollapsed && dropdown.monitor && (
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 bg-white shadow-xl rounded-lg w-48 p-2 z-[99999] border border-gray-300">
              {/* Arrow pointing to the Monitor button */}
              <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent border-r-gray-300"></div>

              {links.monitor.map((item, index) => (
                <NavLink
                  key={index}
                  to={item.path}
                  className={({ isActive }) =>
                    `block py-2 px-4 rounded transition-all duration-300 ${
                      isActive ? "text-white bg-green-600" : "text-gray-600 hover:bg-green-500 hover:text-white"
                    }`
                  }
                  onClick={handleNavLinkClick}
                >
                  {item.name}
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Other nav items */}
        {navItems.map(({ name, path, icon: Icon }, index) => (
          <NavLink key={index} to={path} className={({ isActive }) => linkClass(isActive, isCollapsed)}>
            <Icon className="text-xl mx-auto lg:mx-0" />
            {!isCollapsed && <span>{name}</span>}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;