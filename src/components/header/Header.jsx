// File: src/components/header/Header.jsx

// --- FIX 1: Add all missing imports ---
import React, { useState, useEffect } from 'react'; 
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { 
    FaSearch, FaChevronDown, FaBars, FaTimes,
    FaUser, FaCog, FaSignOutAlt, FaShoppingCart 
} from 'react-icons/fa';
import logoImage from '../../assets/logoBKBay.png'; // Assuming this path is correct
import getCurrentUser from '../../services/userService'; // If needed for user data

// default avatar (Gravatar 'mystery person' silhouette)
const DEFAULT_AVATAR = 'https://www.gravatar.com/avatar/?d=mp&s=80';

// Role-based menu configuration
const ROLE_MENU_CONFIG = {
    buyer: [
        { key: 'profile', label: 'Profile', to: '/profile', icon: FaUser },
        { key: 'orders', label: 'My Orders', to: '/orders', icon: FaCog },
        { key: 'cart', label: 'My Cart', to: '/cart', icon: FaShoppingCart },
    ],
    shipper: [
        { key: 'profile', label: 'Profile', to: '/profile', icon: FaUser },
        { key: 'shipper-details', label: 'Shipper Details', to: '/shipper-details', icon: FaCog },
        { key: 'shipper-orders', label: 'Orders', to: '/shipper/orders', icon: FaShoppingCart },
    ],
    // Extend here: seller, admin, etc.
};

export default function Header({showNav=false}) {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
  
    const [userAvatar, setUserAvatar] = useState(DEFAULT_AVATAR);
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState('');
    
    // --- FIX 3: Define missing state ---
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

    // --- FIX 4: Define missing link class function for mobile ---
    // This uses Tailwind classes. 'bg-secondary' must be defined in your index.css
    const mobileLinkClassName = ({ isActive }) =>
        `block text-base font-bold uppercase tracking-wider hover:bg-secondary transition-colors px-3 py-2 rounded-md ${
            isActive ? "bg-secondary text-white" : "text-gray-900" // Adjusted for white mobile bg
        }`;
    
    const handleLogout = async () => {
        // Add your logout logic here
        try {
            await fetch('/api/users/logout', {
                method: 'POST',
                credentials: 'include',
            });
            setCurrentUser(null);
            // Optionally redirect to login page
            navigate('/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    }

    // Fetch current user once on mount
    useEffect(() => {
        let mounted = true;
        const fetchUser = async () => {
            try {
                const userData = await getCurrentUser();
                // console.log('Current user data:', userData);
                if (!mounted) return;
                if (userData && (userData.user || userData.data || userData)) {
                    const parsed = userData.user || userData.data || userData;
                    setCurrentUser(parsed);
                    const r = userData.userRole
                    setUserRole(r);
                    // If your API returns an avatar URL on the user object, prefer it
                    if (parsed.avatar) {
                        setUserAvatar(parsed.avatar);
                    } else {
                        // Fallback to a random avatar service asynchronously; if that fails, use DEFAULT_AVATAR
                        fetch('https://randomuser.me/api/?gender=female&inc=picture')
                            .then(response => response.json())
                            .then(data => {
                                if (data.results && data.results.length > 0) {
                                    if (mounted) setUserAvatar(data.results[0].picture.thumbnail);
                                } else if (mounted) {
                                    setUserAvatar(DEFAULT_AVATAR);
                                }
                            })
                            .catch(error => {
                                console.error('Error fetching random user avatar:', error);
                                if (mounted) setUserAvatar(DEFAULT_AVATAR);
                            });
                    }
                } else {
                    // no logged-in user
                    setCurrentUser(null);
                    setUserAvatar(DEFAULT_AVATAR);
                }
            } catch (err) {
                console.error('Error resolving current user:', err);
                if (mounted) setCurrentUser(null);
            }
        };
        fetchUser();
        return () => { mounted = false; };
    }, []); // Empty dependency array means this runs once on mount
    console.log('Header: Current user:', currentUser);
    console.log('Header: User role:', userRole);
    console.log('Header: Available configs:', Object.keys(ROLE_MENU_CONFIG));

    const menuRole = ROLE_MENU_CONFIG[userRole] ? userRole : '';
    console.log('Header: Menu role selected:', menuRole);

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

                {/* Search Bar (Desktop) */}
                {showNav && (
                    <div className="hidden md:flex flex-1 max-w-md mx-8">
                        <div className="relative w-full">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        setSearchParams({ search: searchInput });
                                    }
                                }}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                    </div>
                )}

                {/* User Profile & Menu (Desktop) */}
                <div className="hidden md:flex items-center space-x-3 relative">
                    <span className="text-gray-700 font-medium">{currentUser ? currentUser.Username : 'Guest'}</span>
                    <img
                        className="h-9 w-9 rounded-full cursor-pointer border-2 border-gray-300"
                        src={userAvatar}
                        alt="User avatar"
                        onClick={() => setShowUserMenu(!showUserMenu)} // Add click handler
                    />
                    
                    {/* --- USER MENU DROPDOWN (DESKTOP) --- */}
                                        {showUserMenu && (
                        <div className="absolute top-full right-0 mt-2 w-52 bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden z-50">
                            <ul className="py-1 text-sm text-gray-700">
                                <li className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                                    Welcome, {currentUser ? currentUser.Username : 'Guest'}
                                </li>
                                {/* Role-specific menu (driven by ROLE_MENU_CONFIG) */}
                                {(ROLE_MENU_CONFIG[menuRole] || []).map(item => {
                                    const Icon = item.icon || FaUser;
                                    return (
                                        <li key={item.key}>
                                            <Link
                                                to={item.to}
                                                onClick={() => setShowUserMenu(false)}
                                                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left"
                                            >
                                                <Icon className="h-5 w-5" /> {item.label}
                                            </Link>
                                        </li>
                                    );
                                })}
                                <li className="border-t border-gray-200 mt-1 pt-1">
                                    <button
                                        onClick={() => {
                                            // Add your logout logic here
                                            handleLogout();
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
                {/* Mobile Search Bar */}
                <div className="w-full">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    setSearchParams({ search: searchInput });
                                    setIsMobileMenuOpen(false);
                                }
                            }}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                </div>
                
                {/* Divider */}
                <div className="border-t border-gray-200 my-4"></div>

                {/* Mobile User Controls - Role-based */}
                <div className="flex flex-col space-y-2">
                    {(ROLE_MENU_CONFIG[menuRole] || []).map(item => {
                        const Icon = item.icon || FaUser;
                        return (
                            <Link
                                key={item.key}
                                to={item.to}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left"
                            >
                                <Icon className="h-5 w-5" /> {item.label}
                            </Link>
                        );
                    })}
                    <button
                        onClick={() => {
                            handleLogout();
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