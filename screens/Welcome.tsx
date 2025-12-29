import React from 'react';
import { Leaf, ArrowRight } from 'lucide-react';

interface WelcomeProps {
  onGetStarted: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col items-center justify-between p-6 relative overflow-hidden animate-fade-in">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[55%] bg-gradient-to-b from-primary-600 to-primary-500 rounded-b-[50px] shadow-2xl z-0"></div>
      <div className="absolute top-[-50px] left-[-50px] w-40 h-40 bg-white/10 rounded-full blur-2xl z-0"></div>
      
      {/* Content Top */}
      <div className="relative z-10 flex flex-col items-center pt-24 text-white w-full">
         <div className="w-28 h-28 bg-white/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center mb-8 shadow-inner border border-white/30 transform rotate-3">
            <Leaf size={56} className="text-white drop-shadow-md" />
         </div>
         <h1 className="text-5xl font-bold tracking-tight mb-3">AgriAssist</h1>
         <p className="text-primary-50 text-center text-lg font-medium opacity-90 max-w-[250px]">
            Smart Farming for a Better Future
         </p>
      </div>

      {/* Content Bottom */}
      <div className="relative z-10 w-full space-y-6 mb-8 animate-slide-up">
          <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl border border-white/60">
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Welcome!</h2>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                  Access real-time market rates, expert crop advice, and direct buyer connections—all in one place to help you grow better.
              </p>
              <button 
                onClick={onGetStarted}
                className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold shadow-xl shadow-primary-200 hover:bg-primary-700 active:scale-95 transition-all flex items-center justify-center gap-3 text-lg"
              >
                  Get Started <ArrowRight size={22} />
              </button>
          </div>
          
          <div className="flex justify-center gap-6 text-gray-400">
             <span className="text-xs font-semibold tracking-widest uppercase">Trusted by 10k+ Farmers</span>
          </div>
      </div>
    </div>
  );
};

export default Welcome;