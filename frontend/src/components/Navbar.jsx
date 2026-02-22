import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, MapPin } from 'lucide-react';

const Navbar = () => {
    return (
        <nav className="fixed bottom-0 w-full z-50 bg-white/90 backdrop-blur-md border-t border-gray-200 shadow-lg pb-safe">
            <div className="flex justify-around items-center h-16 max-w-md mx-auto">
                <NavLink
                    to="/"
                    className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`}
                >
                    <Home size={24} />
                    <span className="text-xs font-medium">Home</span>
                </NavLink>
                <NavLink
                    to="/scan"
                    className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`}
                >
                    <div className="bg-indigo-600 rounded-full p-3 -mt-8 shadow-indigo-300 shadow-lg border-4 border-white">
                        <Compass size={28} className="text-white" />
                    </div>
                    <span className="text-xs font-medium mt-1">Navigate</span>
                </NavLink>
                <NavLink
                    to="/map"
                    className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`}
                >
                    <MapPin size={24} />
                    <span className="text-xs font-medium">Map</span>
                </NavLink>
            </div>
        </nav>
    );
};

export default Navbar;
