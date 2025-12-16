import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.svg';

const Navbar = () => {
    return (
        <nav className="bg-slate-800 border-b border-slate-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                            <img className="h-8 w-8" src={logo} alt="OBD.ai" />
                            <span className="text-cyan-400 font-bold text-xl">OBD.ai</span>
                        </Link>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                <Link to="/" className="text-gray-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Home</Link>
                                <Link to="/about" className="text-gray-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">About</Link>
                                <Link to="/contact" className="text-gray-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Contact</Link>
                                <Link to="/my-vehicles" className="text-gray-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">My Vehicles</Link>
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-4 flex items-center md:ml-6">
                            <Link to="/login" className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                                Login / Sign Up
                            </Link>
                        </div>
                    </div>
                    {/* Mobile menu button could go here */}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
