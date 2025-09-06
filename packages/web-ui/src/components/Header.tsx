import React from 'react';
import { Link } from 'react-router-dom';
import { Upload, Settings, User } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">NV</span>
              </div>
              <span className="text-xl font-bold text-gradient">NebularVault</span>
            </Link>
          </div>
          
          <nav className="flex items-center space-x-4">
            <Link
              to="/upload"
              className="btn-primary btn-sm flex items-center space-x-1"
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </Link>
            
            <Link
              to="/settings"
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </Link>
            
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <User className="w-5 h-5" />
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
