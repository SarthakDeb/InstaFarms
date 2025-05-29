import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, UserCircle, Users, Sprout } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  
  const authToken = localStorage.getItem('authToken');
  const authUser = localStorage.getItem('authUser');
  const isAuthenticated = authToken && authUser;

  const handleSignOut = async () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    
    // Navigate to login
    navigate('/login');
    window.location.reload();
  };

  return (
    <nav className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 shadow-2xl sticky top-0 z-50 backdrop-blur-md">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center gap-3 text-white hover:text-emerald-100 transition-all duration-300 transform hover:scale-105"
            >
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                <Sprout size={32} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-2xl tracking-tight">InstaFarm</span>
                <span className="text-xs text-emerald-100 font-medium tracking-widest uppercase">Society</span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            {/* Society Link */}
            <Link
              to="/society"
              className="group flex items-center gap-2 px-4 py-2 rounded-xl text-white hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              <Users size={20} className="group-hover:rotate-12 transition-transform duration-300" />
              <span className="font-semibold text-sm tracking-wide">Society</span>
            </Link>

            {/* Profile Link - Only show if user is authenticated */}
            {isAuthenticated && (
              <Link
                to="/profile"
                className="group flex items-center gap-2 px-4 py-2 rounded-xl text-white hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <UserCircle size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                <span className="font-semibold text-sm tracking-wide">Profile</span>
              </Link>
            )}

            {isAuthenticated ? (
              <button
                onClick={handleSignOut}
                className="group flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5"
              >
                <LogOut size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="group flex items-center gap-2 px-6 py-3 bg-white text-emerald-600 hover:bg-emerald-50 rounded-xl font-bold text-sm tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5"
              >
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400"></div>
    </nav>
  );
};

export default Navbar;