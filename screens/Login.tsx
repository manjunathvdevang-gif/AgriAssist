import React, { useState } from 'react';
import { Sprout, Phone, Lock, ArrowRight, Leaf, ArrowLeft } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
  onBack: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onBack }) => {
  const [mobile, setMobile] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile || !pin) return;
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex flex-col items-center justify-center p-6">
      
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 z-20 p-2 bg-white/50 backdrop-blur-md rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <ArrowLeft size={24} />
      </button>

      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-green-100 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-primary-100 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

      <div className="w-full max-w-sm relative z-10 animate-fade-in">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl shadow-lg shadow-primary-200 mb-6 transform rotate-3">
             <Leaf size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">AgriAssist</h1>
          <p className="text-gray-500 text-sm">Grow Smarter, Sell Better.</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/80 backdrop-blur-xl border border-white shadow-2xl rounded-3xl p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Welcome Back</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Mobile Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 ml-1 uppercase tracking-wider">Mobile Number</label>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus-within:ring-2 focus-within:ring-primary-100 focus-within:border-primary-500 transition-all">
                <Phone size={20} className="text-gray-400 mr-3" />
                <div className="text-gray-500 font-medium border-r border-gray-300 pr-3 mr-3">+91</div>
                <input 
                  type="tel" 
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="98765 43210"
                  className="flex-1 bg-transparent outline-none text-gray-800 font-medium placeholder:text-gray-300 w-full"
                  maxLength={10}
                  required
                />
              </div>
            </div>

            {/* PIN Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 ml-1 uppercase tracking-wider">Security PIN</label>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus-within:ring-2 focus-within:ring-primary-100 focus-within:border-primary-500 transition-all">
                <Lock size={20} className="text-gray-400 mr-3" />
                <input 
                  type="password" 
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••"
                  className="flex-1 bg-transparent outline-none text-gray-800 font-medium placeholder:text-gray-300 w-full"
                  maxLength={4}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button type="button" className="text-xs font-semibold text-primary-600 hover:text-primary-700">
                Forgot PIN?
              </button>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-200 hover:bg-primary-700 active:scale-95 transition-all flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Login Securely
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

          </form>
        </div>

        {/* Footer */}
        <p className="text-center mt-8 text-sm text-gray-500">
          Don't have an account? <button className="text-primary-700 font-bold hover:underline">Sign Up</button>
        </p>

      </div>
      
      {/* Bottom Legal Text */}
      <div className="absolute bottom-6 text-[10px] text-gray-400 text-center w-full px-6">
        By logging in, you agree to our Terms of Service and Privacy Policy.
      </div>

    </div>
  );
};

export default Login;