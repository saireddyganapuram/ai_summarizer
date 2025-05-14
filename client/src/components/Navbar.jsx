import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const Navbar = () => {
  return (
    <nav className="bg-black w-full shadow-md">
      <div className="max-w-8xl pl-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Brand Name */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <img src={logo} alt="SnapStudy Logo" className="h-16 w-16 object-contain rounded-full" />
              <span className="text-white text-3xl font-bold tracking-tight">SnapStudy</span>
            </Link>
          </div>
          {/* Get Started Button */}
          <div className="mr-16">
            <Link
              to="/signup"
              className="h-12  w-40 text-lg text-center inline-block px-6 py-2 font-semibold text-black bg-white rounded hover:bg-gray-200 transition"
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
