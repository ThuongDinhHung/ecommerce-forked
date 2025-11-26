import React, { useState, useEffect } from 'react';
import { 
    User, Mail, Lock, MapPin, Hash, Eye, EyeOff,
    Briefcase, Phone
} from 'lucide-react';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import { useNavigate } from 'react-router-dom';

import { registerUser, loginUser } from '../../services/authenService';

export default function LoginPage() {

    // Toggle between Login and Register
    const [isLogin, setIsLogin] = useState(true);

    // Show/hide password
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [registerSuccess, setRegisterSuccess] = useState('');
    const [ageError, setAgeError] = useState('');


    // Form data
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        age: '',
        address: '',
        dateOfBirth: '',
        phoneNumber: '',
        gender: '',
        role: 'Buyer',
        company: '',
        license: ''
    });

    // Mount animation state
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 40);
        return () => clearTimeout(t);
    }, []);

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Calculate age when dateOfBirth changes
        if (name === 'dateOfBirth') {
            const age = calculateAge(value);
            setFormData(prev => ({
                ...prev,
                dateOfBirth: value,
                age: age
            }));
            
            // Validate age
            if (age !== '' && age < 13) {
                setAgeError('You must be at least 13 years old to register.');
            } else {
                setAgeError('');
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Calculate age from date of birth
    const calculateAge = (dateOfBirth) => {
        if (!dateOfBirth) return '';
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    // --- LOGIN SUBMIT ---
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoginError('');
        try {
            const response = await loginUser({
                email: formData.email,
                password: formData.password
            });
            console.log('Login success:', response);

            // Normalize different response shapes to find the user object
            const userObj = response.user || response.data || response;
            const roleRaw = userObj?.userRole?.role || userObj?.role || userObj?.userRole || '';
            const role = String(roleRaw || '').toLowerCase();

            // Redirect based on role
            if (role.includes('admin')) {
                navigate('/admin');
            } else if (role.includes('seller')) {
                navigate('/seller/dashboard');
            } else if (role.includes('shipper')) {
                navigate('/shipper-details');
            } else {
                // default buyer/home
                navigate('/');
            }
        } catch (error) {
            console.error(error);
            if (error.status === 401) {
                setLoginError("Incorrect email or password.");
            } else {
                setLoginError("An unexpected error occurred. Please try again.");
            }
        }
    };

    // --- REGISTER SUBMIT ---
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        
        // Validate age before submission
        if (formData.age < 13) {
            setAgeError('You must be at least 13 years old to register.');
            return;
        }
        
        setAgeError('');
        try {
            const result = await registerUser(formData);
            console.log('Register result:', result);

            // If registration response includes the user and you want to auto-login/redirect
            const createdUser = result.user || result.data || result;
            const roleRaw = createdUser?.userRole?.role || createdUser?.role || createdUser?.userRole || '';
            const role = String(roleRaw || '').toLowerCase();

            if (role) {
                // If server returned user and role, redirect them directly
                if (role.includes('admin')) navigate('/admin');
                else if (role.includes('seller')) navigate('/seller/dashboard');
                else if (role.includes('shipper')) navigate('/shipper-details');
                else navigate('/');
                return; // stop further UI changes
            }

            // Otherwise, show success message and switch to login form
            setRegisterSuccess('Registration successful — you can now log in.');
            setLoginError('');
            setIsLogin(true);
            // clear success message after 5 seconds
            setTimeout(() => setRegisterSuccess(''), 5000);
        } catch (error) {
            console.error('Form submission error:', error.message);
        }
    };

    return (
        <div>
            <Header />
            <div className="min-h-screen bg-linear-to-br from-sky-50 via-indigo-50 to-white flex items-center justify-center p-4 md:p-8 font-sans cursor-default">

                {registerSuccess && (
                    <div className="fixed top-6 right-6 z-50">
                        <div className="max-w-sm w-full bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg shadow-lg flex items-start gap-3">
                            <div className="text-2xl">✅</div>
                            <div className="flex-1 text-sm">{registerSuccess}</div>
                            <button onClick={() => setRegisterSuccess('')} aria-label="Close" className="ml-3 text-emerald-800 hover:text-emerald-900">✕</button>
                        </div>
                    </div>
                )}

                <div className={`max-w-4xl w-full rounded-2xl shadow-2xl overflow-hidden border border-slate-100 transform transition-all duration-500 bg-white/95 ${mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'}`}>

                    {/* HEADER */}
                    <div className="bg-primary p-6 md:p-10 text-center">
                        <h2 className="text-3xl font-extrabold text-white tracking-tight">
                            {isLogin ? "Login" : "Create Account"}
                        </h2>
                        <p className="text-indigo-200 mt-2 text-sm">
                            {isLogin 
                                ? "Welcome back — please log in." 
                                : "Fill in all fields to complete your registration"}
                        </p>
                    </div>

                    {/* --- LOGIN FORM --- */}
                    {isLogin ? (
                        <form onSubmit={handleLoginSubmit} className="p-6 md:p-10">

                            {/* Email */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 text-primary" size={18} />
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-transparent shadow-sm transition"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="mb-8">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 text-primary" size={18} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        required
                                        className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-transparent shadow-sm transition"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Login error dropdown */}
                            {loginError && (
                                <p className="text-red-500 text-sm mb-4 text-center">
                                    {loginError}
                                </p>
                            )}
                            {/* Login Button */}
                            <button className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:brightness-105 active:scale-95 transform transition duration-150 cursor-pointer">
                                Login
                            </button>

                            <p className="text-center mt-4 text-slate-500 text-sm">
                                Don’t have an account?{" "}
                                <span 
                                    onClick={() => setIsLogin(false)} 
                                    className="text-primary font-semibold cursor-pointer">
                                    Register here
                                </span>
                            </p>
                        </form>
                    ) : (
                    /* --- REGISTER FORM (Your existing form) --- */
                    <form onSubmit={handleRegisterSubmit} className="p-6 md:p-10">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                            {/* Left Column */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-slate-800 border-b pb-3 mb-4">
                                    Account Details
                                </h3>

                                {/* Username */}
                                <div className="relative">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 text-primary" size={18} />
                                        <input
                                            type="text"
                                            name="username"
                                            required
                                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-transparent shadow-sm transition"
                                            value={formData.username}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="relative">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 text-primary" size={18} />
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-transparent shadow-sm transition"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="relative">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 text-primary" size={18} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            required
                                            className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-transparent shadow-sm transition"
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Role */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-3 text-primary" size={18} />
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-transparent transition"
                                        >
                                            <option value="Buyer">Buyer</option>
                                            <option value="Seller">Seller</option>
                                            <option value="Shipper">Shipper</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Company - Only for Shipper */}
                                {formData.role === 'Shipper' && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-3 top-3 text-primary" size={18} />
                                            <select
                                                name="company"
                                                value={formData.company}
                                                onChange={handleChange}
                                                required
                                                className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-transparent transition"
                                            >
                                                <option value="">Select Company</option>
                                                <option value="GRAB">GRAB</option>
                                                <option value="SHOPEE">SHOPEE</option>
                                                <option value="GIAOHANGNHANH">GIAOHANGNHANH</option>
                                                <option value="GIAOHANGTIETKIEM">GIAOHANGTIETKIEM</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {/* License - Only for Shipper */}
                                {formData.role === 'Shipper' && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">License Number</label>
                                        <div className="relative">
                                            <Hash className="absolute left-3 top-3 text-primary" size={18} />
                                            <input
                                                type="text"
                                                name="license"
                                                required
                                                placeholder="Enter your license number"
                                                className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-transparent shadow-sm transition"
                                                value={formData.license}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-slate-800 border-b pb-3 mb-4">
                                    Personal Information
                                </h3>

                                {/* Date of Birth & Calculated Age */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        required
                                        max={new Date().toISOString().split('T')[0]}
                                        className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-transparent shadow-sm transition"
                                        value={formData.dateOfBirth}
                                        onChange={handleChange}
                                    />
                                    {formData.age !== '' && (
                                        <p className="mt-1 text-sm text-slate-600">
                                            Age: {formData.age} years old
                                        </p>
                                    )}
                                    {ageError && (
                                        <p className="mt-1 text-sm text-red-600 font-medium">
                                            {ageError}
                                        </p>
                                    )}
                                </div>

                                {/* Phone */}
                                <div className="relative">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                                    <Phone className="absolute left-3 top-9 text-primary" size={18} />
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        required
                                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-transparent shadow-sm transition"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Gender */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Gender</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <label className={`cursor-pointer border rounded-xl text-black p-3 text-center transition hover:shadow-sm hover:bg-slate-50 ${formData.gender === 'Male' ? 'bg-indigo-50 border-indigo-500' : ''}`}>
                                            <input
                                                type="radio"
                                                name="gender"
                                                value="Male"
                                                checked={formData.gender === 'Male'}
                                                onChange={handleChange}
                                                className="sr-only"
                                            />
                                            Male
                                        </label>

                                        <label className={`cursor-pointer border rounded-xl text-black p-3 text-center transition hover:shadow-sm hover:bg-slate-50 ${formData.gender === 'Female' ? 'bg-pink-50 border-pink-500' : ''}`}>
                                            <input
                                                type="radio"
                                                name="gender"
                                                value="Female"
                                                checked={formData.gender === 'Female'}
                                                onChange={handleChange}
                                                className="sr-only"
                                            />
                                            Female
                                        </label>
                                    </div>
                                </div>

                                {/* Address */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                                    <div className="relative">
                                        <MapPin className="absolute top-3 left-3 text-primary" size={18} />
                                        <textarea
                                            name="address"
                                            rows="3"
                                            required
                                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-transparent shadow-sm transition"
                                            value={formData.address}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Register Button */}
                        <div className="mt-10 pt-6 border-t border-slate-100">
                            <button className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:brightness-105 active:scale-95 transform transition duration-150 cursor-pointer">
                                Register Account
                            </button>

                            <p className="text-center mt-4 text-slate-500 text-sm">
                                Already have an account?{" "}
                                <span
                                    onClick={() => setIsLogin(true)}
                                    className="text-primary font-semibold cursor-pointer"
                                >
                                    Log in here
                                </span>
                            </p>
                        </div>

                    </form>
                    )}

                </div>
            </div>
            <Footer />
        </div>
    );
}
