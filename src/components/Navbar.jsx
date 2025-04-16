import React, { useState, useEffect, useRef, useContext } from 'react';
import { FaBell } from 'react-icons/fa';
import userprofile from "../components/userprofile.png";
import moment from 'moment-timezone';
import { DateContext } from '../contexts/DateContext';
import Cookies from 'js-cookie'; // Import the js-cookie library

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  const datePickerRef = useRef(null);

  const { selectedDate, handleDateChange } = useContext(DateContext);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current && !profileRef.current.contains(event.target) &&
        notificationRef.current && !notificationRef.current.contains(event.target) &&
        datePickerRef.current && !datePickerRef.current.contains(event.target)
      ) {
        setShowProfileDropdown(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const currentDateTime = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
      const response = await fetch(`https://mw.elementsenergies.com/api/apd?date=${selectedDate}&currentDateTime=${currentDateTime}`);
      const data = await response.json();

      if (data?.peakDemandAboveThreshold) {
        const formatted = data.peakDemandAboveThreshold.map((entry, idx) => {
          const time = moment(entry.minute).format("HH:mm");
          return {
            id: entry.id,
            text: `Apparent Power → ${entry.total_kVA} kVA ${time} crossing 558.75 → Lower Ceiling`,
            read: false,
          };
        });
        setNotifications(formatted);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchNotifications();
    }
  }, [selectedDate]);

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

  const handleDateInputChange = (e) => {
    handleDateChange(e.target.value);
  };

  const handleLogout = () => {
    // Delete the 'auth' cookie
    Cookies.remove('auth', { domain: '.elementsenergies.com', path: '/' });

    // Redirect the user to the login page
    window.location.href = 'https://elementsenergies.com/login';
  };

  return (
    <div className={`transition-all bg-white shadow-md py-1 px-3 ${isScrolled ? 'shadow-lg' : ''} duration-300 w-full`}>
      <div className="flex items-center justify-end flex-wrap">
        <div className="flex items-center space-x-4">
          <div className="relative flex items-center" ref={datePickerRef}>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateInputChange}
              className="pl-2 pr-2 py-1 border border-gray-300 rounded-md text-sm"
              max={moment().tz('Asia/Kolkata').format('YYYY-MM-DD')}
            />
          </div>

          <div className="relative" ref={notificationRef}>
            <div className="relative cursor-pointer" onClick={toggleNotifications}>
              <FaBell className="text-gray-600 text-xl hover:text-blue-500" />
              {hasUnread && (
                <span className="absolute -top-1 -right-1 bg-red-500 w-2 h-2 rounded-full"></span>
              )}
            </div>

            {showNotifications && (
              <div className="absolute right-[-60px] mt-5 w-72 bg-white shadow-lg rounded-lg py-3 z-50">
                <p className="px-4 py-2 text-sm font-semibold text-gray-800">Notifications</p>
                <div className="max-h-48 overflow-y-auto custom-scrollbar">
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
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <div className="flex items-center space-x-2 cursor-pointer" onClick={toggleProfileDropdown}>
              <img src={userprofile} alt="User" className="w-10 h-10 rounded-full" />
            </div>
            {showProfileDropdown && (
              <div className="absolute right-0 mt-3 w-48 bg-white shadow-lg rounded-lg py-4 z-50">
                <div className="flex flex-col items-center">
                  <img src={userprofile} alt="Profile" className="w-14 h-14 rounded-full mb-2" />
                  <p className="text-gray-800 font-medium">Hi, Admin</p>
                  <p className="text-xs text-gray-500">
                    {moment().tz('Asia/Kolkata').format('DD MMM, h:mm A')}
                  </p>
                </div>
                <hr className="my-2" />
                <p className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100">Help</p>
                <p
                  className="px-4 py-2 text-sm text-red-500 cursor-pointer hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  Log Out
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

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