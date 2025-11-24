// File: src/components/header/Header.jsx

// --- FIX 1: Add all missing imports ---
import React, { useState, useEffect } from 'react'; 
import { Link, NavLink } from 'react-router-dom';
import { 
    FaSearch, FaChevronDown, FaBars, FaTimes,
    FaUser, FaCog, FaSignOutAlt, FaShoppingCart 
} from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import logoImage from '../../assets/logoBKBay.png'; // Assuming this path is correct

// --- FIX 2: Define navItems. We'll make them match the desktop nav. ---
const navItems = [
    { title: "Home", path: "/" },
    { title: "Shop", path: "/products" },
    { title: "Dashboard", path: "/dashboard" },
    { title: "User", path: "/user" },
    { title: "Shipper Details", path: "/shipper-details" },
    { title: "Seller Report", path: "/seller-report" },
];

export default function Header() {
    const { cartItemCount } = useCart();
    const [userAvatar, setUserAvatar] = useState('https://via.placeholder.com/36');
    
    // --- FIX 3: Define missing state ---
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    // --- FIX 4: Define missing link class function for mobile ---
    // This uses Tailwind classes. 'bg-secondary' must be defined in your index.css
    const mobileLinkClassName = ({ isActive }) =>
        `block text-base font-bold uppercase tracking-wider hover:bg-secondary transition-colors px-3 py-2 rounded-md ${
            isActive ? "bg-secondary text-white" : "text-gray-900" // Adjusted for white mobile bg
        }`;

    // This useEffect is fine, just needed the import
    useEffect(() => {
        fetch('https://randomuser.me/api/?gender=female&inc=picture')
            .then(response => response.json())
            .then(data => {
                if (data.results && data.results.length > 0) {
                    setUserAvatar(data.results[0].picture.thumbnail);
                }
            })
            .catch(error => {
                console.error("Error fetching random user avatar:", error);
                setUserAvatar('https://via.placeholder.com/36'); 
            });
    }, []); // Empty dependency array means this runs once on mount

    return (
        // --- FIX 5: Add 'relative' to header for absolute menus ---
        <header className="bg-white shadow-sm py-4 relative z-20"> 
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                
                {/* Logo and App Name */}
                <div className="flex items-center">
                    <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-gray-900">
                        <img src={logoImage} alt="BK BAY Logo" className="h-20 w-20" /> {/* Use your logo */}
                        <span>BK BAY</span>
                    </Link>
                </div>

                {/* Navigation Links (Desktop) */}
                <nav className="hidden md:flex space-x-8">
                    {/* Using the navItems array for desktop nav for consistency */}
                    {navItems.map((item) => (
                        <Link 
                            key={item.title} 
                            to={item.path} 
                            className="text-gray-600 hover:text-[var(--color-primary)] font-medium"
                        >
                            {item.title}
                        </Link>
                    ))}
                </nav>

                {/* User Profile & Menu (Desktop) */}
                <div className="hidden md:flex items-center space-x-3 relative">
                    <span className="text-gray-700 font-medium">Alice Smith</span>
                    <img
                        className="h-9 w-9 rounded-full cursor-pointer"
                        src={userAvatar}
                        alt="User avatar"
                        onClick={() => setShowUserMenu(!showUserMenu)} // Add click handler
                    />
                    
                    {/* --- USER MENU DROPDOWN (DESKTOP) --- */}
                    {showUserMenu && (
                        <div className="absolute top-full right-0 mt-2 w-52 bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden z-50">
                            <ul className="py-1 text-sm text-gray-700">
                                <li className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                                    Welcome, User!
                                </li>
                                <li>
                                    <Link
                                        to="/profile"
                                        onClick={() => setShowUserMenu(false)}
                                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left"
                                    >
                                        <FaUser className="h-5 w-5" /> Profile
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/settings"
                                        onClick={() => setShowUserMenu(false)}
                                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left"
                                    >
                                        <FaCog className="h-5 w-5" /> Settings
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/cart"
                                        onClick={() => setShowUserMenu(false)}
                                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left"
                                    >
                                        <FaShoppingCart className="h-5 w-5" /> My Cart {cartItemCount > 0 && `(${cartItemCount})`}
                                    </Link>
                                </li>
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
                </div>

                {/* --- FIX 6: Add Mobile Burger Icon (it was missing) --- */}
                <div className="md:hidden flex items-center">
                     <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="text-gray-900 p-2 rounded-md" // Text color changed for white bg
                        aria-label="Toggle menu"
                     >
                        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
                     </button>
                </div>

            </div> {/* End of max-w-7xl div */}

            {/* --- 5. Mobile Menu (Dropdown) --- */}
            {/* This code was copied from the *other* file, now it's fixed */}
            <div 
                className={`
                    md:hidden absolute top-full left-0 w-full bg-white shadow-lg px-4 pt-2 pb-4 space-y-4
                    transition-all duration-300 ease-in-out z-10
                    ${isMobileMenuOpen 
                        ? 'opacity-100 translate-y-0 pointer-events-auto' 
                        : 'opacity-0 -translate-y-60 pointer-events-none'
                    }
                `}
            >
                {/* Mobile Nav Links */}
                <div className="flex flex-col space-y-2">
                    {navItems.map((item) => ( // Using the *new* consistent navItems
                        <NavLink
                            key={item.title}
                            to={item.path}
                            // Using a simpler class for white background
                            className={({ isActive }) =>
                                `block text-base font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors px-3 py-2 rounded-md ${
                                    isActive ? "bg-gray-200 text-blue-700" : "text-gray-900"
                                }`
                            }
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {item.title}
                        </NavLink>
                    ))}
                </div>
                
                {/* Divider */}
                <div className="border-t border-gray-200 my-4"></div>

                {/* Mobile User Controls (Simplified) */}
                <div className="flex flex-col space-y-2">
                     <Link
                        to="/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left"
                    >
                        <FaUser className="h-5 w-5" /> Profile
                    </Link>
                     <Link
                        to="/settings"
                        onClick={() => setIsMobileMEnuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left"
                    >
                        <FaCog className="h-5 w-5" /> Settings
                    </Link>
                    <Link
                        to="/cart"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left"
                    >
                        <FaShoppingCart className="h-5 w-5" /> My Cart
                    </Link>
                    <button
                        onClick={() => {
                            // Add logout logic
                            setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 w-full text-left text-red-600 hover:text-red-700"
                    >
                        <FaSignOutAlt className="h-5 w-5" /> Log Out
                    </button>
                </div>
            </div> {/* End of Mobile Menu */}
        </header>
    );
}