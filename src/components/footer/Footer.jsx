// File: src/components/footer/Footer.jsx

import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-6 text-sm text-gray-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p>© 2025 Ecommerce Admin. All rights reserved.</p>
        <div className="mt-2 flex justify-center items-center space-x-4">
          <a href="mailto:bktphcmdatabase2023@gmail.com" className="hover:text-[var(--color-primary)]">
            <svg className="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-2 4v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7" />
            </svg>
            bktphcmdatabase2023@gmail.com
          </a>
          <span>|</span>
          <span>+1 (555) 123-4567</span>
          <span>|</span>
          <span>123 Admin St, Business City</span>
        </div>
        <div className="mt-3 flex justify-center space-x-4">
          {/* Social Media Icons (replace with actual links) */}
          <a href="#" className="text-gray-400 hover:text-[var(--color-primary)]"><i className="fab fa-facebook-f"></i>F</a>
          <a href="#" className="text-gray-400 hover:text-[var(--color-primary)]"><i className="fab fa-twitter"></i>T</a>
          <a href="#" className="text-gray-400 hover:text-[var(--color-primary)]"><i className="fab fa-instagram"></i>I</a>
          <a href="#" className="text-gray-400 hover:text-[var(--color-primary)]"><i className="fab fa-linkedin-in"></i>L</a>
        </div>
      </div>
    </footer>
  );
}
