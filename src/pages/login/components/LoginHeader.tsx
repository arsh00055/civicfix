// Clean version - animations defined in global CSS
import React from 'react';

interface LoginHeaderProps {
  className?: string;
}

const LoginHeader: React.FC<LoginHeaderProps> = ({ className = '' }) => {
  return (
    <div className={`text-center ${className}`}>
      <div className="flex items-center justify-center space-x-4 mb-6">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 via-blue-500 to-cyan-400 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/40">
            <div className="w-12 h-12 bg-gradient-to-br from-white to-blue-100 rounded-full relative overflow-hidden">
              <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-blue-200/40 rounded-full"></div>
              <div className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-cyan-100/50 rounded-full"></div>
              <div className="absolute top-3/4 left-1/2 w-4 h-1 bg-purple-200/30 rounded-full"></div>
            </div>
            <div className="absolute -inset-3 border border-cyan-400/30 rounded-full animate-spin-very-slow"></div>
          </div>
          <div className="absolute -top-2 -right-2 w-3 h-3 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/40 animate-orbit-slow"></div>
          <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-purple-400 rounded-full shadow-lg shadow-purple-400/40 animate-orbit-slower"></div>
        </div>
        
        <div className="text-left">
          <h1 className="text-3xl font-bold text-black tracking-tight">
            Community<span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Fix</span>
          </h1>
          <p className="text-gray-900 text-sm mt-1">Connecting communities across the universe</p>
        </div>
      </div>

      <div className="flex justify-center space-x-12 text-sm text-gray-900 mb-2">
        <div className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm">
          <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
          <span>10K+ Issues Fixed</span>
        </div>
        <div className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm">
          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
          <span>5K+ Active Heroes</span>
        </div>
      </div>
    </div>
  );
};

export default LoginHeader;