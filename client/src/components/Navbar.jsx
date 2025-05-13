import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-black w-full shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-white text-2xl font-bold tracking-tight">
              {/* Replace with your logo image if needed */}
              SnapStudy
            </Link>
          </div>
          {/* Get Started Button */}
          <div>
            <Link
              to="/signup"
              className="inline-block px-6 py-2 text-sm font-semibold text-black bg-white rounded hover:bg-gray-200 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
