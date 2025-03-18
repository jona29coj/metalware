import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaSearch } from 'react-icons/fa';
import userprofile from "../components/userprofile.png";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "New ticket assigned to you", read: false },
    { id: 2, text: "System update scheduled at 3 PM", read: false },
    { id: 3, text: "Reminder: Meeting at 2 PM", read: true },
    { id: 4, text: "Server maintenance completed", read: true },
    { id: 5, text: "New user registered", read: false }, // New notification added
  ]);

  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current && !profileRef.current.contains(event.target) &&
        notificationRef.current && !notificationRef.current.contains(event.target)
      ) {
        setShowProfileDropdown(false);
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasUnread = notifications.some(n => !n.read);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowProfileDropdown(false);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
    setShowNotifications(false);
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  return (
    <div className={`transition-all bg-white shadow-md py-1 px-3 ${isScrolled ? 'shadow-lg' : ''} duration-300 w-full`}>
      <div className="flex items-center justify-between flex-wrap">
        
        {/* Search Bar */}
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Search..."
            className="px-3 py-1 w-60 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 pr-10"
          />
          <FaSearch className="absolute right-3 text-gray-500 text-sm cursor-pointer" />
        </div>

        {/* Notification & Profile Section */}
        <div className="flex items-center space-x-4">
          
          {/* Notification Icon with Badge */}
          <div className="relative" ref={notificationRef}>
            <div 
              className="relative cursor-pointer"
              onClick={toggleNotifications}
            >
              <FaBell className="text-gray-600 text-xl hover:text-blue-500" />
              {hasUnread && (
                <span className="absolute -top-1 -right-1 bg-red-500 w-2 h-2 rounded-full"></span>
              )}
            </div>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-[-60px] mt-5 w-64 bg-white shadow-lg rounded-lg py-3">
                <p className="px-4 py-2 text-sm font-semibold text-gray-800">Notifications</p>
                <div className="max-h-40 overflow-y-auto custom-scrollbar">
                  {notifications.map((notif) => (
                    <p
                      key={notif.id}
                      className={`px-4 py-2 text-sm cursor-pointer ${notif.read ? "text-gray-500" : "text-black font-medium"}`}
                      onClick={() => markAsRead(notif.id)}
                    >
                      {notif.text}
                    </p>
                  ))}
                </div>
                <p className="px-4 py-2 text-xs text-blue-500 cursor-pointer hover:underline text-right">
                  Previous
                </p>
              </div>
            )}
          </div>

          {/* Profile Section */}
          <div className="relative" ref={profileRef}>
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={toggleProfileDropdown}
            >
              <img src={userprofile} alt="User" className="w-10 h-10 rounded-full" />
            </div>

            {/* Profile Dropdown */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-3 w-48 bg-white shadow-lg rounded-lg py-4">
                {/* Profile Picture & Greeting */}
                <div className="flex flex-col items-center">
                  <img src={userprofile} alt="Profile" className="w-14 h-14 rounded-full mb-2" />
                  <p className="text-gray-800 font-medium">Hi, Admin</p>
                </div>
                <hr className="my-2" />
                {/* Help Option */}
                <p className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100">
                  Help
                </p>
                {/* Log-Out Option */}
                <p className="px-4 py-2 text-sm text-red-500 cursor-pointer hover:bg-gray-100">
                  Log Out
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Custom Scrollbar CSS */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #c0c0c0;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #a0a0a0;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
};

export default Navbar;
