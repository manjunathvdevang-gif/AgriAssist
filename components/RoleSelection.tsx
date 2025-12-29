import React from 'react';
import { Sprout, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';

interface RoleSelectionProps {
  onSelectRole: (role: 'farmer' | 'consumer') => void;
  onBack: () => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelectRole, onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 animate-fade-in relative">
      
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 z-20 p-2 bg-white rounded-full text-gray-600 hover:bg-gray-100 transition-colors shadow-sm border border-gray-100"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="text-center mb-10">
        <div className="bg-primary-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-200">
           <Sprout size={48} className="text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">AgriAssist</h1>
        <p className="text-gray-500">Smart Farming & Direct Marketplace</p>
      </div>

      <div className="w-full max-w-sm space-y-6">
        
        {/* Farmer Card */}
        <button 
          onClick={() => onSelectRole('farmer')}
          className="w-full bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md hover:border-primary-200 transition-all group text-left relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 w-24 h-24 bg-green-50 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center shrink-0 relative z-10">
             <Sprout size={32} className="text-green-700" />
          </div>
          <div className="relative z-10">
             <h3 className="text-xl font-bold text-gray-800 group-hover:text-green-700 transition-colors">I am a Farmer</h3>
             <p className="text-sm text-gray-500 mt-1">Manage crops, get advice & sell produce.</p>
          </div>
          <div className="absolute bottom-6 right-6 text-gray-300 group-hover:text-green-500 transition-colors">
              <ArrowRight size={24} />
          </div>
        </button>

        {/* Consumer Card */}
        <button 
           onClick={() => onSelectRole('consumer')}
           className="w-full bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md hover:border-orange-200 transition-all group text-left relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 w-24 h-24 bg-orange-50 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center shrink-0 relative z-10">
             <ShoppingBag size={32} className="text-orange-700" />
          </div>
          <div className="relative z-10">
             <h3 className="text-xl font-bold text-gray-800 group-hover:text-orange-700 transition-colors">I am a Consumer</h3>
             <p className="text-sm text-gray-500 mt-1">Buy fresh vegetables & fruits directly.</p>
          </div>
          <div className="absolute bottom-6 right-6 text-gray-300 group-hover:text-orange-500 transition-colors">
              <ArrowRight size={24} />
          </div>
        </button>

      </div>
      
      <p className="mt-12 text-xs text-gray-400">Select your role to continue</p>
    </div>
  );
};

export default RoleSelection;