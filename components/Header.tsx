import React from 'react';
import { Leaf, UserCircle, ArrowLeft } from 'lucide-react';

interface HeaderProps {
  onProfileClick: () => void;
  onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onProfileClick, onBack }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-2">
        {onBack && (
            <button 
                onClick={onBack} 
                className="flex items-center gap-1 mr-1 p-1.5 -ml-1 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
                aria-label="Go Back"
            >
                <ArrowLeft size={20} />
                <span className="text-sm font-semibold hidden sm:inline">Back</span>
            </button>
        )}
        <div className="bg-primary-100 p-2 rounded-full">
            <Leaf className="text-primary-600 w-5 h-5" fill="currentColor" />
        </div>
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">AgriAssist</h1>
      </div>
      <button onClick={onProfileClick} className="text-gray-500 hover:text-primary-600 transition-colors">
        <UserCircle size={28} />
      </button>
    </header>
  );
};

export default Header;