// File: D:/Ecommerce/src/pages/Home/HomePage.jsx

import React from 'react';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import { useNavigate } from 'react-router-dom';

// Import your image correctly (adjust path if needed)
import logoImage from '../../assets/logoBKBay.png'; // Corrected path assumption

export default function HomePage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
            <Header />

            <main>
                {/* Hero Section */}
                <section
                    className="relative bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-border-primary)] text-white py-20 md:py-32 overflow-hidden"
                >
                    {/* Overlay for readability */}
                    <div className="absolute inset-0 bg-black opacity-50"></div>
                    
                    {/* Content */}
                    <div className="relative z-10 container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="md:w-1/2 text-center md:text-left">
                            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 animate-fade-in-up">
                                Buy it, sell it, love it
                            </h1>
                            <p className="text-lg md:text-xl mb-8 opacity-90 animate-fade-in-up delay-200">
                                Whatever it is, you can get it on BKBay
                            </p>
                            {/* Uncommented and modified buttons */}
                            <div className="flex justify-center md:justify-start gap-4 animate-fade-in-up delay-400">
                                <button 
                                    onClick={() => navigate("/user")} // Navigate to User Details
                                    className="px-8 py-3 bg-white text-[var(--color-primary)] font-bold rounded-full shadow-lg hover:bg-gray-100 transform hover:scale-105 transition duration-300"
                                >
                                    User
                                </button>
                                <button 
                                    onClick={() => navigate("/shipper-details")} // Navigate to Shipper Details
                                    className="px-8 py-3 bg-white text-[var(--color-primary)] font-bold rounded-full shadow-lg hover:bg-gray-100 transform hover:scale-105 transition duration-300"
                                >
                                    Manage Shipper
                                </button>
                                <button 
                                    onClick={() => navigate("/review")} // Navigate to Seller Report
                                    className="px-8 py-3 border-2 border-white text-white font-bold rounded-full shadow-lg hover:bg-white hover:text-[var(--color-primary)] transform hover:scale-105 transition duration-300"
                                >
                                    Review
                                </button>
                                <button 
                                    onClick={() => navigate("/cart")} // Navigate to Shipper Details
                                    className="px-8 py-3 bg-white text-[var(--color-primary)] font-bold rounded-full shadow-lg hover:bg-gray-100 transform hover:scale-105 transition duration-300"
                                >
                                    Cart
                                </button>
                                <button 
                                    onClick={() => navigate("/promotion")} // Navigate to Shipper Details
                                    className="px-8 py-3 bg-white text-[var(--color-primary)] font-bold rounded-full shadow-lg hover:bg-gray-100 transform hover:scale-105 transition duration-300"
                                >
                                    Promotion
                                </button>
                            </div>
                        </div>
                        
                        {/* Image Placeholder */}
                        <div className="md:w-1/2 flex justify-center md:justify-end mt-10 md:mt-0 animate-fade-in-right delay-600">
                            {/* Corrected image path: use imported image directly */}
                            <img 
                                src={logoImage} 
                                alt="Learning illustration" 
                                className="rounded-lg object-cover max-w-full h-auto"
                            />
                        </div>
                    </div>
                </section>

                {/* Call to Action Section (Kept as is for login) */}
                <section className="bg-[var(--color-secondary)] py-20 text-white text-center">
                    <div className="container mx-auto px-6">
                        <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Ready to join with us?</h2>
                        <p className="text-xl opacity-90 mb-10">Buy thousands of items today.</p>
                        <button 
                            className="px-10 py-4 bg-white text-[var(--color-primary)] font-bold text-lg rounded-full shadow-lg 
                                      hover:bg-gray-100 transform hover:scale-105 transition duration-300 cursor-pointer"
                            onClick={() => navigate("/login")}> {/* This navigates to /login */}
                            Sign Up Now
                        </button>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}