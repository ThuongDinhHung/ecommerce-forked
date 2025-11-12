import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { 
        FaSearch, FaChevronDown, FaBars, FaTimes,
    FaUser,         // Added for dropdown
    FaCog,          // Added for dropdown
    FaSignOutAlt,    // Added for dropdown
    FaShoppingCart
    } from 'react-icons/fa';
// --- React Icons ---

const SearchIcon = () => <FaSearch />;

const ChevronDownIcon = () => <FaChevronDown />;

const BarsIcon = () => <FaBars />;

const TimesIcon = () => <FaTimes />;


// --- Navigation Items ---
const defaultHeaderList = [
    { title: "Home", path: "/home" },
    { title: "Courses", path: "/courses" },
    { title: "Sessions", path: "/sessions" },
]
const coordinatorHeaderList = [
    { title: "Analyze Data", path: "/analyze" },
    { title: "Optimize Resources", path: "/optimize" },
    { title: "Awarding", path: "/awarding" },
]
// File: src/components/header/Header.jsx

import { Link } from 'react-router-dom'; // Import Link for navigation
import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import logoImage from '../../assets/logoBKBay.png'; // Corrected path assumption

export default function Header() {
  const [userAvatar, setUserAvatar] = useState('https://via.placeholder.com/36'); // Default placeholder
  
  // Use useEffect to fetch the random user image once when the component mounts
  useEffect(() => {
    // We will fetch a female avatar for Alice Smith
    fetch('https://randomuser.me/api/?gender=female&inc=picture') // Only include picture data
      .then(response => response.json())
      .then(data => {
        if (data.results && data.results.length > 0) {
          setUserAvatar(data.results[0].picture.thumbnail); // Use 'thumbnail' for small size
        }
      })
      .catch(error => {
        console.error("Error fetching random user avatar:", error);
        // Fallback to placeholder if fetch fails
        setUserAvatar('https://via.placeholder.com/36'); 
      });
  }, []); // Empty dependency array means this runs once on mount
  return (
    <header className="bg-white shadow-sm py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* Logo and App Name */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-gray-900">
            <img src={logoImage} alt="BK BAY Logo" className="h-20 w-20" /> {/* Use your logo */}
            <span>BK BAY</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex space-x-8">
          <Link to="/" className="text-gray-600 hover:text-[var(--color-primary)] font-medium">Home</Link>
          <Link to="/dashboard" className="text-gray-600 hover:text-[var(--color-primary)] font-medium">Dashboard</Link>
          <Link to="/user" className="text-gray-600 hover:text-[var(--color-primary)] font-medium">User</Link>
          {/* Add more navigation links as needed */}
          <Link to="/shipper-details" className="text-gray-600 hover:text-[var(--color-primary)] font-medium">Shipper Details</Link>
          <Link to="/seller-report" className="text-gray-600 hover:text-[var(--color-primary)] font-medium">Seller Report</Link>
        </nav>

        {/* 5. Mobile Menu (Dropdown) */}
        {/* Shown only on small screens (md:hidden) and when isMobileMenuOpen is true */}
        <div 
            className={`
                md:hidden absolute top-full left-0 w-full bg-primary shadow-lg px-4 pt-2 pb-4 space-y-4
                transition-all duration-300 ease-in-out z-10
                ${isMobileMenuOpen 
                    ? 'opacity-100 translate-y-0 pointer-events-auto' 
                    : 'opacity-0 -translate-y-60 pointer-events-none'
                }
            `}
        >
            
            {/* Mobile Nav Links */}
            <div className="flex flex-col space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.title}
                        to={item.path}
                        className={mobileLinkClassName}
                        onClick={() => setIsMobileMenuOpen(false)} // Close menu on click
                    >
                        {item.title}
                    </NavLink>
                ))}
            </div>
            
            {/* Divider */}
            <div className="border-t border-cyan-600 my-4"></div>

            {/* Mobile Controls */}
            <div className="flex items-center justify-between space-x-4">
                {/* Language Selector */}
                <button className="flex items-center text-sm hover:text-cyan-100 transition-colors">
                    <span>En</span>
                    <ChevronDownIcon />
                </button>

                {/* Search Button */}
                <button className="hover:text-cyan-100 transition-colors">
                    <span className="sr-only">Search</span>
                    <SearchIcon />
                </button>

                {/* User Avatar */}
                <button className="shrink-0 cursor-pointer flex items-center space-x-2"
                        onClick={() => setShowUserMenu(!showUserMenu)}
                >
                    <img
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-white"
                    src="https://placehold.co/40x40/E2E8F0/A0AEC0?text=User"
                    alt="User avatar"
                    />
                    <span className="text-sm">My Account</span>
                </button>
            </div>
        </div>
        {showUserMenu && (
            <div className="absolute right-4 mt-2 w-52 bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden z-50">
                <ul className="py-1 text-sm text-gray-700">
                    {/* Welcome message (Static) */}
                    <li className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                        Welcome, User!
                    </li>
                    
                    {/* Placeholder Links */}
                    <li>
                        <Link
                            to="/profile"
                            onClick={() => setShowUserMenu(false)} // Close menu on click
                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left"
                        >
                            <FaUser className="h-5 w-5" /> Profile
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/settings" // Changed from /admin
                            onClick={() => setShowUserMenu(false)} // Close menu on click
                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left"
                        >
                            <FaCog className="h-5 w-5" /> Settings
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/cart" // Changed from /admin
                            onClick={() => setShowUserMenu(false)} // Close menu on click
                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left"
                        >
                            <FaShoppingCart className="h-5 w-5" /> My Cart
                        </Link>
                    </li>

                    {/* Logout button (Static) */}
                    <li className="border-t border-gray-200 mt-1 pt-1">
                        <button
                            onClick={() => {
                                // Add your logout logic here
                                setShowUserMenu(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 w-full text-left text-red-600 hover:text-red-700"
                        >
                            <FaSignOutAlt className="h-5 w-5" /> Log Out
                        </button>
                    </li>
                </ul>
            </div>
        )}
        {/* User Profile */}
        <div className="flex items-center space-x-3">
          <span className="text-gray-700 font-medium">Alice Smith</span>
          <img
            className="h-9 w-9 rounded-full"
            src={userAvatar} // Replace with a real user avatar
            alt="User avatar"
          />
        </div>
      </div>
    </header>
  );
}