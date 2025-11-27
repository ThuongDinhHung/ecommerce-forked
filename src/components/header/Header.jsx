// File: src/components/header/Header.jsx

import React, { useState, useEffect, useRef } from 'react'; 
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
    FaSearch, FaBars, FaTimes,
    FaUser, FaCog, FaSignOutAlt, FaShoppingCart, FaStar // Thêm FaStar
} from 'react-icons/fa';
import logoImage from '../../assets/logoBKBay.png'; 
import getCurrentUser from '../../services/userService'; 

const DEFAULT_AVATAR = 'https://www.gravatar.com/avatar/?d=mp&s=80';

// [MỚI] Cấu hình Menu theo Role (Đã thêm Review)
const ROLE_MENU_CONFIG = {
    buyer: [
        { key: 'profile', label: 'Profile', to: '/profile', icon: FaUser },
        { key: 'orders', label: 'My Orders', to: '/orders', icon: FaCog },
        { key: 'cart', label: 'My Cart', to: '/cart', icon: FaShoppingCart },
        // Thêm mục Review cho Buyer
        { key: 'write-review', label: 'Write Review', to: '/write-review', icon: FaStar },
        { key: '/product/review', label: 'Review', to: '/product/review', icon: FaStar },
    ],
    shipper: [
        { key: 'profile', label: 'Profile', to: '/profile', icon: FaUser },
        { key: 'shipper-details', label: 'Shipper Details', to: '/shipper-details', icon: FaCog },
        { key: 'shipper-orders', label: 'Orders', to: '/shipper/orders', icon: FaShoppingCart },
    ],
    seller: [
        { key: 'dashboard', label: 'Dashboard', to: '/seller/seller-dashboard', icon: FaCog },
        { key: 'products', label: 'My Products', to: '/seller/products', icon: FaShoppingCart },
    ],
    admin: [
        { key: 'dashboard', label: 'Admin Dashboard', to: '/admin', icon: FaCog },
    ]
};

export default function Header({ showNav = true }) { // Default showNav = true để hiện thanh search
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
  
    const [userAvatar, setUserAvatar] = useState(DEFAULT_AVATAR);
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(''); // Mặc định rỗng
    
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

    const menuRef = useRef(null);

    // Đóng menu khi click ra ngoài
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/api/users/logout', { method: 'POST', credentials: 'include' });
            setCurrentUser(null);
            setUserRole('');
            navigate('/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    }

    // Fetch user logic (Giữ nguyên)
    useEffect(() => {
        let mounted = true;
        const fetchUser = async () => {
            try {
                const userData = await getCurrentUser();
                if (!mounted) return;
                
                // Logic parse user data tùy theo API trả về
                // userData có thể là { success: true, user: {...}, userRole: '...' } 
                // hoặc trực tiếp object user. Cần check kỹ.
                const userObj = userData.user || userData.data || userData; 
                
                if (userObj && userObj.Username) { // Check cơ bản xem có phải user không
                    setCurrentUser(userObj);
                    
                    // Lấy role từ API hoặc fallback về 'buyer'
                    const role = userData.userRole || userObj.role || 'buyer'; 
                    setUserRole(role.toLowerCase());

                    if (userObj.avatar) {
                        setUserAvatar(userObj.avatar);
                    } else {
                        // Fallback avatar
                        setUserAvatar(`https://ui-avatars.com/api/?name=${userObj.Username}&background=random`);
                    }
                } else {
                    setCurrentUser(null);
                    setUserRole('');
                    setUserAvatar(DEFAULT_AVATAR);
                }
            } catch (err) {
                console.error('Error resolving current user:', err);
                if (mounted) {
                    setCurrentUser(null);
                    setUserRole('');
                }
            }
        };
        fetchUser();
        return () => { mounted = false; };
    }, []); 

    // Chọn menu config dựa trên role. Nếu không có role (Guest) thì dùng mảng rỗng hoặc menu mặc định
    const menuItems = ROLE_MENU_CONFIG[userRole] || [];

    return (
        <header className="bg-white shadow-sm py-4 relative z-20"> 
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                
                {/* Logo */}
                <div className="flex items-center">
                    <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-gray-900">
                        <img src={logoImage} alt="BK BAY Logo" className="h-20 w-20 object-contain" /> 
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
                <div className="hidden md:flex items-center space-x-3 relative" ref={menuRef}>
                    <span className="text-gray-700 font-medium">{currentUser ? currentUser.Username : 'Guest'}</span>
                    
                    <div 
                        className="cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowUserMenu(!showUserMenu);
                        }}
                    >
                        <img
                            className="h-9 w-9 rounded-full border-2 border-gray-300 hover:border-blue-500 transition"
                            src={userAvatar}
                            alt="User avatar"
                        />
                    </div>
                    
                    {/* Dropdown Menu */}
                    {showUserMenu && (
                        <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden z-50 animate-fade-in-up">
                            <ul className="py-1 text-sm text-gray-700">
                                <li className="px-4 py-3 text-xs text-gray-500 border-b border-gray-100 bg-gray-50">
                                    Signed in as <br/> <span className="font-bold text-gray-800">{currentUser ? currentUser.Username : 'Guest'}</span>
                                </li>
                                
                                {/* Dynamic Menu Items based on Role */}
                                {menuItems.map(item => {
                                    const Icon = item.icon;
                                    return (
                                        <li key={item.key}>
                                            <Link
                                                to={item.to}
                                                onClick={() => setShowUserMenu(false)}
                                                className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 w-full text-left transition-colors"
                                            >
                                                <Icon className="text-gray-400" /> {item.label}
                                            </Link>
                                        </li>
                                    );
                                })}

                                {/* Nếu là Guest (chưa đăng nhập) thì hiện nút Login */}
                                {!currentUser && (
                                    <li>
                                        <Link
                                            to="/login"
                                            onClick={() => setShowUserMenu(false)}
                                            className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 w-full text-left transition-colors font-bold text-blue-600"
                                        >
                                            <FaUser /> Log In
                                        </Link>
                                    </li>
                                )}

                                {/* Logout Button (Chỉ hiện khi đã đăng nhập) */}
                                {currentUser && (
                                    <li className="border-t border-gray-200 mt-1 pt-1">
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setShowUserMenu(false);
                                            }}
                                            className="flex items-center gap-3 px-4 py-2 hover:bg-red-50 w-full text-left text-red-600 hover:text-red-700 transition-colors"
                                        >
                                            <FaSignOutAlt /> Log Out
                                        </button>
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Mobile Burger Icon */}
                <div className="md:hidden flex items-center">
                      <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="text-gray-900 p-2 rounded-md"
                      >
                        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
                      </button>
                </div>

            </div> 

            {/* Mobile Menu Dropdown */}
            <div className={`md:hidden absolute top-full left-0 w-full bg-white shadow-lg px-4 pt-2 pb-4 space-y-4 transition-all duration-300 ease-in-out z-10 ${isMobileMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-60 pointer-events-none'}`}>
                {/* Mobile Search */}
                <div className="w-full">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                </div>
                
                <div className="border-t border-gray-200 my-4"></div>

                {/* Mobile Dynamic Menu */}
                <div className="flex flex-col space-y-2">
                    {menuItems.map(item => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.key}
                                to={item.to}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 w-full text-left"
                            >
                                <Icon className="h-5 w-5 text-gray-500" /> {item.label}
                            </Link>
                        );
                    })}

                    {currentUser ? (
                        <button
                            onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-red-50 w-full text-left text-red-600"
                        >
                            <FaSignOutAlt className="h-5 w-5" /> Log Out
                        </button>
                    ) : (
                        <Link
                            to="/login"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 w-full text-left text-blue-600 font-bold"
                        >
                            <FaUser className="h-5 w-5" /> Log In
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}