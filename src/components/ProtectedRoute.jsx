
// import React, { useEffect, useState } from 'react';
// import { Navigate, useLocation } from 'react-router-dom';

// // Checks authentication by calling /api/users/me

// const ProtectedRoute = ({ children }) => {
// 	const [user, setUser] = useState(null);
// 	const [loading, setLoading] = useState(true);
// 	const location = useLocation();
//     let role = '';
// 	useEffect(() => {
// 		checkAuth();
// 		// eslint-disable-next-line
// 	}, []);

// 	const checkAuth = async () => {
// 		try {
// 			const response = await fetch('/api/users/me', {
// 				credentials: 'include',
// 				cache: 'no-cache',
// 			});
// 			if (response.ok) {
// 				const userData = await response.json();
// 				// Accept userData as the user object directly
//                 role = userData.userRole;
//                 console.log("ProtectedRoute - User role:", role);
// 				setUser(userData.user || userData); // support both {data: user} and user
// 			}
// 		} catch (error) {
// 			// Do nothing, user stays null
// 		} finally {
// 			setLoading(false);
// 		}
// 	};

// 	if (loading) {
// 		return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
// 	}

// 	// Not authenticated - redirect to login
// 	if (!user) {
// 		return <Navigate to="/login" state={{ from: location }} replace />;
// 	}



// 	// Admin restriction - can only access specific admin routes
// 	if (role === 'admin') {
// 		
// 		const allowedAdminRoutes = [
// 			'/admin',
// 			'/admin/dashboard',
// 			'/admin/users',
// 			'/admin/resolve-violations',
// 		];
// 		const isAllowedRoute = allowedAdminRoutes.some(route =>
// 			currentPath === route || currentPath.startsWith(route + '/')
// 		);
// 		if (!isAllowedRoute) {
// 			return <Navigate to="/admin" replace />;
// 		}
// 	}

// 	// Seller restriction - can only access specific seller routes
// 	if (role === 'seller') {
// 		const currentPath = location.pathname;
// 		const allowedSellerRoutes = [
// 			'/seller',
// 			'/seller/dashboard',
// 			'/seller/products',
// 			'/seller/orders',
// 		];
// 		const isAllowedRoute = allowedSellerRoutes.some(route =>
// 			currentPath === route || currentPath.startsWith(route + '/')
// 		);
// 		if (!isAllowedRoute) {
// 			return <Navigate to="/seller" replace />;
// 		}
// 	}

// 	// Buyer restriction - can only access buyer-focused routes
// 	if (role === 'buyer') {
// 		const currentPath = location.pathname;
// 		const allowedBuyerRoutes = [
// 			'/',
// 			'/cart',
// 			'/promotion',
// 			'/user',
// 			'/products',
// 			'/product',
// 			'/resource',
// 			'/private-storage',
// 		];
// 		const isAllowedRoute = allowedBuyerRoutes.some(route =>
// 			currentPath === route || currentPath.startsWith(route + '/')
// 		);
// 		if (!isAllowedRoute) {
// 			return <Navigate to="/" replace />;
// 		}
// 	}

// 	// Shipper restriction - only specific shipper pages
// 	if (role === 'shipper') {
// 		const currentPath = location.pathname;
// 		const allowedShipperRoutes = [
// 			'/shipper-details',
// 			'/shipper',
// 			'/shipper/dashboard',
// 			'/shipper/shipments',
// 			'/shipper/pickups',
// 		];
// 		const isAllowedRoute = allowedShipperRoutes.some(route =>
// 			currentPath === route || currentPath.startsWith(route + '/')
// 		);
// 		if (!isAllowedRoute) {
// 			return <Navigate to="/" replace />;
// 		}
// 	}

// 	return children;
// };
// export default ProtectedRoute;


import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userRole, setRole] = useState('');
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        checkAuth();
        // eslint-disable-next-line
    }, []);

    const checkAuth = async () => {
        try {
            const response = await fetch('/api/users/me', {
                credentials: 'include',
                cache: 'no-cache',
            });
            console.log("ProtectedRoute: Checking authentication...");
            if (response.ok) {
                const userData = await response.json();
                // Lưu toàn bộ object user vào state để dùng sau này
                // Giả sử userData trả về cấu trúc: { user: { role: '...', ... } } hoặc trực tiếp user
                setUser(userData.user || userData); 
                setRole(userData.userRole || (userData.user && userData.user.role) || userData.role);
            }
        } catch (error) {
            console.error("Auth check failed", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    // 1. Chưa đăng nhập -> Đá về Login
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Lấy role hiện tại từ user state (đảm bảo biến không bị reset)
    // Lưu ý: Kiểm tra xem API trả về là 'role' hay 'userRole' để sửa lại cho đúng
    const currentPath = location.pathname;

    console.log(`ProtectedRoute: User is authenticated with role: ${userRole}, accessing path: ${currentPath}`);

    // =========================================================
    // KHU VỰC ĐỊNH NGHĨA CÁC TRANG CẦN BẢO VỆ (SENSITIVE ZONES)
    // =========================================================

    if (userRole === 'admin') {
        
        const allowedAdminRoutes = [
            '/admin',
            '/admin/dashboard',
            '/admin/users', 
            '/admin/resolve-violations'
        ];
        
        const isAllowedRoute = allowedAdminRoutes.some(route => 
            currentPath === route || currentPath.startsWith(route + '/')
        );
        
        if (!isAllowedRoute) {
            console.log(`Admin trying to access forbidden route: ${currentPath}, redirecting to /admin`);
            return <Navigate to="/admin" replace />;
        }
    }

    if (userRole === 'seller') {
        
        const allowedSellerRoutes = [
        '/seller',
        '/seller/seller-dashboard',
        '/seller/products',
        '/seller/orders',
        '/seller/add-product',
        '/profile'
        ];

        const isAllowedRoute = allowedSellerRoutes.some(route =>
        currentPath === route || currentPath.startsWith(route + '/')
        );
        
        if (!isAllowedRoute) {
        console.log(`Seller trying to access forbidden route: ${currentPath}, redirecting to /seller`);
        return <Navigate to="/seller" replace />;
        }
    }

    if (userRole === 'shipper') {
        
        const allowedshipperRoutes = [
        '/shipper',
        '/shipper-details',
        '/shipper/products',
        '/shipper/orders',
        '/profile'
        ];

        const isAllowedRoute = allowedshipperRoutes.some(route =>
        currentPath === route || currentPath.startsWith(route + '/')
        );
        
        if (!isAllowedRoute) {
        console.log(`shipper trying to access forbidden route: ${currentPath}, redirecting to /shipper`);
        return <Navigate to="/shipper-details" replace />;
        }
    }

    if (userRole === 'buyer') {

        const allowedBuyerRoutes = [
            '/',
            '/cart',
            '/home',
            '/profile',
            '/checkout',
            '/payment',
            '/buyer/orders',
            '/write-review',
            '/review',
            '/product',
        ];

        const isAllowedRoute = allowedBuyerRoutes.some(route => 
            currentPath === route || currentPath.startsWith(route + '/')
        );
        
        if (!isAllowedRoute) {
            console.log(`Buyer trying to access forbidden route: ${currentPath}, redirecting to /`);
            return <Navigate to="/" replace />;
        }
    }

    // Allow access to /products for any authenticated user
    if (currentPath.startsWith('/products')) {
        return children;
    }

    return children;
};

export default ProtectedRoute;
